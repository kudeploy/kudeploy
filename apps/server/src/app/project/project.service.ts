import { CustomObjectsApi } from '@kubernetes/client-node';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Sonyflake } from 'sonyflake-js';

import { SERVER_SIDE_APPLY_OPTIONS } from '@/app/kubernetes';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import {
  ProjectConnection,
  ProjectConnectionArgs,
} from './project.connection-definition';
import { Project } from './project.object';
import { ProjectStatus } from './project-status.enum';

export const KUDEPLOY_API_VERSION = 'kudeploy.com/v1alpha1';
export const KUDEPLOY_API_GROUP = 'kudeploy.com';
export const KUDEPLOY_API_VERSION_NAME = 'v1alpha1';
export const KUDEPLOY_FIELD_MANAGER = 'kudeploy-server';
export const PROJECTS_PLURAL = 'projects';
export const MANAGED_BY_LABEL = 'app.kubernetes.io/managed-by';
export const MANAGED_BY_LABEL_VALUE = 'kudeploy';
export const WORKSPACE_ID_LABEL = 'kudeploy.com/workspace-id';
export const DISPLAY_NAME_ANNOTATION = 'kudeploy.com/display-name';

export interface KudeployCondition {
  type?: string;
  status?: string;
  reason?: string;
  message?: string;
}

export interface ProjectResource {
  apiVersion: typeof KUDEPLOY_API_VERSION;
  kind: 'Project';
  metadata: {
    name: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
    deletionTimestamp?: string;
  };
  spec: Record<string, never>;
  status?: {
    conditions?: KudeployCondition[];
  };
}

@Injectable()
export class ProjectService {
  constructor(
    private readonly customObjectsApi: CustomObjectsApi,
    private readonly connectionManager: KubernetesConnectionManager,
  ) {}

  async findProjects(
    workspace: Workspace,
    args: ProjectConnectionArgs,
  ): Promise<ProjectConnection> {
    const list = (await this.customObjectsApi.listClusterCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      plural: PROJECTS_PLURAL,
      labelSelector: this.workspaceLabelSelector(workspace),
    })) as { items?: ProjectResource[] };

    const items = (list.items ?? [])
      .filter((resource) => this.belongsToWorkspace(resource, workspace))
      .map((resource) => this.toProject(resource));

    return await this.connectionManager.find(ProjectConnection, args, {
      items,
    });
  }

  async findProject(workspace: Workspace, id: string): Promise<Project | null> {
    try {
      const resource = (await this.customObjectsApi.getClusterCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        plural: PROJECTS_PLURAL,
        name: id,
      })) as ProjectResource;

      if (!this.belongsToWorkspace(resource, workspace)) {
        return null;
      }

      return this.toProject(resource);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async createProject(
    workspace: Workspace,
    input: { name: string },
  ): Promise<Project> {
    const name = `project-${Sonyflake.next()}`;
    const resource = (await this.customObjectsApi.patchClusterCustomObject(
      {
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        plural: PROJECTS_PLURAL,
        name,
        body: this.buildProjectResource(workspace, name, input),
        fieldManager: KUDEPLOY_FIELD_MANAGER,
        force: true,
      },
      SERVER_SIDE_APPLY_OPTIONS,
    )) as ProjectResource;

    return this.toProject(resource);
  }

  async updateProject(
    workspace: Workspace,
    id: string,
    input: { name?: string },
  ): Promise<Project> {
    const existing = await this.findProject(workspace, id);
    if (!existing) {
      throw new NotFoundException('Project not found');
    }

    const resource = (await this.customObjectsApi.patchClusterCustomObject(
      {
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        plural: PROJECTS_PLURAL,
        name: id,
        body: this.buildProjectResource(workspace, id, {
          name: input.name ?? existing.name,
        }),
        fieldManager: KUDEPLOY_FIELD_MANAGER,
        force: true,
      },
      SERVER_SIDE_APPLY_OPTIONS,
    )) as ProjectResource;

    return this.toProject(resource);
  }

  async deleteProject(workspace: Workspace, id: string): Promise<Project> {
    const existingResource =
      (await this.customObjectsApi.getClusterCustomObject({
        group: KUDEPLOY_API_GROUP,
        version: KUDEPLOY_API_VERSION_NAME,
        plural: PROJECTS_PLURAL,
        name: id,
      })) as ProjectResource;

    if (!this.belongsToWorkspace(existingResource, workspace)) {
      throw new NotFoundException('Project not found');
    }

    await this.customObjectsApi.deleteClusterCustomObject({
      group: KUDEPLOY_API_GROUP,
      version: KUDEPLOY_API_VERSION_NAME,
      plural: PROJECTS_PLURAL,
      name: id,
    });

    return this.toProject(existingResource);
  }

  toProject(resource: ProjectResource): Project {
    const creationTime = this.toDate(resource.metadata.creationTimestamp);

    return {
      id: resource.metadata.name,
      name:
        resource.metadata.annotations?.[DISPLAY_NAME_ANNOTATION] ??
        resource.metadata.name,
      status: this.toProjectStatus(resource),
      createdAt: creationTime,
      updatedAt: creationTime,
    };
  }

  private buildProjectResource(
    workspace: Workspace,
    name: string,
    input: { name: string },
  ): ProjectResource {
    return {
      apiVersion: KUDEPLOY_API_VERSION,
      kind: 'Project',
      metadata: {
        name,
        labels: {
          [MANAGED_BY_LABEL]: MANAGED_BY_LABEL_VALUE,
          [WORKSPACE_ID_LABEL]: workspace.id,
        },
        annotations: {
          [DISPLAY_NAME_ANNOTATION]: input.name,
        },
      },
      spec: {},
    };
  }

  private toProjectStatus(resource: ProjectResource): ProjectStatus {
    const readyCondition = resource.status?.conditions?.find(
      (condition) => condition.type === 'Ready',
    );

    if (!readyCondition) {
      return ProjectStatus.PENDING;
    }

    if (readyCondition.status === 'True') {
      return ProjectStatus.READY;
    }

    if (readyCondition.status === 'False') {
      return ProjectStatus.FAILED;
    }

    if (readyCondition.status === 'Unknown') {
      return ProjectStatus.PROGRESSING;
    }

    return ProjectStatus.UNKNOWN;
  }

  private belongsToWorkspace(
    resource: ProjectResource,
    workspace: Workspace,
  ): boolean {
    return (
      resource.metadata.labels?.[MANAGED_BY_LABEL] === MANAGED_BY_LABEL_VALUE &&
      resource.metadata.labels?.[WORKSPACE_ID_LABEL] === workspace.id
    );
  }

  private workspaceLabelSelector(workspace: Workspace): string {
    return `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE},${WORKSPACE_ID_LABEL}=${workspace.id}`;
  }

  private toDate(value?: string): Date {
    return value ? new Date(value) : new Date(0);
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
