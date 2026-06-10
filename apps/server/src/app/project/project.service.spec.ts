jest.mock('@kubernetes/client-node', () => ({
  CoreV1Api: class CoreV1Api {},
  PatchStrategy: {
    ServerSideApply: 'application/apply-patch+yaml',
  },
}));

import type { CoreV1Api } from '@kubernetes/client-node';

import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { ProjectConnection } from './project.connection-definition';
import { ProjectResource, ProjectService } from './project.service';
import { ProjectStatus } from './project-status.enum';

describe('ProjectService', () => {
  it('creates a Namespace with workspace labels and display annotations', async () => {
    const { service, coreV1Api } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    coreV1Api.createNamespace.mockResolvedValue(
      namespaceResource({
        name: 'project-123',
        workspaceId: 'workspace_1',
        displayName: 'Payments',
        phase: 'Active',
      }),
    );

    const result = await service.createProject(workspace, {
      name: 'Payments',
    });

    expect(coreV1Api.createNamespace).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: expect.objectContaining({
            name: expect.stringMatching(/^project-\d+$/),
            labels: {
              'app.kubernetes.io/managed-by': 'kudeploy',
              'kudeploy.com/workspace-id': 'workspace_1',
              'kudeploy.com/project': expect.stringMatching(/^project-\d+$/),
            },
            annotations: {
              'kudeploy.com/display-name': 'Payments',
            },
          }),
        }),
        fieldManager: 'kudeploy-server',
      }),
    );
    expect(result).toMatchObject({
      id: 'project-123',
      name: 'Payments',
      status: ProjectStatus.READY,
    });
  });

  it('filters listed Namespaces by current workspace label before returning a connection', async () => {
    const { service, coreV1Api, connectionManager } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const visibleProject = namespaceResource({
      name: 'project-visible',
      workspaceId: 'workspace_1',
      displayName: 'Visible',
      phase: 'Active',
    });
    const hiddenProject = namespaceResource({
      name: 'project-hidden',
      workspaceId: 'workspace_2',
      displayName: 'Hidden',
      phase: 'Active',
    });

    coreV1Api.listNamespace.mockResolvedValue({
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

    expect(coreV1Api.listNamespace).toHaveBeenCalledWith({
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

  it('maps Namespace phases to ProjectStatus values', () => {
    const { service } = createService();

    expect(
      service.toProject(
        namespaceResource({
          phase: 'Active',
        }),
      ).status,
    ).toBe(ProjectStatus.READY);
    expect(
      service.toProject(
        namespaceResource({
          phase: 'Terminating',
        }),
      ).status,
    ).toBe(ProjectStatus.PROGRESSING);
    expect(
      service.toProject(
        namespaceResource({
          deletionTimestamp: '2026-06-01T00:01:00.000Z',
        }),
      ).status,
    ).toBe(ProjectStatus.PROGRESSING);
    expect(
      service.toProject(namespaceResource({ phase: 'Unexpected' })).status,
    ).toBe(ProjectStatus.UNKNOWN);
    expect(service.toProject(namespaceResource()).status).toBe(
      ProjectStatus.PENDING,
    );
  });
});

function createService() {
  const coreV1Api = {
    createNamespace: jest.fn(),
    listNamespace: jest.fn(),
    readNamespace: jest.fn(),
    patchNamespace: jest.fn(),
    deleteNamespace: jest.fn(),
  };
  const connectionManager = {
    find: jest.fn(),
  };
  const service = new ProjectService(
    coreV1Api as unknown as CoreV1Api,
    connectionManager as unknown as KubernetesConnectionManager,
  );

  return { service, coreV1Api, connectionManager };
}

function namespaceResource(
  options: {
    name?: string;
    workspaceId?: string;
    displayName?: string;
    phase?: string;
    deletionTimestamp?: string;
  } = {},
): ProjectResource {
  const {
    name = 'project-123',
    workspaceId = 'workspace_1',
    displayName = 'Payments',
    phase,
    deletionTimestamp,
  } = options;

  return {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name,
      labels: {
        'app.kubernetes.io/managed-by': 'kudeploy',
        'kudeploy.com/workspace-id': workspaceId,
        'kudeploy.com/project': name,
      },
      annotations: {
        'kudeploy.com/display-name': displayName,
      },
      creationTimestamp: '2026-06-01T00:00:00.000Z',
      deletionTimestamp,
    },
    status: phase ? { phase } : {},
  };
}
