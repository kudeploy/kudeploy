jest.mock('@kubernetes/client-node', () => ({
  CoreV1Api: class CoreV1Api {},
  Exec: class Exec {},
}));

import { RequestContext } from '@nest-boot/request-context';
import type { CoreV1Api, Exec } from '@kubernetes/client-node';
import { PassThrough } from 'stream';
import type { Socket } from 'socket.io';

import { ServiceService } from '@/app/service/service.service';
import { Workspace } from '@/app/workspace/workspace.entity';

import {
  ServiceTerminalGateway,
  isServiceTerminalOriginAllowed,
} from './service-terminal.gateway';

describe('ServiceTerminalGateway', () => {
  const originEnvKeys = ['APP_URL'] as const;
  const originalOriginEnv = Object.fromEntries(
    originEnvKeys.map((key) => [key, process.env[key]]),
  );

  afterEach(() => {
    for (const key of originEnvKeys) {
      const value = originalOriginEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('uses APP_URL as the terminal socket origin allowlist', () => {
    clearOriginEnv(originEnvKeys);
    process.env.APP_URL = 'https://app.example.com/';

    expect(isServiceTerminalOriginAllowed('https://app.example.com')).toBe(
      true,
    );
    expect(isServiceTerminalOriginAllowed('https://evil.example.com')).toBe(
      false,
    );
  });

  it('allows localhost origins when no terminal origin allowlist is configured', () => {
    clearOriginEnv(originEnvKeys);

    expect(isServiceTerminalOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isServiceTerminalOriginAllowed('http://127.0.0.1:3100')).toBe(true);
    expect(isServiceTerminalOriginAllowed('https://evil.example.com')).toBe(
      false,
    );
  });

  it('starts an interactive exec session for the selected service pod', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));
    const execSocket = { close: jest.fn() };

    serviceService.findService.mockResolvedValue({
      id: 'service-1',
      projectId: 'project-1',
    } as never);
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

  it('prefers the active deployment pod when older deployment pods are still running', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const { gateway, coreV1Api, exec, serviceService } = createGateway();
    const socket = createSocket(await createWsContext(workspace));

    serviceService.findService.mockResolvedValue({
      activeDeploymentName: 'deployment-2',
      id: 'service-1',
      projectId: 'project-1',
    } as never);
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
    exec.exec.mockResolvedValue({ close: jest.fn() } as never);

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
    } as never);
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
    } as never);
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
    } as never);
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
    data: { ctx },
    emit: jest.fn(),
    id: 'socket-1',
  } as unknown as Socket;
}

function clearOriginEnv(keys: readonly string[]) {
  for (const key of keys) {
    delete process.env[key];
  }
}
