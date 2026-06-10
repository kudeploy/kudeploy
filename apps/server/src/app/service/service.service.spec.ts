jest.mock('@kubernetes/client-node', () => ({
  CustomObjectsApi: class CustomObjectsApi {},
  PatchStrategy: {
    ServerSideApply: 'application/apply-patch+yaml',
  },
}));

import type { CustomObjectsApi } from '@kubernetes/client-node';

import { ProjectService } from '@/app/project/project.service';
import { RegistryCredentialService } from '@/app/registry-credential/registry-credential.service';
import { VolumeService } from '@/app/volume/volume.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { ServiceConnection } from './service.connection-definition';
import { ServiceResource, ServiceService } from './service.service';
import { ServiceStatus } from './service-status.enum';

describe('ServiceService', () => {
  it('creates a namespaced Service CRD with workspace/project labels and supported spec fields', async () => {
    const { service, customObjectsApi, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        name: 'kd-service-123',
        namespace: 'kd-project-123',
        workspaceId: 'kd-workspace-workspace_1',
        displayName: 'API',
        image: 'ghcr.io/kudeploy/whoami:latest',
      }),
    );

    const result = await service.createService(workspace, {
      projectId: '123',
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
        namespace: 'kd-project-123',
        plural: 'services',
        name: expect.stringMatching(/^kd-service-\d+$/),
        body: expect.objectContaining({
          apiVersion: 'kudeploy.com/v1alpha1',
          kind: 'Service',
          metadata: expect.objectContaining({
            name: expect.stringMatching(/^kd-service-\d+$/),
            namespace: 'kd-project-123',
            labels: {
              'app.kubernetes.io/managed-by': 'kudeploy',
              'kudeploy.com/workspace': 'kd-workspace-workspace_1',
              'kudeploy.com/project': 'kd-project-123',
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
      id: '123',
      projectId: '123',
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
      id: '123',
      name: 'Payments',
    });
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        name: 'kd-service-123',
        namespace: 'kd-project-123',
        workspaceId: 'kd-workspace-workspace_1',
        displayName: 'API',
        replicas: 1,
      }),
    );

    await service.createService(workspace, {
      projectId: '123',
      name: 'API',
      image: 'nginx:latest',
      replicas: null,
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

  it('sets imageSecretRef when creating a Service CRD with a registry credential', async () => {
    const {
      service,
      customObjectsApi,
      projectService,
      registryCredentialService,
    } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    registryCredentialService.findRegistryCredential.mockResolvedValue({
      id: '456',
      projectId: '123',
      name: 'GitHub Container Registry',
    });
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        imageSecretRefName: 'kd-regcred-456',
      }),
    );

    const result = await service.createService(workspace, {
      projectId: '123',
      name: 'API',
      image: 'ghcr.io/kudeploy/whoami:latest',
      registryCredentialId: '456',
      ports: [{ port: 80 }],
    });

    expect(
      registryCredentialService.findRegistryCredential,
    ).toHaveBeenCalledWith(workspace, '123', '456');
    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            imageSecretRef: {
              name: 'kd-regcred-456',
            },
          }),
        }),
      }),
      expect.any(Object),
    );
    expect(result.registryCredentialId).toBe('456');
  });

  it('creates a Service CRD with existing Project volume mounts', async () => {
    const { service, customObjectsApi, projectService, volumeService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    volumeService.findVolume.mockResolvedValue({
      id: 'data',
      projectId: '123',
      name: 'Data',
    });
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        volumes: [
          {
            name: 'kd-volume-data',
            mountPath: '/data',
            subPath: 'uploads',
            readOnly: true,
          },
        ],
      }),
    );

    const result = await service.createService(workspace, {
      projectId: '123',
      name: 'API',
      image: 'ghcr.io/kudeploy/whoami:latest',
      ports: [{ port: 80 }],
      volumes: [
        {
          volumeId: 'data',
          mountPath: '/data',
          subPath: 'uploads',
          readOnly: true,
        },
      ],
    });

    expect(volumeService.findVolume).toHaveBeenCalledWith(
      workspace,
      '123',
      'data',
    );
    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            volumes: [
              {
                name: 'kd-volume-data',
                mountPath: '/data',
                subPath: 'uploads',
                readOnly: true,
              },
            ],
          }),
        }),
      }),
      expect.any(Object),
    );
    expect(result.volumes).toEqual([
      {
        volumeId: 'data',
        mountPath: '/data',
        subPath: 'uploads',
        readOnly: true,
      },
    ]);
  });

  it('does not create a Service CRD when a requested volume is missing', async () => {
    const { service, customObjectsApi, projectService, volumeService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    volumeService.findVolume.mockResolvedValue(null);

    await expect(
      service.createService(workspace, {
        projectId: '123',
        name: 'API',
        image: 'ghcr.io/kudeploy/whoami:latest',
        ports: [{ port: 80 }],
        volumes: [{ volumeId: 'missing', mountPath: '/data' }],
      }),
    ).rejects.toThrow('Volume not found');

    expect(customObjectsApi.patchNamespacedCustomObject).not.toHaveBeenCalled();
  });

  it('resets replicas to one when updating a Service CRD with null replicas', async () => {
    const { service, customObjectsApi, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    customObjectsApi.getNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ replicas: 3 }),
    );
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ replicas: 1 }),
    );

    await service.updateService(workspace, '123', '123', {
      replicas: null,
    });

    expect(customObjectsApi.getNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'kd-project-123',
        name: 'kd-service-123',
      }),
    );
    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'kd-project-123',
        name: 'kd-service-123',
        body: expect.objectContaining({
          spec: expect.objectContaining({
            replicas: 1,
          }),
        }),
      }),
      expect.any(Object),
    );
  });

  it('updates imageSecretRef when updating a Service CRD with a registry credential', async () => {
    const {
      service,
      customObjectsApi,
      projectService,
      registryCredentialService,
    } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    registryCredentialService.findRegistryCredential.mockResolvedValue({
      id: '456',
      projectId: '123',
      name: 'GitHub Container Registry',
    });
    customObjectsApi.getNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ imageSecretRefName: 'kd-regcred-old' }),
    );
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ imageSecretRefName: 'kd-regcred-456' }),
    );

    const result = await service.updateService(workspace, '123', '123', {
      registryCredentialId: '456',
    });

    expect(
      registryCredentialService.findRegistryCredential,
    ).toHaveBeenCalledWith(workspace, '123', '456');
    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            imageSecretRef: {
              name: 'kd-regcred-456',
            },
          }),
        }),
      }),
      expect.any(Object),
    );
    expect(result.registryCredentialId).toBe('456');
  });

  it('updates Service CRD volume mounts', async () => {
    const { service, customObjectsApi, projectService, volumeService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    volumeService.findVolume.mockResolvedValue({
      id: 'cache',
      projectId: '123',
      name: 'Cache',
    });
    customObjectsApi.getNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        volumes: [{ name: 'kd-volume-data', mountPath: '/data' }],
      }),
    );
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({
        volumes: [{ name: 'kd-volume-cache', mountPath: '/cache' }],
      }),
    );

    const result = await service.updateService(workspace, '123', '123', {
      volumes: [{ volumeId: 'cache', mountPath: '/cache' }],
    });

    expect(volumeService.findVolume).toHaveBeenCalledWith(
      workspace,
      '123',
      'cache',
    );
    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            volumes: [
              {
                name: 'kd-volume-cache',
                mountPath: '/cache',
              },
            ],
          }),
        }),
      }),
      expect.any(Object),
    );
    expect(result.volumes).toEqual([
      {
        volumeId: 'cache',
        mountPath: '/cache',
        subPath: null,
        readOnly: false,
      },
    ]);
  });

  it('clears imageSecretRef when updating a Service CRD with a null registry credential', async () => {
    const {
      service,
      customObjectsApi,
      projectService,
      registryCredentialService,
    } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    customObjectsApi.getNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ imageSecretRefName: 'kd-regcred-456' }),
    );
    customObjectsApi.patchNamespacedCustomObject.mockResolvedValue(
      serviceCrd({ imageSecretRefName: undefined }),
    );

    const result = await service.updateService(workspace, '123', '123', {
      registryCredentialId: null,
    });

    expect(
      registryCredentialService.findRegistryCredential,
    ).not.toHaveBeenCalled();
    expect(customObjectsApi.patchNamespacedCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.not.objectContaining({
            imageSecretRef: expect.anything(),
          }),
        }),
      }),
      expect.any(Object),
    );
    expect(result.registryCredentialId).toBeNull();
  });

  it('filters listed Service CRDs by current workspace and project before returning a connection', async () => {
    const { service, customObjectsApi, connectionManager, projectService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const visibleService = serviceCrd({
      name: 'kd-service-visible',
      namespace: 'kd-project-123',
      workspaceId: 'kd-workspace-workspace_1',
      displayName: 'Visible',
    });
    const hiddenService = serviceCrd({
      name: 'kd-service-hidden',
      namespace: 'kd-project-123',
      workspaceId: 'kd-workspace-workspace_2',
      displayName: 'Hidden',
    });

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
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

    const result = await service.findServices(workspace, '123', {
      first: 20,
    });

    expect(customObjectsApi.listNamespacedCustomObject).toHaveBeenCalledWith({
      group: 'kudeploy.com',
      version: 'v1alpha1',
      namespace: 'kd-project-123',
      plural: 'services',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace=kd-workspace-workspace_1,kudeploy.com/project=kd-project-123',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      ServiceConnection,
      { first: 20 },
      {
        items: [
          expect.objectContaining({
            id: 'visible',
            projectId: '123',
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
      service.deleteService(workspace, '123', '123'),
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
          activeDeploymentName: 'kd-service-123-00002',
          latestDeploymentName: 'kd-service-123-00003',
        }),
      ),
    ).toMatchObject({
      activeDeploymentName: 'kd-service-123-00002',
      latestDeploymentName: 'kd-service-123-00003',
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
  const registryCredentialService = {
    findRegistryCredential: jest.fn(),
  };
  const volumeService = {
    findVolume: jest.fn(),
  };
  const service = new ServiceService(
    customObjectsApi as unknown as CustomObjectsApi,
    connectionManager as unknown as KubernetesConnectionManager,
    projectService as unknown as ProjectService,
    registryCredentialService as unknown as RegistryCredentialService,
    volumeService as unknown as VolumeService,
  );

  return {
    service,
    customObjectsApi,
    connectionManager,
    projectService,
    registryCredentialService,
    volumeService,
  };
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
    imageSecretRefName?: string;
    volumes?: Array<{
      name: string;
      mountPath: string;
      subPath?: string;
      readOnly?: boolean;
    }>;
  } = {},
): ServiceResource {
  const {
    name = 'kd-service-123',
    namespace = 'kd-project-123',
    workspaceId = 'kd-workspace-workspace_1',
    displayName = 'API',
    image = 'nginx:latest',
    activeDeploymentName,
    latestDeploymentName,
    replicas = 2,
    readyStatus,
    readyReason = 'DeploymentReady',
    imageSecretRefName,
    volumes,
  } = options;

  return {
    apiVersion: 'kudeploy.com/v1alpha1',
    kind: 'Service',
    metadata: {
      name,
      namespace,
      labels: {
        'app.kubernetes.io/managed-by': 'kudeploy',
        'kudeploy.com/workspace': workspaceId,
        'kudeploy.com/project': namespace,
      },
      annotations: {
        'kudeploy.com/display-name': displayName,
      },
      creationTimestamp: '2026-06-01T00:00:00.000Z',
    },
    spec: {
      image,
      ...(imageSecretRefName
        ? { imageSecretRef: { name: imageSecretRefName } }
        : {}),
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
      ...(volumes ? { volumes } : {}),
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
