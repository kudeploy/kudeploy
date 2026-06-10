import { CoreV1Api, type V1Namespace } from '@kubernetes/client-node';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Sonyflake } from 'sonyflake-js';

import {
  hasKubernetesProjectNamePrefix,
  SERVER_SIDE_APPLY_OPTIONS,
  toGraphqlProjectId,
  toKubernetesProjectName,
} from '@/app/kubernetes';
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
export const MANAGED_BY_LABEL = 'app.kubernetes.io/managed-by';
export const MANAGED_BY_LABEL_VALUE = 'kudeploy';
export const WORKSPACE_ID_LABEL = 'kudeploy.com/workspace-id';
export const DISPLAY_NAME_ANNOTATION = 'kudeploy.com/display-name';
export const PROJECT_LABEL = 'kudeploy.com/project';

export interface KudeployCondition {
  type?: string;
  status?: string;
  reason?: string;
  message?: string;
}

export interface ProjectResource extends Omit<V1Namespace, 'metadata'> {
  apiVersion?: 'v1';
  kind?: 'Namespace';
  metadata: {
    name: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
    deletionTimestamp?: string;
  };
  status?: {
    phase?: string;
  };
}

@Injectable()
export class ProjectService {
  constructor(
    private readonly coreV1Api: CoreV1Api,
    private readonly connectionManager: KubernetesConnectionManager,
  ) {}

  async findProjects(
    workspace: Workspace,
    args: ProjectConnectionArgs,
  ): Promise<ProjectConnection> {
    const list = (await this.coreV1Api.listNamespace({
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
    const name = toKubernetesProjectName(id);

    try {
      const resource = (await this.coreV1Api.readNamespace({
        name,
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
    const name = toKubernetesProjectName(String(Sonyflake.next()));
    const resource = (await this.coreV1Api.createNamespace({
      body: this.buildProjectResource(workspace, name, input),
      fieldManager: KUDEPLOY_FIELD_MANAGER,
    })) as ProjectResource;

    return this.toProject(resource);
  }

  async updateProject(
    workspace: Workspace,
    id: string,
    input: { name?: string },
  ): Promise<Project> {
    const name = toKubernetesProjectName(id);
    const existing = await this.findProject(workspace, id);
    if (!existing) {
      throw new NotFoundException('Project not found');
    }

    const resource = (await this.coreV1Api.patchNamespace(
      {
        name,
        body: this.buildProjectResource(workspace, name, {
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
    const name = toKubernetesProjectName(id);
    const existingResource = (await this.coreV1Api.readNamespace({
      name,
    })) as ProjectResource;

    if (!this.belongsToWorkspace(existingResource, workspace)) {
      throw new NotFoundException('Project not found');
    }

    await this.coreV1Api.deleteNamespace({
      name,
    });

    return this.toProject(existingResource);
  }

  toProject(resource: ProjectResource): Project {
    const creationTime = this.toDate(resource.metadata.creationTimestamp);

    return {
      id: toGraphqlProjectId(resource.metadata.name),
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
  ): V1Namespace {
    return {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name,
        labels: {
          [MANAGED_BY_LABEL]: MANAGED_BY_LABEL_VALUE,
          [WORKSPACE_ID_LABEL]: workspace.id,
          [PROJECT_LABEL]: name,
        },
        annotations: {
          [DISPLAY_NAME_ANNOTATION]: input.name,
        },
      },
    };
  }

  private toProjectStatus(resource: ProjectResource): ProjectStatus {
    if (resource.metadata.deletionTimestamp) {
      return ProjectStatus.PROGRESSING;
    }

    switch (resource.status?.phase) {
      case 'Active':
        return ProjectStatus.READY;
      case 'Terminating':
        return ProjectStatus.PROGRESSING;
      case undefined:
        return ProjectStatus.PENDING;
      default:
        return ProjectStatus.UNKNOWN;
    }
  }

  private belongsToWorkspace(
    resource: ProjectResource,
    workspace: Workspace,
  ): boolean {
    return (
      resource.metadata.labels?.[MANAGED_BY_LABEL] === MANAGED_BY_LABEL_VALUE &&
      hasKubernetesProjectNamePrefix(resource.metadata.name) &&
      resource.metadata.labels?.[WORKSPACE_ID_LABEL] === workspace.id &&
      resource.metadata.labels?.[PROJECT_LABEL] === resource.metadata.name
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
