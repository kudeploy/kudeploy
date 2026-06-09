jest.mock('@kubernetes/client-node', () => ({
  CoreV1Api: class CoreV1Api {},
  Exec: class Exec {},
}));

import type { CoreV1Api, Exec, V1Status } from '@kubernetes/client-node';
import { RequestContext } from '@nest-boot/request-context';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { GATEWAY_OPTIONS } from '@nestjs/websockets/constants';
import type { Socket } from 'socket.io';
import { PassThrough } from 'stream';

import { ServiceService } from '@/app/service/service.service';
import { Workspace } from '@/app/workspace/workspace.entity';

import { ServiceTerminalGateway } from './service-terminal.gateway';
import { ServiceTerminalGuard } from './service-terminal.guard';

describe('ServiceTerminalGateway', () => {
  it('serves terminal socket traffic on the API-routed same-origin Socket.IO path', () => {
    const options = Reflect.getMetadata(
      GATEWAY_OPTIONS,
      ServiceTerminalGateway,
    ) as { cors?: unknown; path?: string };

    expect(options.path).toBe('/api/socket.io');
    expect(options.cors).toBeUndefined();
  });

  it('authenticates only terminal start events', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, ServiceTerminalGateway),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        ServiceTerminalGateway.prototype.handleStart,
      ),
    ).toEqual([ServiceTerminalGuard]);
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        ServiceTerminalGateway.prototype.handleData,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        ServiceTerminalGateway.prototype.handleResize,
      ),
    ).toBeUndefined();
  });

  it('starts an interactive exec session for the selected service pod', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));
    const execSocket = { close: jest.fn() };

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'pod-1' },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
      ],
    });
    exec.exec.mockImplementation(async (...args: unknown[]) => {
      const stdout = args[4] as { write: (chunk: Buffer) => void };
      stdout.write(Buffer.from('hello from pod'));

      return execSocket as never;
    });

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(serviceService.findService).toHaveBeenCalledWith(
      workspace,
      'project-1',
      'service-1',
    );
    expect(coreV1Api.listNamespacedPod).toHaveBeenCalledWith({
      namespace: 'project-1',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace-id=workspace_1,kudeploy.com/project=project-1,kudeploy.com/service=service-1',
    });
    expect(exec.exec).toHaveBeenCalledWith(
      'project-1',
      'pod-1',
      'app',
      ['/bin/sh'],
      expect.any(Object),
      expect.any(Object),
      expect.any(PassThrough),
      true,
      expect.any(Function),
    );
    expect(socket.emit).toHaveBeenCalledWith('data', 'hello from pod');
    expect(socket.emit).toHaveBeenCalledWith('started');

    const stdout = exec.exec.mock.calls[0][4] as {
      columns: number;
      rows: number;
    };
    gateway.handleResize(socket, { cols: 120, rows: 40 });
    expect(stdout.columns).toBe(120);
    expect(stdout.rows).toBe(40);

    const stdin = exec.exec.mock.calls[0][6] as PassThrough;
    const inputChunks: Buffer[] = [];
    stdin.on('data', (chunk: Buffer) => inputChunks.push(chunk));

    gateway.handleData(socket, { data: 'ls -la\r' });
    expect(Buffer.concat(inputChunks).toString()).toBe('ls -la\r');

    gateway.handleDisconnect(socket);
    expect(execSocket.close).toHaveBeenCalledTimes(1);
  });

  it('closes the terminal session when Kubernetes reports a successful exit', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));
    const execSocket = { close: jest.fn() };
    let statusCallback: ((status: V1Status) => void) | undefined;

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'pod-1' },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
      ],
    });
    exec.exec.mockImplementation(async (...args: unknown[]) => {
      statusCallback = args[8] as (status: V1Status) => void;
      statusCallback({ status: 'Success' });

      return execSocket as never;
    });

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(socket.emit).toHaveBeenCalledWith('started');

    statusCallback?.({ status: 'Success' });

    expect(socket.emit).toHaveBeenCalledWith('ended');
    expect(execSocket.close).toHaveBeenCalledTimes(1);

    const stdin = exec.exec.mock.calls[0][6] as PassThrough;
    const inputChunks: Buffer[] = [];
    stdin.on('data', (chunk: Buffer) => inputChunks.push(chunk));

    gateway.handleData(socket, { data: 'echo after-exit\r' });
    expect(inputChunks).toHaveLength(0);
  });

  it('closes a startup exec session when the client disconnects before startup completes', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));
    const execSocket = { close: jest.fn() };
    let statusCallback: ((status: V1Status) => void) | undefined;
    let resolveExecStarted: () => void = () => {};
    const execStarted = new Promise<void>((resolve) => {
      resolveExecStarted = resolve;
    });

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'pod-1' },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
      ],
    });
    exec.exec.mockImplementation(async (...args: unknown[]) => {
      statusCallback = args[8] as (status: V1Status) => void;
      resolveExecStarted();

      return execSocket as never;
    });

    const start = gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    await execStarted;
    socket.connected = false;
    gateway.handleDisconnect(socket);
    statusCallback?.({ status: 'Success' });
    await start;

    expect(execSocket.close).toHaveBeenCalledTimes(1);
    expect(socket.emit).not.toHaveBeenCalledWith('started');

    const stdin = exec.exec.mock.calls[0][6] as PassThrough;
    const inputChunks: Buffer[] = [];
    stdin.on('data', (chunk: Buffer) => inputChunks.push(chunk));

    gateway.handleData(socket, { data: 'echo after-disconnect\r' });
    expect(inputChunks).toHaveLength(0);
  });

  it('prefers the active deployment pod when older deployment pods are still running', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));

    serviceService.findService.mockResolvedValue({
      activeDeploymentName: 'deployment-2',
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: {
            labels: { 'kudeploy.com/deployment': 'deployment-1' },
            name: 'old-pod',
          },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
        {
          metadata: {
            labels: { 'kudeploy.com/deployment': 'deployment-2' },
            name: 'active-pod',
          },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
      ],
    });
    exec.exec.mockResolvedValue({ close: jest.fn() });

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(exec.exec).toHaveBeenCalledWith(
      'project-1',
      'active-pod',
      'app',
      ['/bin/sh'],
      expect.any(Object),
      expect.any(Object),
      expect.any(PassThrough),
      true,
      expect.any(Function),
    );
  });

  it('emits an error when the selected service has no pods', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({ items: [] });

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(socket.emit).toHaveBeenCalledWith('error', {
      message: 'No running pods found for this service',
    });
    expect(exec.exec).not.toHaveBeenCalled();
  });

  it('does not mark the terminal as started when the container has no shell', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));
    const execSocket = { close: jest.fn() };

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'pod-1' },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
      ],
    });
    exec.exec.mockImplementation(async (...args: unknown[]) => {
      const statusCallback = args[8] as (status: {
        status: string;
        message?: string;
      }) => void;

      statusCallback({
        status: 'Failure',
        message: 'exec: "/bin/sh": stat /bin/sh: no such file or directory',
      });

      return execSocket as never;
    });

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(socket.emit).toHaveBeenCalledWith('error', {
      message:
        'Unable to start an interactive shell in this container. Ensure the image includes /bin/sh.',
    });
    expect(socket.emit).not.toHaveBeenCalledWith('started');
    expect(exec.exec).toHaveBeenCalledTimes(1);
    expect(execSocket.close).toHaveBeenCalledTimes(1);
  });

  it('tries the next shell when Kubernetes rejects a missing shell command', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    });
    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'pod-1' },
          spec: { containers: [{ name: 'app' }] },
          status: { phase: 'Running' },
        },
      ],
    });
    exec.exec.mockRejectedValue({
      message: 'exec: "/bin/sh": stat /bin/sh: no such file or directory',
    });

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(exec.exec).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith('error', {
      message:
        'Unable to start an interactive shell in this container. Ensure the image includes /bin/sh.',
    });
    expect(socket.emit).not.toHaveBeenCalledWith('started');
  });

  it('rejects services outside the current workspace', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));

    serviceService.findService.mockResolvedValue(null);

    await gateway.handleStart(socket, {
      projectId: 'project-1',
      serviceId: 'service-1',
    });

    expect(socket.emit).toHaveBeenCalledWith('error', {
      message: 'Service not found',
    });
    expect(coreV1Api.listNamespacedPod).not.toHaveBeenCalled();
    expect(exec.exec).not.toHaveBeenCalled();
  });
});

function createGateway() {
  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
  const serviceService = {
    findService: jest.fn(),
  };
  const coreV1Api = {
    listNamespacedPod: jest.fn(),
  };
  const exec = {
    exec: jest.fn(),
  };

  return {
    coreV1Api,
    exec,
    gateway: new ServiceTerminalGateway(
      logger as never,
      serviceService as unknown as ServiceService,
      coreV1Api as unknown as CoreV1Api,
      exec as unknown as Exec,
    ),
    serviceService,
  };
}

async function createWsContext(workspace: Workspace) {
  const ctx = new RequestContext({ type: 'ws' });

  await RequestContext.run(ctx, async () => {
    RequestContext.set(Workspace, workspace);
  });

  return ctx;
}

function createSocket(ctx: RequestContext): Socket {
  return {
    connected: true,
    data: { ctx },
    emit: jest.fn(),
    id: 'socket-1',
  } as unknown as Socket;
}
