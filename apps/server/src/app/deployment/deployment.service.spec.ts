jest.mock('@kubernetes/client-node', () => ({
  CustomObjectsApi: class CustomObjectsApi {},
}));

import type { CustomObjectsApi } from '@kubernetes/client-node';

import { ServiceService } from '@/app/service/service.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { DeploymentConnection } from './deployment.connection-definition';
import { DeploymentResource, DeploymentService } from './deployment.service';
import { DeploymentStatus } from './deployment-status.enum';

describe('DeploymentService', () => {
  it('lists Deployment CRDs for a service and marks active/latest versions', async () => {
    const { service, customObjectsApi, connectionManager, serviceService } =
      createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    serviceService.findService.mockResolvedValue({
      activeDeploymentName: 'kd-service-1-00002',
      id: '1',
      latestDeploymentName: 'kd-service-1-00002',
      projectId: '1',
    });
    customObjectsApi.listNamespacedCustomObject.mockResolvedValue({
      items: [
        deploymentCrd({
          name: 'kd-service-1-00001',
          version: 1,
          image: 'traefik/whoami',
        }),
        deploymentCrd({
          name: 'kd-service-1-00002',
          version: 2,
          image: 'nginx',
        }),
        deploymentCrd({
          name: 'kd-service-hidden-00003',
          serviceId: 'kd-service-hidden',
          version: 3,
        }),
      ],
    });
    connectionManager.find.mockImplementation(
      async (_connection, _args, options) => ({
        totalCount: options.items.length,
        edges: options.items.map((node: { id: string }) => ({
          cursor: node.id,
          node,
        })),
        pageInfo: {
          endCursor: options.items.at(-1)?.id ?? null,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: options.items[0]?.id ?? null,
        },
      }),
    );

    const result = await service.findDeployments(workspace, '1', '1', {
      first: 20,
    });

    expect(serviceService.findService).toHaveBeenCalledWith(
      workspace,
      '1',
      '1',
    );
    expect(customObjectsApi.listNamespacedCustomObject).toHaveBeenCalledWith({
      group: 'kudeploy.com',
      version: 'v1alpha1',
      namespace: 'kd-project-1',
      plural: 'deployments',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace=workspace_1,kudeploy.com/project=kd-project-1,kudeploy.com/service=kd-service-1',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      DeploymentConnection,
      { first: 20 },
      {
        items: [
          expect.objectContaining({
            active: false,
            id: '1-00001',
            image: 'traefik/whoami',
            latest: false,
            projectId: '1',
            serviceId: '1',
            status: DeploymentStatus.READY,
            version: 1,
          }),
          expect.objectContaining({
            active: true,
            args: ['server.js'],
            command: ['node'],
            env: [{ name: 'NODE_ENV', value: 'production' }],
            envFrom: [
              { kind: 'ConfigMap', name: 'service-config', prefix: null },
              { kind: 'Secret', name: 'service-secret', prefix: null },
            ],
            id: '1-00002',
            image: 'nginx',
            latest: true,
            ports: [{ port: 80, targetPort: 8080 }],
            resources: {
              cpuLimit: '500m',
              cpuRequest: '250m',
              memoryLimit: '512Mi',
              memoryRequest: '256Mi',
            },
            serviceAccountName: 'service-kd-service-1',
            projectId: '1',
            serviceId: '1',
            status: DeploymentStatus.READY,
            version: 2,
          }),
        ],
      },
    );
    expect(result.totalCount).toBe(2);
  });

  it('does not list deployments when the service is outside the workspace', async () => {
    const { service, customObjectsApi, connectionManager, serviceService } =
      createService();

    serviceService.findService.mockResolvedValue(null);

    await expect(
      service.findDeployments({ id: 'workspace_1' } as Workspace, '1', '1', {
        first: 20,
      }),
    ).rejects.toThrow('Service not found');

    expect(customObjectsApi.listNamespacedCustomObject).not.toHaveBeenCalled();
    expect(connectionManager.find).not.toHaveBeenCalled();
  });

  it('reads a Deployment CRD by adding the service prefix to the GraphQL deployment id', async () => {
    const { service, customObjectsApi, serviceService } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    customObjectsApi.getNamespacedCustomObject.mockResolvedValue(
      deploymentCrd({
        name: 'kd-service-1-00001',
      }),
    );
    serviceService.findService.mockResolvedValue({
      activeDeploymentName: 'kd-service-1-00001',
      id: '1',
      latestDeploymentName: 'kd-service-1-00001',
      projectId: '1',
    });

    const result = await service.findDeployment(workspace, '1', '1-00001');

    expect(customObjectsApi.getNamespacedCustomObject).toHaveBeenCalledWith({
      group: 'kudeploy.com',
      version: 'v1alpha1',
      namespace: 'kd-project-1',
      plural: 'deployments',
      name: 'kd-service-1-00001',
    });
    expect(serviceService.findService).toHaveBeenCalledWith(
      workspace,
      '1',
      '1',
    );
    expect(result).toMatchObject({
      active: true,
      id: '1-00001',
      latest: true,
      projectId: '1',
      serviceId: '1',
    });
  });
});

function createService() {
  const customObjectsApi = {
    getNamespacedCustomObject: jest.fn(),
    listNamespacedCustomObject: jest.fn(),
  };
  const connectionManager = {
    find: jest.fn(),
  };
  const serviceService = {
    findService: jest.fn(),
  };
  const service = new DeploymentService(
    customObjectsApi as unknown as CustomObjectsApi,
    connectionManager as unknown as KubernetesConnectionManager,
    serviceService as unknown as ServiceService,
  );

  return { service, customObjectsApi, connectionManager, serviceService };
}

function deploymentCrd(
  options: {
    image?: string;
    name?: string;
    projectId?: string;
    serviceId?: string;
    version?: number;
  } = {},
): DeploymentResource {
  const {
    image = 'nginx',
    name = 'kd-service-1-00001',
    projectId = 'kd-project-1',
    serviceId = 'kd-service-1',
    version = 1,
  } = options;

  return {
    apiVersion: 'kudeploy.com/v1alpha1',
    kind: 'Deployment',
    metadata: {
      creationTimestamp: '2026-06-08T12:38:18.000Z',
      labels: {
        'app.kubernetes.io/managed-by': 'kudeploy',
        'kudeploy.com/deployment': name,
        'kudeploy.com/project': projectId,
        'kudeploy.com/service': serviceId,
        'kudeploy.com/workspace': 'workspace_1',
      },
      name,
      namespace: projectId,
    },
    spec: {
      args: ['server.js'],
      command: ['node'],
      env: [{ name: 'NODE_ENV', value: 'production' }],
      envFrom: [
        { configMapRef: { name: 'service-config' } },
        { secretRef: { name: 'service-secret' } },
      ],
      image,
      ports: [{ port: 80, targetPort: 8080 }],
      replicas: 1,
      resources: {
        limits: {
          cpu: '500m',
          memory: '512Mi',
        },
        requests: {
          cpu: '250m',
          memory: '256Mi',
        },
      },
      serviceAccountName: `service-${serviceId}`,
      serviceName: serviceId,
      version,
    },
    status: {
      conditions: [
        {
          lastTransitionTime: '2026-06-08T12:39:18.000Z',
          message: 'Kubernetes Deployment is available.',
          reason: 'KubernetesDeploymentAvailable',
          status: 'True',
          type: 'Ready',
        },
      ],
      kubernetesDeploymentName: name,
    },
  };
}
