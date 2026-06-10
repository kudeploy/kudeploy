import { CustomObjectsApi } from '@kubernetes/client-node';
import { Injectable, NotFoundException } from '@nestjs/common';

import {
  toGraphqlProjectId,
  toGraphqlServiceId,
  toKubernetesProjectName,
  toKubernetesServiceName,
  toKubernetesWorkspaceName,
} from '@/app/kubernetes/resource-names';
import {
  KUDEPLOY_API_GROUP,
  KUDEPLOY_API_VERSION,
  KUDEPLOY_API_VERSION_NAME,
  KudeployCondition,
  MANAGED_BY_LABEL,
  MANAGED_BY_LABEL_VALUE,
  WORKSPACE_LABEL,
} from '@/app/project/project.service';
import { PROJECT_LABEL, ServiceService } from '@/app/service/service.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import {
  DeploymentConnection,
  DeploymentConnectionArgs,
} from './deployment.connection-definition';
import { Deployment } from './deployment.object';
import { DeploymentStatus } from './deployment-status.enum';

export const DEPLOYMENT_LABEL = 'kudeploy.com/deployment';
export const DEPLOYMENTS_PLURAL = 'deployments';
export const SERVICE_LABEL = 'kudeploy.com/service';

interface DeploymentCondition extends KudeployCondition {
  lastTransitionTime?: string;
}

interface DeploymentResourceRequirements {
  limits?: {
    cpu?: string;
    memory?: string;
  };
  requests?: {
    cpu?: string;
    memory?: string;
  };
}

interface DeploymentResourceEnvVar {
  name: string;
  value?: string;
}

interface DeploymentResourceEnvFromSource {
  configMapRef?: {
    name?: string;
  };
  prefix?: string;
  secretRef?: {
    name?: string;
  };
}

export interface DeploymentResource {
  apiVersion: typeof KUDEPLOY_API_VERSION;
  kind: 'Deployment';
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    creationTimestamp?: string;
  };
  spec: {
    args?: string[];
    command?: string[];
    env?: DeploymentResourceEnvVar[];
    envFrom?: DeploymentResourceEnvFromSource[];
    image: string;
    ports?: {
      port: number;
      targetPort?: number;
    }[];
    replicas?: number;
    resources?: DeploymentResourceRequirements;
    serviceAccountName?: string;
    serviceName: string;
    version: number;
  };
  status?: {
    conditions?: DeploymentCondition[];
    kubernetesDeploymentName?: string;
  };
}

@Injectable()
export class DeploymentService {
  constructor(
    private readonly customObjectsApi: CustomObjectsApi,
    private readonly connectionManager: KubernetesConnectionManager,
    private readonly serviceService: ServiceService,
  ) {}

