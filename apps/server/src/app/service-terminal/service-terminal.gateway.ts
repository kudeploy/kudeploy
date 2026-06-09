import { Logger } from '@nest-boot/logger';
import { RequestContext } from '@nest-boot/request-context';
import { CoreV1Api, Exec } from '@kubernetes/client-node';
import type { V1Pod, V1Status } from '@kubernetes/client-node';
import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PassThrough, Writable } from 'stream';

import {
  DEPLOYMENT_LABEL,
  buildServicePodLabelSelector,
} from '@/app/kubernetes-metrics/promql';
import { ServiceService } from '@/app/service/service.service';
import { Workspace } from '@/app/workspace/workspace.entity';

import { ServiceTerminalGuard } from './service-terminal.guard';

interface ServiceTerminalSession {
  closed?: boolean;
  stdin: PassThrough;
  stdout: ServiceTerminalOutputStream;
  webSocket?: { close: () => void };
}

interface ServiceTerminalStartPayload {
  projectId?: string | null;
  serviceId?: string | null;
}

const SERVICE_TERMINAL_SHELLS = [['/bin/sh']];
const SERVICE_TERMINAL_SOCKET_PATH = '/api/socket.io';
const SHELL_STARTUP_GRACE_MS = 1500;
const NO_INTERACTIVE_SHELL_MESSAGE =
  'Unable to start an interactive shell in this container. Ensure the image includes /bin/sh.';

