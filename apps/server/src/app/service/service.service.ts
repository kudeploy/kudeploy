import { CustomObjectsApi } from '@kubernetes/client-node';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Sonyflake } from 'sonyflake-js';

import { SERVER_SIDE_APPLY_OPTIONS } from '@/app/kubernetes';
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
  WORKSPACE_ID_LABEL,
} from '@/app/project/project.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import {
  ServiceConnection,
  ServiceConnectionArgs,
} from './service.connection-definition';
import { CreateServiceInput } from './inputs/create-service.input';
import { UpdateServiceInput } from './inputs/update-service.input';
import { Service } from './service.object';
import { ServiceStatus } from './service-status.enum';

export const PROJECT_LABEL = 'kudeploy.com/project';
export const SERVICES_PLURAL = 'services';

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
    ports: Array<{
      port: number;
      targetPort?: number;
    }>;
    env?: Array<{
      name: string;
      value: string;
    }>;
  };
  status?: {
    conditions?: KudeployCondition[];
  };
}

interface ServiceResourceInput {
  projectId: string;
  name: string;
  image: string;
  replicas?: number;
  ports: Array<{
    port: number;
    targetPort?: number;
  }>;
  env?: Array<{
    key: string;
    value: string;
  }>;
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
    await this.ensureProject(workspace, projectId);

    const list = (await this.customObjectsApi.listNamespacedCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      namespace: projectId,
      plural: SERVICES_PLURAL,
      labelSelector: this.serviceLabelSelector(workspace, projectId),
    })) as { items?: ServiceResource[] };

    const items = (list.items ?? [])
      .filter((resource) =>
        this.belongsToWorkspaceAndProject(resource, workspace, projectId),
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
    await this.ensureProject(workspace, projectId);

    try {
      const resource = (await this.customObjectsApi.getNamespacedCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectId,
        plural: SERVICES_PLURAL,
        name: id,
      })) as ServiceResource;

      if (!this.belongsToWorkspaceAndProject(resource, workspace, projectId)) {
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
    await this.ensureProject(workspace, input.projectId);

    const name = `service-${Sonyflake.next()}`;
    const resource = (await this.customObjectsApi.patchNamespacedCustomObject(
      {
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: input.projectId,
        plural: SERVICES_PLURAL,
        name,
        body: this.buildServiceResource(
          workspace,
          input.projectId,
          name,
          input,
        ),
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
    const existing = await this.findService(workspace, projectId, id);
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const resource = (await this.customObjectsApi.patchNamespacedCustomObject(
      {
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectId,
        plural: SERVICES_PLURAL,
        name: id,
        body: this.buildServiceResource(workspace, projectId, id, {
          projectId,
          name: input.name ?? existing.name,
          image: input.image ?? existing.image,
          replicas:
            input.replicas === undefined
              ? (existing.replicas ?? undefined)
              : input.replicas,
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
    await this.ensureProject(workspace, projectId);

    const existingResource =
      (await this.customObjectsApi.getNamespacedCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        namespace: projectId,
        plural: SERVICES_PLURAL,
        name: id,
      })) as ServiceResource;

    if (
      !this.belongsToWorkspaceAndProject(existingResource, workspace, projectId)
    ) {
      throw new NotFoundException('Service not found');
    }

    await this.customObjectsApi.deleteNamespacedCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      namespace: projectId,
      plural: SERVICES_PLURAL,
      name: id,
    });

    return this.toService(existingResource);
  }

  toService(resource: ServiceResource): Service {
    const creationTime = this.toDate(resource.metadata.creationTimestamp);

    return {
      id: resource.metadata.name,
      projectId: resource.metadata.namespace,
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
      status: this.toServiceStatus(resource),
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
    return {
      apiVersion: KUDEPLOY_API_VERSION,
      kind: 'Service',
      metadata: {
        name,
        namespace: projectId,
        labels: {
          [MANAGED_BY_LABEL]: MANAGED_BY_LABEL_VALUE,
          [WORKSPACE_ID_LABEL]: workspace.id,
          [PROJECT_LABEL]: projectId,
        },
        annotations: {
          [DISPLAY_NAME_ANNOTATION]: input.name,
        },
      },
      spec: {
        image: input.image,
        ...(input.replicas === undefined ? {} : { replicas: input.replicas }),
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
      resource.metadata.labels?.[MANAGED_BY_LABEL] === MANAGED_BY_LABEL_VALUE &&
      resource.metadata.labels?.[WORKSPACE_ID_LABEL] === workspace.id &&
      resource.metadata.labels?.[PROJECT_LABEL] === projectId
    );
  }

  private serviceLabelSelector(
    workspace: Workspace,
    projectId: string,
  ): string {
    return `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE},${WORKSPACE_ID_LABEL}=${workspace.id},${PROJECT_LABEL}=${projectId}`;
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

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 404
    );
  }
}
