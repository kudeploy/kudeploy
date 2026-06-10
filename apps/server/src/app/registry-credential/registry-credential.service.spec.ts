jest.mock('@kubernetes/client-node', () => ({
  CoreV1Api: class CoreV1Api {},
  PatchStrategy: {
    ServerSideApply: 'application/apply-patch+yaml',
  },
}));

import type { CoreV1Api } from '@kubernetes/client-node';

import { ProjectService } from '@/app/project/project.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { RegistryCredentialConnection } from './registry-credential.connection-definition';
import {
  RegistryCredentialResource,
  RegistryCredentialService,
} from './registry-credential.service';

describe('RegistryCredentialService', () => {
  it('creates a dockerconfigjson Secret in the Project namespace', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.createNamespacedSecret.mockResolvedValue(
      registryCredentialSecret({
        name: 'kd-regcred-123',
        namespace: 'kd-project-123',
        workspaceId: 'workspace_1',
        displayName: 'GitHub Container Registry',
        registry: 'ghcr.io',
        username: 'octocat',
      }),
    );

    const result = await service.createRegistryCredential(workspace, {
      projectId: '123',
      name: 'GitHub Container Registry',
      registry: 'ghcr.io',
      username: 'octocat',
      password: 'secret-token',
    });

    expect(coreV1Api.createNamespacedSecret).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'kd-project-123',
        body: expect.objectContaining({
          apiVersion: 'v1',
          kind: 'Secret',
          metadata: expect.objectContaining({
            name: expect.stringMatching(/^kd-regcred-\d+$/),
            namespace: 'kd-project-123',
            labels: {
              'app.kubernetes.io/managed-by': 'kudeploy',
              'kudeploy.com/workspace': 'workspace_1',
              'kudeploy.com/project': 'kd-project-123',
            },
            annotations: {
              'kudeploy.com/display-name': 'GitHub Container Registry',
              'kudeploy.com/registry': 'ghcr.io',
              'kudeploy.com/registry-username': 'octocat',
            },
          }),
          stringData: {
            '.dockerconfigjson': JSON.stringify({
              auths: {
                'ghcr.io': {
                  auth: Buffer.from('octocat:secret-token').toString('base64'),
                  username: 'octocat',
                  password: 'secret-token',
                },
              },
            }),
          },
          type: 'kubernetes.io/dockerconfigjson',
        }),
        fieldManager: 'kudeploy-server',
      }),
    );
    expect(result).toMatchObject({
      id: '123',
      projectId: '123',
      name: 'GitHub Container Registry',
      registry: 'ghcr.io',
      username: 'octocat',
    });
  });

  it('updates an owned dockerconfigjson Secret without changing its Kubernetes name', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.readNamespacedSecret.mockResolvedValue(
      registryCredentialSecret({
        name: 'kd-regcred-123',
        namespace: 'kd-project-123',
        workspaceId: 'workspace_1',
        displayName: 'Old registry',
        registry: 'ghcr.io',
        username: 'old-user',
        password: 'old-token',
      }),
    );
    coreV1Api.patchNamespacedSecret.mockResolvedValue(
      registryCredentialSecret({
        name: 'kd-regcred-123',
        namespace: 'kd-project-123',
        workspaceId: 'workspace_1',
        displayName: 'New registry',
        registry: 'registry.example.com',
        username: 'new-user',
      }),
    );

    const result = await service.updateRegistryCredential(
      workspace,
      '123',
      '123',
      {
        name: 'New registry',
        registry: 'registry.example.com',
        username: 'new-user',
        password: 'new-token',
      },
    );

    expect(coreV1Api.readNamespacedSecret).toHaveBeenCalledWith({
      namespace: 'kd-project-123',
      name: 'kd-regcred-123',
    });
    expect(coreV1Api.patchNamespacedSecret).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'kd-project-123',
        name: 'kd-regcred-123',
        body: expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'kd-regcred-123',
            namespace: 'kd-project-123',
            annotations: expect.objectContaining({
              'kudeploy.com/display-name': 'New registry',
              'kudeploy.com/registry': 'registry.example.com',
              'kudeploy.com/registry-username': 'new-user',
            }),
          }),
          stringData: {
            '.dockerconfigjson': JSON.stringify({
              auths: {
                'registry.example.com': {
                  auth: Buffer.from('new-user:new-token').toString('base64'),
                  username: 'new-user',
                  password: 'new-token',
                },
              },
            }),
          },
          type: 'kubernetes.io/dockerconfigjson',
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
      name: 'New registry',
      registry: 'registry.example.com',
      username: 'new-user',
    });
  });

  it('filters listed Secrets by current workspace and project before returning a connection', async () => {
    const { service, coreV1Api, connectionManager, projectService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const visibleSecret = registryCredentialSecret({
      name: 'kd-regcred-visible',
      namespace: 'kd-project-123',
      workspaceId: 'workspace_1',
      displayName: 'Visible',
    });
    const hiddenSecret = registryCredentialSecret({
      name: 'kd-regcred-hidden',
      namespace: 'kd-project-123',
      workspaceId: 'workspace_2',
      displayName: 'Hidden',
    });

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.listNamespacedSecret.mockResolvedValue({
      items: [visibleSecret, hiddenSecret],
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

    const result = await service.findRegistryCredentials(workspace, '123', {
      first: 20,
    });

    expect(coreV1Api.listNamespacedSecret).toHaveBeenCalledWith({
      namespace: 'kd-project-123',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace=workspace_1,kudeploy.com/project=kd-project-123',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      RegistryCredentialConnection,
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

  it('does not delete a Secret outside the current workspace', async () => {
    const { service, coreV1Api, projectService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    projectService.findProject.mockResolvedValue({
      id: '123',
      name: 'Payments',
    });
    coreV1Api.readNamespacedSecret.mockResolvedValue(
      registryCredentialSecret({
        name: 'kd-regcred-123',
        namespace: 'kd-project-123',
        workspaceId: 'workspace_2',
      }),
    );

    await expect(
      service.deleteRegistryCredential(workspace, '123', '123'),
    ).rejects.toThrow('Registry credential not found');

    expect(coreV1Api.deleteNamespacedSecret).not.toHaveBeenCalled();
  });
});

function createService() {
  const coreV1Api = {
    createNamespacedSecret: jest.fn(),
    listNamespacedSecret: jest.fn(),
    readNamespacedSecret: jest.fn(),
    patchNamespacedSecret: jest.fn(),
    deleteNamespacedSecret: jest.fn(),
  };
  const connectionManager = {
    find: jest.fn(),
  };
  const projectService = {
    findProject: jest.fn(),
  };
  const service = new RegistryCredentialService(
    coreV1Api as unknown as CoreV1Api,
    connectionManager as unknown as KubernetesConnectionManager,
    projectService as unknown as ProjectService,
  );

  return { service, coreV1Api, connectionManager, projectService };
}

function registryCredentialSecret(
  options: {
    name?: string;
    namespace?: string;
    workspaceId?: string;
    displayName?: string;
    registry?: string;
    username?: string;
    password?: string;
  } = {},
): RegistryCredentialResource {
  const {
    name = 'kd-regcred-123',
    namespace = 'kd-project-123',
    workspaceId = 'workspace_1',
    displayName = 'GitHub Container Registry',
    registry = 'ghcr.io',
    username = 'octocat',
    password = 'secret-token',
  } = options;

  const dockerConfigJson = JSON.stringify({
    auths: {
      [registry]: {
        auth: Buffer.from(`${username}:${password}`).toString('base64'),
        username,
        password,
      },
    },
  });

  return {
    apiVersion: 'v1',
    kind: 'Secret',
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
        'kudeploy.com/registry': registry,
        'kudeploy.com/registry-username': username,
      },
      creationTimestamp: '2026-06-01T00:00:00.000Z',
    },
    data: {
      '.dockerconfigjson': Buffer.from(dockerConfigJson).toString('base64'),
    },
    type: 'kubernetes.io/dockerconfigjson',
  };
}