@WebSocketGateway({
  namespace: 'service-terminal',
  path: SERVICE_TERMINAL_SOCKET_PATH,
})
export class ServiceTerminalGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly sessions = new Map<string, ServiceTerminalSession>();

  constructor(
    private readonly logger: Logger,
    private readonly serviceService: ServiceService,
    private readonly coreV1Api: CoreV1Api,
    private readonly exec: Exec,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log('Service terminal socket connected', {
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.closeSession(client.id);
    this.logger.log('Service terminal socket disconnected', {
      clientId: client.id,
    });
  }

  @UseGuards(ServiceTerminalGuard)
  @SubscribeMessage('start')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ServiceTerminalStartPayload = {},
  ) {
    const ctx: RequestContext | undefined = client.data.ctx;

    if (!ctx) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    await RequestContext.run(ctx, async () => {
      try {
        const workspace = RequestContext.get(Workspace);
        const projectId = payload.projectId?.trim();
        const serviceId = payload.serviceId?.trim();

        if (!workspace) {
          client.emit('error', { message: 'Workspace not found' });
          return;
        }

        if (!projectId || !serviceId) {
          client.emit('error', {
            message: 'Project ID and service ID are required',
          });
          return;
        }

        this.closeSession(client.id);

        const service = await this.serviceService.findService(
          workspace,
          projectId,
          serviceId,
        );

        if (!service) {
          client.emit('error', { message: 'Service not found' });
          return;
        }

        const pod = await this.findServicePod(
          workspace,
          projectId,
          serviceId,
          service.activeDeploymentName ?? service.latestDeploymentName,
        );
        const podName = pod.metadata?.name;
        const containerName = pod.spec?.containers?.[0]?.name;

        if (!podName || !containerName) {
          client.emit('error', {
            message: 'No running pods found for this service',
          });
          return;
        }

        const session = await this.startShellSession({
          client,
          containerName,
          podName,
          projectId,
          serviceId,
        });

        if (!client.connected) {
          this.closeSession(client.id, session);
          return;
        }

        this.sessions.set(client.id, session);
        client.emit('started');
      } catch (error) {
        this.logger.error('Service terminal start failed', {
          clientId: client.id,
          error: getErrorMessage(error, 'Service terminal failed'),
        });
        client.emit('error', {
          message: getErrorMessage(error, 'Service terminal failed'),
        });
      }
    });
  }

  @SubscribeMessage('data')
  handleData(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { data?: string } = {},
  ) {
    const session = this.sessions.get(client.id);

    if (session && typeof payload.data === 'string') {
      session.stdin.write(payload.data);
    }
  }

  @SubscribeMessage('resize')
  handleResize(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { cols?: number; rows?: number } = {},
  ) {
    const session = this.sessions.get(client.id);

    if (
      !session ||
      !isPositiveInteger(payload.cols) ||
      !isPositiveInteger(payload.rows)
    ) {
      return;
    }

    session.stdout.resize(payload.cols, payload.rows);
  }

  private async startShellSession({
    client,
    containerName,
    podName,
    projectId,
    serviceId,
  }: {
    client: Socket;
    containerName: string;
    podName: string;
    projectId: string;
    serviceId: string;
  }): Promise<ServiceTerminalSession> {
    for (const command of SERVICE_TERMINAL_SHELLS) {
      const stdin = new PassThrough();
      const stdout = new ServiceTerminalOutputStream(client);
      const stderr = new ServiceTerminalOutputStream(client);
      const session: ServiceTerminalSession = { stdin, stdout };
      let activeSession = false;
      let startupStatusResolved = false;
      let resolveStartupStatus: (status: V1Status | null) => void = () => {};
      const startupStatus = new Promise<V1Status | null>((resolve) => {
        resolveStartupStatus = resolve;
        const timeout = setTimeout(() => {
          startupStatusResolved = true;
          resolve(null);
        }, SHELL_STARTUP_GRACE_MS);

        timeout.unref?.();
      });

      try {
        session.webSocket = await this.exec.exec(
          projectId,
          podName,
          containerName,
          command,
          stdout,
          stderr,
          stdin,
          true,
          (status) => {
            this.logger.debug('Service terminal status changed', {
              clientId: client.id,
              command,
              projectId,
              serviceId,
              status,
            });

            if (!startupStatusResolved) {
              startupStatusResolved = true;
              resolveStartupStatus(status);
            }

            if (!activeSession || session.closed) {
              return;
            }

            if (isFailureStatus(status)) {
              client.emit('error', {
                message: getTerminalStatusMessage(status),
              });
            } else {
              client.emit('ended');
            }

            this.closeSession(client.id, session);
          },
        );
      } catch (error) {
        this.closeSession(client.id, session);

        if (isMissingShellError(error)) {
          this.logger.debug('Service terminal shell candidate failed', {
            clientId: client.id,
            command,
            error: getErrorMessage(error, 'Service terminal failed'),
            projectId,
            serviceId,
          });
          continue;
        }

        throw error;
      }

      const status = await startupStatus;

      if (isFailureStatus(status)) {
        this.closeSession(client.id, session);
        continue;
      }

      activeSession = true;
      return session;
    }

    throw new ServiceTerminalUserError(NO_INTERACTIVE_SHELL_MESSAGE);
  }

  private async findServicePod(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
    deploymentName?: string | null,
  ): Promise<V1Pod> {
    const list = await this.coreV1Api.listNamespacedPod({
      namespace: projectId,
      labelSelector: buildServicePodLabelSelector({
        deploymentName,
        workspaceId: workspace.id,
        projectId,
        serviceId,
      }),
    });

    const runningPods = (list.items ?? []).filter(
      (item) =>
        item.status?.phase === 'Running' &&
        item.metadata?.name &&
        item.spec?.containers?.[0]?.name,
    );
    const pod = deploymentName
      ? runningPods.find(
          (item) =>
            item.metadata?.labels?.[DEPLOYMENT_LABEL] === deploymentName,
        )
      : runningPods[0];

    if (!pod) {
      throw new ServiceTerminalUserError(
        'No running pods found for this service',
      );
    }

    return pod;
  }

  private closeSession(
    clientId: string,
    fallbackSession?: ServiceTerminalSession,
  ) {
    const session = this.sessions.get(clientId) ?? fallbackSession;

    if (!session) {
      return;
    }

    if (!session.closed) {
      session.closed = true;
      session.stdin.end();
      session.webSocket?.close();
    }

    this.sessions.delete(clientId);
  }
}

class ServiceTerminalOutputStream extends Writable {
  columns = 80;
  rows = 24;

  constructor(private readonly client: Socket) {
    super();
  }

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.client.emit('data', chunk.toString());
    callback();
  }

  resize(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;
    this.emit('resize');
  }
}

class ServiceTerminalUserError extends Error {}

function getTerminalStatusMessage(status: V1Status) {
  return status.message ?? NO_INTERACTIVE_SHELL_MESSAGE;
}

function isFailureStatus(status: V1Status | null): status is V1Status {
  return status?.status === 'Failure';
}

function isMissingShellError(error: unknown) {
  const message = getErrorMessage(error, '');

  return (
    message.includes('no such file or directory') ||
    message.includes('executable file not found')
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error) {
    return error;
  }

  if (
    typeof error === 'object' &&
    error &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}
