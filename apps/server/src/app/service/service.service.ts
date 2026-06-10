import { CustomObjectsApi } from '@kubernetes/client-node';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Sonyflake } from 'sonyflake-js';

import { SERVER_SIDE_APPLY_OPTIONS } from '@/app/kubernetes';
import {
  hasKubernetesServiceNamePrefix,
  toGraphqlProjectId,
  toGraphqlServiceId,
  toKubernetesProjectName,
  toKubernetesServiceName,
} from '@/app/kubernetes/resource-names';
import {
  DISPLAY_NAME_ANNOTATION,
  KUDEPLOY_API_GROUP,
  KUDEPLOY_API_VERSION,
  KUDEPLOY_API_VERSION_NAME,
  KUDEPLOY_FIELD_MANAGER,
  KudeployCondition,
  MANAGED_BY_LABEL,
  MANAGED_BY_LABEL_VALUE,
  ProjectService,
  WORKSPACE_LABEL,
} from '@/app/project/project.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { CreateServiceInput } from './inputs/create-service.input';
import { ServiceHealthCheckInput } from './inputs/service-health-check.input';
import { ServiceResourcesInput } from './inputs/service-resources.input';
import { UpdateServiceInput } from './inputs/update-service.input';
import {
  ServiceConnection,
  ServiceConnectionArgs,
} from './service.connection-definition';
import { Service } from './service.object';
import { ServiceHealthCheckType } from './service-health-check-type.enum';
import { ServiceStatus } from './service-status.enum';

export const PROJECT_LABEL = 'kudeploy.com/project';
export const SERVICES_PLURAL = 'services';
const DEFAULT_SERVICE_REPLICAS = 1;

export interface ServiceResource {
  apiVersion: typeof KUDEPLOY_API_VERSION;
  kind: 'Service';
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
  };
  spec: {
    image: string;
    replicas?: number;
    command?: string[];
    args?: string[];
    resources?: ServiceResourceRequirements;
    ports: {
      port: number;
      targetPort?: number;
    }[];
    env?: {
      name: string;
      value: string;
    }[];
    readinessProbe?: ServiceResourceProbe;
    livenessProbe?: ServiceResourceProbe;
    startupProbe?: ServiceResourceProbe;
  };
  status?: {
    activeDeploymentName?: string;
    conditions?: KudeployCondition[];
    latestDeploymentName?: string;
  };
}

interface ServiceResourceRequirements {
  requests?: {
    cpu?: string;
    memory?: string;
  };
  limits?: {
    cpu?: string;
    memory?: string;
  };
}

interface ServiceResourceProbe {
  httpGet?: {
    path?: string;
    port: number | string;
  };
  tcpSocket?: {
    port: number | string;
  };
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

interface ServiceResourceInput {
  projectId: string;
  name: string;
  image: string;
  replicas?: number | null;
  command?: string[] | null;
  args?: string[] | null;
  resources?: ServiceResourcesInput | Service['resources'] | null;
  healthCheck?: ServiceHealthCheckInput | Service['healthCheck'] | null;
  ports: {
    port: number;
    targetPort?: number;
  }[];
  env?: {
    key: string;
    value: string;
  }[];
}

@Injectable()
export class ServiceService {
  constructor(
    private readonly customObjectsApi: CustomObjectsApi,
    private readonly connectionManager: KubernetesConnectionManager,
    private readonly projectService: ProjectService,
  ) {}

  async findServices(
    workspace: Workspace,
    projectId: string,
    args: ServiceConnectionArgs,
  ): Promise<ServiceConnection> {
    const projectName = toKubernetesProjectName(projectId);

    await this.ensureProject(workspace, projectId);

    const list = (await this.customObjectsApi.listNamespacedCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      namespace: projectName,
      plural: SERVICES_PLURAL,
      labelSelector: this.serviceLabelSelector(workspace, projectName),
    })) as { items?: ServiceResource[] };

    const items = (list.items ?? [])
      .filter((resource) =>
        this.belongsToWorkspaceAndProject(resource, workspace, projectName),
      )
      .map((resource) => this.toService(resource));

