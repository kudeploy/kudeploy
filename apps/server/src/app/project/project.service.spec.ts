jest.mock('@kubernetes/client-node', () => ({
  CustomObjectsApi: class CustomObjectsApi {},
  PatchStrategy: {
    ServerSideApply: 'application/apply-patch+yaml',
  },
}));

import type { CustomObjectsApi } from '@kubernetes/client-node';

import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { ProjectConnection } from './project.connection-definition';
import { ProjectResource, ProjectService } from './project.service';
import { ProjectStatus } from './project-status.enum';

describe('ProjectService', () => {
  it('creates a cluster-scoped Project CRD with workspace labels and display annotations', async () => {
    const { service, customObjectsApi } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    customObjectsApi.patchClusterCustomObject.mockResolvedValue(
      projectCrd({
        name: 'project-123',
        workspaceId: 'workspace_1',
        displayName: 'Payments',
      }),
    );

    const result = await service.createProject(workspace, {
      name: 'Payments',
    });

    expect(customObjectsApi.patchClusterCustomObject).toHaveBeenCalledWith(
      expect.objectContaining({
        group: 'kudeploy.com',
        version: 'v1alpha1',
        plural: 'projects',
        name: expect.stringMatching(/^project-\d+$/),
        body: expect.objectContaining({
          apiVersion: 'kudeploy.com/v1alpha1',
          kind: 'Project',
          metadata: expect.objectContaining({
            name: expect.stringMatching(/^project-\d+$/),
            labels: {
              'app.kubernetes.io/managed-by': 'kudeploy',
              'kudeploy.com/workspace-id': 'workspace_1',
            },
            annotations: {
              'kudeploy.com/display-name': 'Payments',
            },
          }),
          spec: {},
        }),
        fieldManager: 'kudeploy-server',
        force: true,
      }),
      expect.objectContaining({
        middleware: expect.any(Array),
      }),
    );
    expect(result).toMatchObject({
      id: 'project-123',
      name: 'Payments',
      status: ProjectStatus.PENDING,
    });
  });

  it('filters listed Project CRDs by current workspace label before returning a connection', async () => {
    const { service, customObjectsApi, connectionManager } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const visibleProject = projectCrd({
      name: 'project-visible',
      workspaceId: 'workspace_1',
      displayName: 'Visible',
    });
    const hiddenProject = projectCrd({
      name: 'project-hidden',
      workspaceId: 'workspace_2',
      displayName: 'Hidden',
    });

    customObjectsApi.listClusterCustomObject.mockResolvedValue({
      items: [visibleProject, hiddenProject],
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

    const result = await service.findProjects(workspace, { first: 20 });

    expect(customObjectsApi.listClusterCustomObject).toHaveBeenCalledWith({
      group: 'kudeploy.com',
      version: 'v1alpha1',
      plural: 'projects',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace-id=workspace_1',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      ProjectConnection,
      { first: 20 },
      {
        items: [
          expect.objectContaining({
            id: 'project-visible',
            name: 'Visible',
          }),
        ],
      },
    );
    expect(result.totalCount).toBe(1);
  });

  it('maps Ready conditions to ProjectStatus values', () => {
    const { service } = createService();

    expect(
      service.toProject(
        projectCrd({
          readyStatus: 'True',
          readyReason: 'NamespaceReady',
        }),
      ).status,
    ).toBe(ProjectStatus.READY);
    expect(
      service.toProject(
        projectCrd({
          readyStatus: 'False',
          readyReason: 'NamespaceConflict',
        }),
      ).status,
    ).toBe(ProjectStatus.FAILED);
    expect(
      service.toProject(
        projectCrd({
          readyStatus: 'Unknown',
          readyReason: 'Reconciling',
        }),
      ).status,
    ).toBe(ProjectStatus.PROGRESSING);
    expect(service.toProject(projectCrd()).status).toBe(ProjectStatus.PENDING);
  });
});

function createService() {
  const customObjectsApi = {
    patchClusterCustomObject: jest.fn(),
    listClusterCustomObject: jest.fn(),
    getClusterCustomObject: jest.fn(),
    deleteClusterCustomObject: jest.fn(),
  };
  const connectionManager = {
    find: jest.fn(),
  };
  const service = new ProjectService(
    customObjectsApi as unknown as CustomObjectsApi,
    connectionManager as unknown as KubernetesConnectionManager,
  );

  return { service, customObjectsApi, connectionManager };
}

function projectCrd(
  options: {
    name?: string;
    workspaceId?: string;
    displayName?: string;
    readyStatus?: 'True' | 'False' | 'Unknown';
    readyReason?: string;
  } = {},
): ProjectResource {
  const {
    name = 'project-123',
    workspaceId = 'workspace_1',
    displayName = 'Payments',
    readyStatus,
    readyReason = 'NamespaceReady',
  } = options;

  return {
    apiVersion: 'kudeploy.com/v1alpha1',
    kind: 'Project',
    metadata: {
      name,
      labels: {
        'app.kubernetes.io/managed-by': 'kudeploy',
        'kudeploy.com/workspace-id': workspaceId,
      },
      annotations: {
        'kudeploy.com/display-name': displayName,
      },
      creationTimestamp: '2026-06-01T00:00:00.000Z',
    },
    spec: {},
    status: readyStatus
      ? {
          conditions: [
            {
              type: 'Ready',
              status: readyStatus,
              reason: readyReason,
              message: readyReason,
            },
          ],
        }
      : {},
  };
}
