jest.mock('@kubernetes/client-node', () => ({
  CoreV1Api: class CoreV1Api {},
}));

import type {
  CoreV1Api,
  V1PersistentVolumeClaim,
} from '@kubernetes/client-node';

import { ProjectService } from '@/app/project/project.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { VolumeConnection } from './volume.connection-definition';
import { VolumeResource, VolumeService } from './volume.service';
import { VolumeStatus } from './volume-status.enum';

describe('VolumeService', () => {
  it('creates a PersistentVolumeClaim in the Project namespace with size mapped to Gi storage', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.createNamespacedPersistentVolumeClaim.mockResolvedValue(
      volumePvc({
        name: 'kd-volume-123',
        namespace: 'kd-project-123',
        workspaceId: 'workspace_1',
        displayName: 'Database',
        storage: '10Gi',
      }),
    );

    const result = await service.createVolume(workspace, {
      projectId: '123',
      name: 'Database',
      size: 10,
    });

    expect(
      coreV1Api.createNamespacedPersistentVolumeClaim,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'kd-project-123',
        body: expect.objectContaining({
          apiVersion: 'v1',
          kind: 'PersistentVolumeClaim',
          metadata: expect.objectContaining({
            name: expect.stringMatching(/^kd-volume-\d+$/),
            namespace: 'kd-project-123',
            labels: {
              'app.kubernetes.io/managed-by': 'kudeploy',
              'kudeploy.com/workspace': 'workspace_1',
              'kudeploy.com/project': 'kd-project-123',
            },
            annotations: {
              'kudeploy.com/display-name': 'Database',
            },
          }),
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: '10Gi',
              },
            },
          },
        }),
        fieldManager: 'kudeploy-server',
      }),
    );
    expect(result).toMatchObject({
      id: '123',
      projectId: '123',
      name: 'Database',
      size: 10,
      status: VolumeStatus.PENDING,
    });
  });

  it('defaults access modes to ReadWriteOnce when creating a PersistentVolumeClaim', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.createNamespacedPersistentVolumeClaim.mockResolvedValue(
      volumePvc(),
    );

    await service.createVolume(workspace, {
      projectId: '123',
      name: 'Cache',
      size: 1,
    });

    expect(
      coreV1Api.createNamespacedPersistentVolumeClaim,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            accessModes: ['ReadWriteOnce'],
          }),
        }),
      }),
    );
  });

  it('filters listed PersistentVolumeClaims by current workspace and project before returning a connection', async () => {
    const { service, coreV1Api, connectionManager, projectService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const visibleVolume = volumePvc({
      name: 'kd-volume-visible',
      namespace: 'kd-project-123',
      workspaceId: 'workspace_1',
      displayName: 'Visible',
    });
    const hiddenVolume = volumePvc({
      name: 'kd-volume-hidden',
      namespace: 'kd-project-123',
      workspaceId: 'workspace_2',
      displayName: 'Hidden',
    });

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.listNamespacedPersistentVolumeClaim.mockResolvedValue({
      items: [visibleVolume, hiddenVolume],
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

    const result = await service.findVolumes(workspace, '123', {
      first: 20,
    });

    expect(coreV1Api.listNamespacedPersistentVolumeClaim).toHaveBeenCalledWith({
      namespace: 'kd-project-123',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace=workspace_1,kudeploy.com/project=kd-project-123',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      VolumeConnection,
      { first: 20 },
      {
        items: [
          expect.objectContaining({
            id: 'visible',
            projectId: '123',
            name: 'Visible',
            size: 10,
          }),
        ],
      },
    );
    expect(result.totalCount).toBe(1);
  });

  it('does not create a PersistentVolumeClaim when the Project is outside the current workspace', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue(null);

    await expect(
      service.createVolume(workspace, {
        projectId: '123',
        name: 'Database',
        size: 10,
      }),
    ).rejects.toThrow('Project not found');

    expect(
      coreV1Api.createNamespacedPersistentVolumeClaim,
    ).not.toHaveBeenCalled();
  });

  it('does not delete a PersistentVolumeClaim outside the current workspace', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.readNamespacedPersistentVolumeClaim.mockResolvedValue(
      volumePvc({
        name: 'kd-volume-123',
        namespace: 'kd-project-123',
        workspaceId: 'workspace_2',
      }),
    );

    await expect(service.deleteVolume(workspace, '123', '123')).rejects.toThrow(
      'Volume not found',
    );

    expect(coreV1Api.readNamespacedPersistentVolumeClaim).toHaveBeenCalledWith({
      namespace: 'kd-project-123',
      name: 'kd-volume-123',
    });

    expect(
      coreV1Api.deleteNamespacedPersistentVolumeClaim,
    ).not.toHaveBeenCalled();
  });

  it('maps PersistentVolumeClaim phases to VolumeStatus values', () => {
    const { service } = createService();

    expect(service.toVolume(volumePvc({ phase: 'Bound' })).status).toBe(
      VolumeStatus.BOUND,
    );
    expect(service.toVolume(volumePvc({ phase: 'Lost' })).status).toBe(
      VolumeStatus.LOST,
    );
    expect(service.toVolume(volumePvc({ phase: 'Pending' })).status).toBe(
      VolumeStatus.PENDING,
    );
    expect(service.toVolume(volumePvc({ phase: 'Unexpected' })).status).toBe(
      VolumeStatus.UNKNOWN,
    );
  });

  it('maps Gi storage requests to integer volume sizes', () => {
    const { service } = createService();

    expect(service.toVolume(volumePvc({ storage: '1Gi' })).size).toBe(1);
    expect(service.toVolume(volumePvc({ storage: '32Gi' })).size).toBe(32);
  });
});

function createService() {
  const coreV1Api = {
    createNamespacedPersistentVolumeClaim: jest.fn(),
    listNamespacedPersistentVolumeClaim: jest.fn(),
    readNamespacedPersistentVolumeClaim: jest.fn(),
    deleteNamespacedPersistentVolumeClaim: jest.fn(),
  };
  const connectionManager = {
    find: jest.fn(),
  };
  const projectService = {
    findProject: jest.fn(),
  };
  const service = new VolumeService(
    coreV1Api as unknown as CoreV1Api,
    connectionManager as unknown as KubernetesConnectionManager,
    projectService as unknown as ProjectService,
  );

  return { service, coreV1Api, connectionManager, projectService };
}

function volumePvc(
  options: {
    name?: string;
    namespace?: string;
    workspaceId?: string;
    displayName?: string;
    storage?: string;
    accessModes?: string[];
    phase?: string;
  } = {},
): VolumeResource {
  const {
    name = 'kd-volume-123',
    namespace = 'kd-project-123',
    workspaceId = 'workspace_1',
    displayName = 'Database',
    storage = '10Gi',
    accessModes = ['ReadWriteOnce'],
    phase,
  } = options;

  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
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
      accessModes,
      resources: {
        requests: {
          storage,
        },
      },
    },
    status: phase ? { phase } : {},
  } as V1PersistentVolumeClaim as VolumeResource;
}
