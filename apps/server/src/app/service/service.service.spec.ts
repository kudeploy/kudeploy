jest.mock('@kubernetes/client-node', () => ({
  CustomObjectsApi: class CustomObjectsApi {},
  PatchStrategy: {
    ServerSideApply: 'application/apply-patch+yaml',
  },
}));

import type { CustomObjectsApi } from '@kubernetes/client-node';

import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';
import { ProjectService } from '@/app/project/project.service';

import { ServiceConnection } from './service.connection-definition';
import { ServiceStatus } from './service-status.enum';
import { ServiceResource, ServiceService } from './service.service';

describe('ServiceService', () => {
  it('creates a namespaced Service CRD with workspace/project labels and supported spec fields', async () => {
    const { service, customObjectsApi, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: 'project-123',
      name: 'Payments',
    } as never);
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        name: 'service-123',
        namespace: 'project-123',
        workspaceId: 'workspace_1',
        displayName: 'API',
        image: 'ghcr.io/kudeploy/whoami:latest',
      }),
    );

    const result = await service.createService(workspace, {
      projectId: 'project-123',
      name: 'API',
      image: 'ghcr.io/kudeploy/whoami:latest',
      replicas: 2,
      command: ['pnpm'],
      args: ['start'],
      resources: {
        cpuRequest: '250m',
        cpuLimit: '500m',
        memoryRequest: '256Mi',
        memoryLimit: '512Mi',
      },
      healthCheck: {
        type: 'HTTP',
        path: '/healthz',
        port: 8080,
      },
      ports: [{ port: 80, targetPort: 8080 }],
      env: [{ key: 'NODE_ENV', value: 'production' }],
    });

    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        group: 'kudeploy.com',
        version: 'v1alpha1',
        namespace: 'project-123',
        plural: 'services',
        name: expect.stringMatching(/^service-\d+$/),
        body: expect.objectContaining({
          apiVersion: 'kudeploy.com/v1alpha1',
          kind: 'Service',
          metadata: expect.objectContaining({
            name: expect.stringMatching(/^service-\d+$/),
            namespace: 'project-123',
            labels: {
              'app.kubernetes.io/managed-by': 'kudeploy',
              'kudeploy.com/workspace-id': 'workspace_1',
              'kudeploy.com/project': 'project-123',
            },
            annotations: {
              'kudeploy.com/display-name': 'API',
            },
          }),
          spec: {
            image: 'ghcr.io/kudeploy/whoami:latest',
            replicas: 2,
            command: ['pnpm'],
            args: ['start'],
            resources: {
              requests: {
                cpu: '250m',
                memory: '256Mi',
              },
              limits: {
                cpu: '500m',
                memory: '512Mi',
              },
            },
            readinessProbe: {
              httpGet: {
                path: '/healthz',
                port: 8080,
              },
              initialDelaySeconds: 0,
              timeoutSeconds: 3,
              periodSeconds: 5,
              successThreshold: 1,
              failureThreshold: 3,
            },
            livenessProbe: {
              httpGet: {
                path: '/healthz',
                port: 8080,
              },
              initialDelaySeconds: 0,
              timeoutSeconds: 3,
              periodSeconds: 10,
              successThreshold: 1,
              failureThreshold: 3,
            },
            startupProbe: {
              httpGet: {
                path: '/healthz',
                port: 8080,
              },
              initialDelaySeconds: 0,
              timeoutSeconds: 3,
              periodSeconds: 10,
              successThreshold: 1,
              failureThreshold: 30,
            },
            ports: [{ port: 80, targetPort: 8080 }],
            env: [{ name: 'NODE_ENV', value: 'production' }],
          },
        }),
        fieldManager: 'kudeploy-server',
        force: true,
      }),
      expect.objectContaining({
        middleware: expect.any(Array),
      }),
    );
    expect(result).toMatchObject({
      id: 'service-123',
      projectId: 'project-123',
      name: 'API',
      image: 'ghcr.io/kudeploy/whoami:latest',
      replicas: 2,
      command: ['pnpm'],
      args: ['start'],
      resources: {
        cpuRequest: '250m',
        cpuLimit: '500m',
        memoryRequest: '256Mi',
        memoryLimit: '512Mi',
      },
      healthCheck: {
        type: 'HTTP',
        path: '/healthz',
        port: 8080,
      },
      status: ServiceStatus.PENDING,
    });
  });

  it('defaults null replicas to one when creating a Service CRD', async () => {
    const { service, customObjectsApi, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: 'project-123',
      name: 'Payments',
    } as never);
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        name: 'service-123',
        namespace: 'project-123',
        workspaceId: 'workspace_1',
        displayName: 'API',
        replicas: 1,
      }),
    );

    await service.createService(workspace, {
      projectId: 'project-123',
      name: 'API',
      image: 'nginx:latest',
      replicas: null as never,
      ports: [{ port: 80 }],
    });

    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            replicas: 1,
          }),
        }),
      }),
      expect.any(Object),
    );
  });

  it('resets replicas to one when updating a Service CRD with null replicas', async () => {
    const { service, customObjectsApi, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: 'project-123',
      name: 'Payments',
    } as never);
    customObjectsApi.getNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ replicas: 3 }),
    );
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ replicas: 1 }),
    );

    await service.updateService(workspace, 'project-123', 'service-123', {
      replicas: null as never,
    });

    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            replicas: 1,
          }),
        }),
      }),
      expect.any(Object),
    );
  });

  it('filters listed Service CRDs by current workspace and project before returning a connection', async () => {
    const { service, customObjectsApi, connectionManager, projectService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const visibleService = serviceCrd({
      name: 'service-visible',
      namespace: 'project-123',
      workspaceId: 'workspace_1',
      displayName: 'Visible',
    });
    const hiddenService = serviceCrd({
      name: 'service-hidden',
      namespace: 'project-123',
      workspaceId: 'workspace_2',
      displayName: 'Hidden',
    });

    projectService.findProject.mockResolvedValue({
      id: 'project-123',
      name: 'Payments',
    } as never);
    customObjectsApi.listNamespacedCustomObject.mockResolvedValue({
      items: [visibleService, hiddenService],
    });
    connectionManager.find.mockImplementation(
      async (_connection, _args, options) => {
        const last = options.items[options.items.length - 1];

        return {
          totalCount: options.items.length,
          edges: options.items.map((node: { id?: string }) => ({
            node,
            cursor: String(node.id),
          })),
          pageInfo: {
            startCursor: options.items[0]?.id
              ? String(options.items[0].id)
              : null,
            endCursor: last?.id ? String(last.id) : null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      },
    );

    const result = await service.findServices(workspace, 'project-123', {
      first: 20,
    });

    expect(customObjectsApi.listNamespacedCustomObject).toHaveBeenCalledWith({
      group: 'kudeploy.com',
      version: 'v1alpha1',
      namespace: 'project-123',
      plural: 'services',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace-id=workspace_1,kudeploy.com/project=project-123',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      ServiceConnection,
      { first: 20 },
      {
        items: [
          expect.objectContaining({
            id: 'service-visible',
            name: 'Visible',
          }),
        ],
      },
    );
    expect(result.totalCount).toBe(1);
  });

  it('does not delete a Service CRD when the Project is outside the current workspace', async () => {
    const { service, customObjectsApi, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue(null);

    await expect(
      service.deleteService(workspace, 'project-123', 'service-123'),
    ).rejects.toThrow('Project not found');

    expect(customObjectsApi.getNamespacedCustomObject).not.toHaveBeenCalled();
    expect(
      customObjectsApi.deleteNamespacedCustomObject,
    ).not.toHaveBeenCalled();
  });

  it('maps Ready conditions to ServiceStatus values', () => {
    const { service } = createService();

    expect(
      service.toService(
        serviceCrd({
          readyStatus: 'True',
          readyReason: 'DeploymentReady',
        }),
      ).status,
    ).toBe(ServiceStatus.READY);
    expect(
      service.toService(
        serviceCrd({
          readyStatus: 'False',
          readyReason: 'DeploymentProgressing',
        }),
      ).status,
    ).toBe(ServiceStatus.PROGRESSING);
    expect(
      service.toService(
        serviceCrd({
          readyStatus: 'False',
          readyReason: 'DeploymentNotFound',
        }),
      ).status,
    ).toBe(ServiceStatus.FAILED);
    expect(service.toService(serviceCrd()).status).toBe(ServiceStatus.PENDING);
  });

  it('keeps deployment status names for internal service consumers', () => {
    const { service } = createService();

    expect(
      service.toService(
        serviceCrd({
          activeDeploymentName: 'service-123-00002',
          latestDeploymentName: 'service-123-00003',
        }),
      ),
    ).toMatchObject({
      activeDeploymentName: 'service-123-00002',
      latestDeploymentName: 'service-123-00003',
    });
  });
});

function createService() {
  const customObjectsApi = {
    patchNamespacedCustomObject: jest.fn(),
    listNamespacedCustomObject: jest.fn(),
    getNamespacedCustomObject: jest.fn(),
    deleteNamespacedCustomObject: jest.fn(),
  };
  const connectionManager = {
    find: jest.fn(),
  };
  const projectService = {
    findProject: jest.fn(),
  };
  const service = new ServiceService(
    customObjectsApi as unknown as CustomObjectsApi,
    connectionManager as unknown as KubernetesConnectionManager,
    projectService as unknown as ProjectService,
  );

  return { service, customObjectsApi, connectionManager, projectService };
}

function serviceCrd(
  options: {
    name?: string;
    namespace?: string;
    workspaceId?: string;
    displayName?: string;
    image?: string;
    activeDeploymentName?: string;
    latestDeploymentName?: string;
    replicas?: number;
    readyStatus?: 'True' | 'False' | 'Unknown';
    readyReason?: string;
  } = {},
): ServiceResource {
  const {
    name = 'service-123',
    namespace = 'project-123',
    workspaceId = 'workspace_1',
    displayName = 'API',
    image = 'nginx:latest',
    activeDeploymentName,
    latestDeploymentName,
    replicas = 2,
    readyStatus,
    readyReason = 'DeploymentReady',
  } = options;

  return {
    apiVersion: 'kudeploy.com/v1alpha1',
    kind: 'Service',
    metadata: {
      name,
      namespace,
      labels: {
        'app.kubernetes.io/managed-by': 'kudeploy',
        'kudeploy.com/workspace-id': workspaceId,
        'kudeploy.com/project': namespace,
      },
      annotations: {
        'kudeploy.com/display-name': displayName,
      },
      creationTimestamp: '2026-06-01T00:00:00.000Z',
    },
    spec: {
      image,
      replicas,
      command: ['pnpm'],
      args: ['start'],
      resources: {
        requests: {
          cpu: '250m',
          memory: '256Mi',
        },
        limits: {
          cpu: '500m',
          memory: '512Mi',
        },
      },
      readinessProbe: {
        httpGet: {
          path: '/healthz',
          port: 8080,
        },
      },
      ports: [{ port: 80, targetPort: 8080 }],
      env: [{ name: 'NODE_ENV', value: 'production' }],
    },
    status:
      readyStatus || activeDeploymentName || latestDeploymentName
        ? {
            ...(activeDeploymentName ? { activeDeploymentName } : {}),
            ...(latestDeploymentName ? { latestDeploymentName } : {}),
            conditions: [
              ...(readyStatus
                ? [
                    {
                      type: 'Ready',
                      status: readyStatus,
                      reason: readyReason,
                      message: readyReason,
                    },
                  ]
                : []),
            ],
          }
        : {},
  };
}