  async findDeployments(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
    args: DeploymentConnectionArgs,
  ): Promise<DeploymentConnection> {
    const projectName = toKubernetesProjectName(projectId);
    const serviceName = toKubernetesServiceName(serviceId);
    const service = await this.serviceService.findService(
      workspace,
      projectId,
      serviceId,
    );

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const list = (await this.customObjectsApi.listNamespacedCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      namespace: projectName,
      plural: DEPLOYMENTS_PLURAL,
      labelSelector: this.deploymentLabelSelector(
        workspace,
        projectName,
        serviceName,
      ),
    })) as { items?: DeploymentResource[] };

    const items = (list.items ?? [])
      .filter((resource) =>
        this.belongsToWorkspaceProjectAndService(
          resource,
          workspace,
          projectName,
          serviceName,
        ),
      )
      .map((resource) =>
        this.toDeployment(resource, {
          activeDeploymentName: service.activeDeploymentName,
          latestDeploymentName: service.latestDeploymentName,
        }),
      );

    return await this.connectionManager.find(DeploymentConnection, args, {
      items,
    });
  }

  async findDeployment(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<Deployment | null> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesServiceName(id);

    try {
      const resource = (await this.customObjectsApi.getNamespacedCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectName,
        plural: DEPLOYMENTS_PLURAL,
        name,
      })) as DeploymentResource;

      const serviceName = resource.metadata.labels?.[SERVICE_LABEL];

      if (
        !serviceName ||
        !this.belongsToWorkspaceProjectAndService(
          resource,
          workspace,
          projectName,
          serviceName,
        )
      ) {
        return null;
      }

      const serviceId = toGraphqlServiceId(serviceName);
      const service = await this.serviceService.findService(
        workspace,
        projectId,
        serviceId,
      );

      if (!service) {
        return null;
      }

      return this.toDeployment(resource, {
        activeDeploymentName: service.activeDeploymentName,
        latestDeploymentName: service.latestDeploymentName,
      });
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }

      throw error;
    }
  }

  toDeployment(
    resource: DeploymentResource,
    serviceStatus: {
      activeDeploymentName?: string | null;
      latestDeploymentName?: string | null;
    } = {},
  ): Deployment {
    const createdAt = this.toDate(resource.metadata.creationTimestamp);
    const updatedAt = this.toUpdatedAt(resource, createdAt);

    return {
      id: toGraphqlServiceId(resource.metadata.name),
      projectId: toGraphqlProjectId(resource.metadata.namespace),
      serviceId: toGraphqlServiceId(
        resource.metadata.labels?.[SERVICE_LABEL] ?? resource.spec.serviceName,
      ),
      version: resource.spec.version,
      image: resource.spec.image,
      replicas: resource.spec.replicas ?? null,
      ports: (resource.spec.ports ?? []).map((port) => ({
        port: port.port,
        targetPort: port.targetPort ?? null,
      })),
      env: (resource.spec.env ?? []).map((env) => ({
        name: env.name,
        value: env.value ?? null,
      })),
      envFrom: this.toDeploymentEnvFrom(resource),
      command: resource.spec.command ?? [],
      args: resource.spec.args ?? [],
      resources: this.toDeploymentResources(resource),
      serviceAccountName: resource.spec.serviceAccountName ?? null,
      status: this.toDeploymentStatus(resource),
      active: resource.metadata.name === serviceStatus.activeDeploymentName,
      latest: resource.metadata.name === serviceStatus.latestDeploymentName,
      kubernetesDeploymentName:
        resource.status?.kubernetesDeploymentName ?? null,
      createdAt,
      updatedAt,
    };
  }

  private deploymentLabelSelector(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
  ) {
    return [
      `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE}`,
      `${WORKSPACE_LABEL}=${toKubernetesWorkspaceName(workspace.id)}`,
      `${PROJECT_LABEL}=${projectId}`,
      `${SERVICE_LABEL}=${serviceId}`,
    ].join(',');
  }

  private belongsToWorkspaceProjectAndService(
    resource: DeploymentResource,
    workspace: Workspace,
    projectId: string,
    serviceId: string,
  ) {
    const labels = resource.metadata.labels ?? {};

    return (
      resource.metadata.namespace === projectId &&
      labels[MANAGED_BY_LABEL] === MANAGED_BY_LABEL_VALUE &&
      labels[WORKSPACE_LABEL] === toKubernetesWorkspaceName(workspace.id) &&
      labels[PROJECT_LABEL] === projectId &&
      labels[SERVICE_LABEL] === serviceId
    );
  }

  private toDeploymentStatus(resource: DeploymentResource) {
    const readyCondition = resource.status?.conditions?.find(
      (condition) => condition.type === 'Ready',
    );

    if (!readyCondition) {
      return DeploymentStatus.PENDING;
    }

    if (readyCondition.status === 'True') {
      return DeploymentStatus.READY;
    }

    if (readyCondition.status === 'Unknown') {
      return DeploymentStatus.UNKNOWN;
    }

    if (readyCondition.reason?.includes('Progress')) {
      return DeploymentStatus.PROGRESSING;
    }

    return DeploymentStatus.FAILED;
  }

  private toDeploymentResources(resource: DeploymentResource) {
    const resources = resource.spec.resources;

    if (!resources?.limits && !resources?.requests) {
      return null;
    }

    return {
      cpuRequest: resources.requests?.cpu ?? null,
      cpuLimit: resources.limits?.cpu ?? null,
      memoryRequest: resources.requests?.memory ?? null,
      memoryLimit: resources.limits?.memory ?? null,
    };
  }

  private toDeploymentEnvFrom(resource: DeploymentResource) {
    return (resource.spec.envFrom ?? []).flatMap((envFrom) => {
      const sources: {
        kind: string;
        name: string;
        prefix: string | null;
      }[] = [];

      if (envFrom.configMapRef?.name) {
        sources.push({
          kind: 'ConfigMap',
          name: envFrom.configMapRef.name,
          prefix: envFrom.prefix ?? null,
        });
      }

      if (envFrom.secretRef?.name) {
        sources.push({
          kind: 'Secret',
          name: envFrom.secretRef.name,
          prefix: envFrom.prefix ?? null,
        });
      }

      return sources;
    });
  }

  private toUpdatedAt(resource: DeploymentResource, fallback: Date) {
    const conditionTimes = (resource.status?.conditions ?? [])
      .map((condition) => this.toDate(condition.lastTransitionTime))
      .filter((date) => date.getTime() > 0)
      .sort((left, right) => right.getTime() - left.getTime());

    return conditionTimes[0] ?? fallback;
  }

  private toDate(value?: string) {
    if (!value) {
      return new Date(0);
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  private isNotFoundError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 404
    );
  }
}
