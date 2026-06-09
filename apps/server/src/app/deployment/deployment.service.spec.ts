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
      activeDeploymentName: 'deployment-2',
      id: 'service-1',
      latestDeploymentName: 'deployment-2',
      projectId: 'project-1',
    });
    customObjectsApi.listNamespacedCustomObject.mockResolvedValue({
      items: [
        deploymentCrd({
          name: 'deployment-1',
          version: 1,
          image: 'traefik/whoami',
        }),
        deploymentCrd({
          name: 'deployment-2',
          version: 2,
          image: 'nginx',
        }),
        deploymentCrd({
          name: 'deployment-hidden',
          serviceId: 'service-hidden',
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

    const result = await service.findDeployments(
      workspace,
      'project-1',
      'service-1',
      { first: 20 },
    );

    expect(serviceService.findService).toHaveBeenCalledWith(
      workspace,
      'project-1',
      'service-1',
    );
    expect(customObjectsApi.listNamespacedCustomObject).toHaveBeenCalledWith({
      group: 'kudeploy.com',
      version: 'v1alpha1',
      namespace: 'project-1',
      plural: 'deployments',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace-id=workspace_1,kudeploy.com/project=project-1,kudeploy.com/service=service-1',
    });
    expect(connectionManager.find).toHaveBeenCalledWith(
      DeploymentConnection,
      { first: 20 },
      {
        items: [
          expect.objectContaining({
            active: false,
            id: 'deployment-1',
            image: 'traefik/whoami',
            latest: false,
            serviceId: 'service-1',
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
            id: 'deployment-2',
            image: 'nginx',
            latest: true,
            ports: [{ port: 80, targetPort: 8080 }],
            resources: {
              cpuLimit: '500m',
              cpuRequest: '250m',
              memoryLimit: '512Mi',
              memoryRequest: '256Mi',
            },
            serviceAccountName: 'service-service-1',
            serviceId: 'service-1',
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
      service.findDeployments(
        { id: 'workspace_1' } as Workspace,
        'project-1',
        'service-1',
        {
          first: 20,
        },
      ),
    ).rejects.toThrow('Service not found');

    expect(customObjectsApi.listNamespacedCustomObject).not.toHaveBeenCalled();
    expect(connectionManager.find).not.toHaveBeenCalled();
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
    name = 'deployment-1',
    projectId = 'project-1',
    serviceId = 'service-1',
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
        'kudeploy.com/workspace-id': 'workspace_1',
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