    return await this.connectionManager.find(ServiceConnection, args, {
      items,
    });
  }

  async findService(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<Service | null> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesServiceName(id);

    await this.ensureProject(workspace, projectId);

    try {
      const resource = (await this.customObjectsApi.getNamespacedCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectName,
        plural: SERVICES_PLURAL,
        name,
      })) as ServiceResource;

      if (
        !this.belongsToWorkspaceAndProject(resource, workspace, projectName)
      ) {
        return null;
      }

      return this.toService(resource);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async createService(
    workspace: Workspace,
    input: CreateServiceInput,
  ): Promise<Service> {
    const projectName = toKubernetesProjectName(input.projectId);

    await this.ensureProject(workspace, input.projectId);

    const name = toKubernetesServiceName(String(Sonyflake.next()));
    const resource = (await this.customObjectsApi.patchNamespacedCustomObject(
      {
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectName,
        plural: SERVICES_PLURAL,
        name,
        body: this.buildServiceResource(workspace, projectName, name, input),
        fieldManager: KUDEPLOY_FIELD_MANAGER,
        force: true,
      },
      SERVER_SIDE_APPLY_OPTIONS,
    )) as ServiceResource;

    return this.toService(resource);
  }

  async updateService(
    workspace: Workspace,
    projectId: string,
    id: string,
    input: UpdateServiceInput,
  ): Promise<Service> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesServiceName(id);
    const existing = await this.findService(workspace, projectId, id);
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const resource = (await this.customObjectsApi.patchNamespacedCustomObject(
      {
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectName,
        plural: SERVICES_PLURAL,
        name,
        body: this.buildServiceResource(workspace, projectName, name, {
          projectId,
          name: input.name ?? existing.name,
          image: input.image ?? existing.image,
          replicas:
            input.replicas === undefined
              ? (existing.replicas ?? undefined)
              : this.defaultReplicas(input.replicas),
          command:
            input.command === undefined
              ? existing.command
              : (input.command ?? undefined),
          args:
            input.args === undefined
              ? existing.args
              : (input.args ?? undefined),
          resources:
            input.resources === undefined
              ? (existing.resources ?? undefined)
              : input.resources,
          healthCheck:
            input.healthCheck === undefined
              ? (existing.healthCheck ?? undefined)
              : input.healthCheck,
          ports: input.ports ?? this.toServiceInputPorts(existing.ports),
          env: input.env ?? existing.env,
        }),
        fieldManager: KUDEPLOY_FIELD_MANAGER,
        force: true,
      },
      SERVER_SIDE_APPLY_OPTIONS,
    )) as ServiceResource;

    return this.toService(resource);
  }

  async deleteService(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<Service> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesServiceName(id);

    await this.ensureProject(workspace, projectId);

    const existingResource =
      (await this.customObjectsApi.getNamespacedCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectName,
        plural: SERVICES_PLURAL,
        name,
      })) as ServiceResource;

    if (
      !this.belongsToWorkspaceAndProject(
        existingResource,
        workspace,
        projectName,
      )
    ) {
      throw new NotFoundException('Service not found');
    }

    await this.customObjectsApi.deleteNamespacedCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      namespace: projectName,
      plural: SERVICES_PLURAL,
      name,
    });

    return this.toService(existingResource);
  }

  toService(resource: ServiceResource): Service {
    const creationTime = this.toDate(resource.metadata.creationTimestamp);

    return {
      id: toGraphqlServiceId(resource.metadata.name),
      projectId: toGraphqlProjectId(resource.metadata.namespace),
      name:
        resource.metadata.annotations?.[DISPLAY_NAME_ANNOTATION] ??
        resource.metadata.name,
      image: resource.spec.image,
      replicas: resource.spec.replicas ?? null,
      ports: resource.spec.ports.map((port) => ({
        port: port.port,
        targetPort: port.targetPort ?? null,
      })),
      env: (resource.spec.env ?? []).map((env) => ({
        key: env.name,
        value: env.value,
      })),
      command: resource.spec.command ?? [],
      args: resource.spec.args ?? [],
      resources: this.toServiceResources(resource.spec.resources),
      healthCheck: this.toServiceHealthCheck(resource.spec.readinessProbe),
      status: this.toServiceStatus(resource),
      activeDeploymentName: resource.status?.activeDeploymentName ?? null,
      latestDeploymentName: resource.status?.latestDeploymentName ?? null,
      createdAt: creationTime,
      updatedAt: creationTime,
    };
  }

  private async ensureProject(
    workspace: Workspace,
    projectId: string,
  ): Promise<void> {
    const project = await this.projectService.findProject(workspace, projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private buildServiceResource(
    workspace: Workspace,
    projectId: string,
    name: string,
    input: ServiceResourceInput,
  ): ServiceResource {
    const resources = this.buildResourceRequirements(input.resources);
    const readinessProbe = this.buildReadinessProbe(input.healthCheck);
    const livenessProbe = this.buildLivenessProbe(input.healthCheck);
    const startupProbe = this.buildStartupProbe(input.healthCheck);

    return {
      apiVersion: KUDEPLOY_API_VERSION,
      kind: 'Service',
      metadata: {
        name,
        namespace: projectId,
        labels: {
          [MANAGED_BY_LABEL]: MANAGED_BY_LABEL_VALUE,
          [WORKSPACE_LABEL]: workspace.id,
          [PROJECT_LABEL]: projectId,
        },
        annotations: {
          [DISPLAY_NAME_ANNOTATION]: input.name,
        },
      },
      spec: {
        image: input.image,
        replicas: this.defaultReplicas(input.replicas),
        ...(input.command?.length ? { command: input.command } : {}),
        ...(input.args?.length ? { args: input.args } : {}),
        ...(resources ? { resources } : {}),
        ...(readinessProbe ? { readinessProbe } : {}),
        ...(livenessProbe ? { livenessProbe } : {}),
        ...(startupProbe ? { startupProbe } : {}),
        ports: input.ports.map((port) => ({
          port: port.port,
          ...(port.targetPort === undefined
            ? {}
            : { targetPort: port.targetPort }),
        })),
        env: (input.env ?? []).map((env) => ({
          name: env.key,
          value: env.value,
        })),
      },
    };
  }

  private buildResourceRequirements(
    resources?: ServiceResourceInput['resources'],
  ): ServiceResourceRequirements | undefined {
    if (!resources) {
      return undefined;
    }

    const requests = {
      ...(this.nonEmpty(resources.cpuRequest)
        ? { cpu: resources.cpuRequest.trim() }
        : {}),
      ...(this.nonEmpty(resources.memoryRequest)
        ? { memory: resources.memoryRequest.trim() }
        : {}),
    };
    const limits = {
      ...(this.nonEmpty(resources.cpuLimit)
        ? { cpu: resources.cpuLimit.trim() }
        : {}),
      ...(this.nonEmpty(resources.memoryLimit)
        ? { memory: resources.memoryLimit.trim() }
        : {}),
    };

    const result = {
      ...(Object.keys(requests).length ? { requests } : {}),
      ...(Object.keys(limits).length ? { limits } : {}),
    };

    return Object.keys(result).length ? result : undefined;
  }

  private buildProbeAction(
    healthCheck?: ServiceResourceInput['healthCheck'],
  ): Pick<ServiceResourceProbe, 'httpGet' | 'tcpSocket'> | undefined {
    if (!healthCheck) {
      return undefined;
    }

    if (healthCheck.type === ServiceHealthCheckType.HTTP) {
      return {
        httpGet: {
          path: this.nonEmpty(healthCheck.path) ? healthCheck.path.trim() : '/',
          port: healthCheck.port,
        },
      };
    }

    return {
      tcpSocket: {
        port: healthCheck.port,
      },
    };
  }

  private defaultReplicas(replicas: number | null | undefined) {
    return replicas ?? DEFAULT_SERVICE_REPLICAS;
  }

  private buildReadinessProbe(
    healthCheck?: ServiceResourceInput['healthCheck'],
  ): ServiceResourceProbe | undefined {
    const action = this.buildProbeAction(healthCheck);
    if (!action) {
      return undefined;
    }

    return {
      ...action,
      initialDelaySeconds: 0,
      timeoutSeconds: 3,
      periodSeconds: 5,
      successThreshold: 1,
      failureThreshold: 3,
    };
  }

  private buildLivenessProbe(
    healthCheck?: ServiceResourceInput['healthCheck'],
  ): ServiceResourceProbe | undefined {
    const action = this.buildProbeAction(healthCheck);
    if (!action) {
      return undefined;
    }

    return {
      ...action,
      initialDelaySeconds: 0,
      timeoutSeconds: 3,
      periodSeconds: 10,
      successThreshold: 1,
      failureThreshold: 3,
    };
  }

  private buildStartupProbe(
    healthCheck?: ServiceResourceInput['healthCheck'],
  ): ServiceResourceProbe | undefined {
    const action = this.buildProbeAction(healthCheck);
    if (!action) {
      return undefined;
    }

    return {
      ...action,
      initialDelaySeconds: 0,
      timeoutSeconds: 3,
      periodSeconds: 10,
      successThreshold: 1,
      failureThreshold: 30,
    };
  }

  private toServiceStatus(resource: ServiceResource): ServiceStatus {
    const readyCondition = resource.status?.conditions?.find(
      (condition) => condition.type === 'Ready',
    );

    if (!readyCondition) {
      return ServiceStatus.PENDING;
    }

    if (readyCondition.status === 'True') {
      return ServiceStatus.READY;
    }

    if (readyCondition.status === 'False') {
      return readyCondition.reason === 'DeploymentProgressing'
        ? ServiceStatus.PROGRESSING
        : ServiceStatus.FAILED;
    }

    if (readyCondition.status === 'Unknown') {
      return ServiceStatus.PROGRESSING;
    }

    return ServiceStatus.UNKNOWN;
  }

  private belongsToWorkspaceAndProject(
    resource: ServiceResource,
    workspace: Workspace,
    projectId: string,
  ): boolean {
    return (
      resource.metadata.namespace === projectId &&
      hasKubernetesServiceNamePrefix(resource.metadata.name) &&
      resource.metadata.labels?.[MANAGED_BY_LABEL] === MANAGED_BY_LABEL_VALUE &&
      resource.metadata.labels?.[WORKSPACE_LABEL] === workspace.id &&
      resource.metadata.labels?.[PROJECT_LABEL] === projectId
    );
  }

  private serviceLabelSelector(
    workspace: Workspace,
    projectId: string,
  ): string {
    return `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE},${WORKSPACE_LABEL}=${workspace.id},${PROJECT_LABEL}=${projectId}`;
  }

  private toDate(value?: string): Date {
    return value ? new Date(value) : new Date(0);
  }

  private toServiceInputPorts(
    ports: Service['ports'],
  ): ServiceResourceInput['ports'] {
    return ports.map((port) => ({
      port: port.port,
      ...(port.targetPort == null ? {} : { targetPort: port.targetPort }),
    }));
  }

  private toServiceResources(
    resources?: ServiceResourceRequirements,
  ): Service['resources'] {
    if (!resources) {
      return null;
    }

    const result = {
      cpuRequest: resources.requests?.cpu ?? null,
      cpuLimit: resources.limits?.cpu ?? null,
      memoryRequest: resources.requests?.memory ?? null,
      memoryLimit: resources.limits?.memory ?? null,
    };

    return Object.values(result).some((value) => value !== null)
      ? result
      : null;
  }

  private toServiceHealthCheck(
    probe?: ServiceResourceProbe,
  ): Service['healthCheck'] {
    if (probe?.httpGet) {
      const port = this.toNumber(probe.httpGet.port);

      return port === null
        ? null
        : {
            type: ServiceHealthCheckType.HTTP,
            port,
            path: probe.httpGet.path ?? null,
          };
    }

    if (probe?.tcpSocket) {
      const port = this.toNumber(probe.tcpSocket.port);

      return port === null
        ? null
        : {
            type: ServiceHealthCheckType.TCP,
            port,
            path: null,
          };
    }

    return null;
  }

  private nonEmpty(value?: string | null): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private toNumber(value: number | string): number | null {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 404
    );
  }
}
