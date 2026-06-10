import {
  CoreV1Api,
  type V1PersistentVolumeClaim,
} from '@kubernetes/client-node';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Sonyflake } from 'sonyflake-js';

import {
  DISPLAY_NAME_ANNOTATION,
  KUDEPLOY_FIELD_MANAGER,
  MANAGED_BY_LABEL,
  MANAGED_BY_LABEL_VALUE,
  ProjectService,
  WORKSPACE_ID_LABEL,
} from '@/app/project/project.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { CreateVolumeInput } from './inputs/create-volume.input';
import {
  VolumeConnection,
  VolumeConnectionArgs,
} from './volume.connection-definition';
import { Volume } from './volume.object';
import { VolumeStatus } from './volume-status.enum';

export const PROJECT_LABEL = 'kudeploy.com/project';
const DEFAULT_VOLUME_ACCESS_MODES = ['ReadWriteOnce'];

export interface VolumeResource {
  apiVersion?: 'v1';
  kind?: 'PersistentVolumeClaim';
  metadata?: {
    name?: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
  };
  spec?: {
    accessModes?: string[];
    resources?: {
      requests?: {
        storage?: string;
      };
    };
  };
  status?: {
    phase?: string;
  };
}

@Injectable()
export class VolumeService {
  constructor(
    private readonly coreV1Api: CoreV1Api,
    private readonly connectionManager: KubernetesConnectionManager,
    private readonly projectService: ProjectService,
  ) {}

  async findVolumes(
    workspace: Workspace,
    projectId: string,
    args: VolumeConnectionArgs,
  ): Promise<VolumeConnection> {
    await this.ensureProject(workspace, projectId);

    const list = (await this.coreV1Api.listNamespacedPersistentVolumeClaim({
      namespace: projectId,
      labelSelector: this.volumeLabelSelector(workspace, projectId),
    })) as { items?: VolumeResource[] };

    const items = (list.items ?? [])
      .filter((resource) =>
        this.belongsToWorkspaceAndProject(resource, workspace, projectId),
      )
      .map((resource) => this.toVolume(resource));

    return await this.connectionManager.find(VolumeConnection, args, {
      items,
    });
  }

  async findVolume(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<Volume | null> {
    await this.ensureProject(workspace, projectId);

    try {
      const resource =
        (await this.coreV1Api.readNamespacedPersistentVolumeClaim({
          namespace: projectId,
          name: id,
        })) as VolumeResource;

      if (!this.belongsToWorkspaceAndProject(resource, workspace, projectId)) {
        return null;
      }

      return this.toVolume(resource);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async createVolume(
    workspace: Workspace,
    input: CreateVolumeInput,
  ): Promise<Volume> {
    await this.ensureProject(workspace, input.projectId);

    const name = `volume-${Sonyflake.next()}`;
    const resource =
      (await this.coreV1Api.createNamespacedPersistentVolumeClaim({
        namespace: input.projectId,
        body: this.buildVolumeResource(workspace, input.projectId, name, input),
        fieldManager: KUDEPLOY_FIELD_MANAGER,
      })) as VolumeResource;

    return this.toVolume(resource);
  }

  async deleteVolume(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<Volume> {
    await this.ensureProject(workspace, projectId);

    const resource = await this.getOwnedVolume(workspace, projectId, id);

    await this.coreV1Api.deleteNamespacedPersistentVolumeClaim({
      namespace: projectId,
      name: id,
    });

    return this.toVolume(resource);
  }

  toVolume(resource: VolumeResource): Volume {
    const createdAt = this.toDate(resource.metadata?.creationTimestamp);
    const size = this.toVolumeSize(
      resource.spec?.resources?.requests?.storage,
    );

    return {
      id: resource.metadata?.name ?? '',
      projectId: resource.metadata?.namespace ?? '',
      name:
        resource.metadata?.annotations?.[DISPLAY_NAME_ANNOTATION] ??
        resource.metadata?.name ??
        '',
      size,
      status: this.toVolumeStatus(resource),
      createdAt,
      updatedAt: createdAt,
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

  private async getOwnedVolume(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<VolumeResource> {
    try {
      const resource =
        (await this.coreV1Api.readNamespacedPersistentVolumeClaim({
          namespace: projectId,
          name: id,
        })) as VolumeResource;

      if (!this.belongsToWorkspaceAndProject(resource, workspace, projectId)) {
        throw new NotFoundException('Volume not found');
      }

      return resource;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('Volume not found');
      }
      throw error;
    }
  }

  private buildVolumeResource(
    workspace: Workspace,
    projectId: string,
    name: string,
    input: CreateVolumeInput,
  ): V1PersistentVolumeClaim {
    return {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
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
        accessModes: DEFAULT_VOLUME_ACCESS_MODES,
        resources: {
          requests: {
            storage: `${input.size}Gi`,
          },
        },
      },
    };
  }

  private toVolumeStatus(resource: VolumeResource): VolumeStatus {
    switch (resource.status?.phase) {
      case 'Bound':
        return VolumeStatus.BOUND;
      case 'Lost':
        return VolumeStatus.LOST;
      case 'Pending':
      case undefined:
        return VolumeStatus.PENDING;
      default:
        return VolumeStatus.UNKNOWN;
    }
  }

  private belongsToWorkspaceAndProject(
    resource: VolumeResource,
    workspace: Workspace,
    projectId: string,
  ): boolean {
    return (
      resource.metadata?.namespace === projectId &&
      resource.metadata?.labels?.[MANAGED_BY_LABEL] ===
        MANAGED_BY_LABEL_VALUE &&
      resource.metadata?.labels?.[WORKSPACE_ID_LABEL] === workspace.id &&
      resource.metadata?.labels?.[PROJECT_LABEL] === projectId
    );
  }

  private volumeLabelSelector(workspace: Workspace, projectId: string): string {
    return `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE},${WORKSPACE_ID_LABEL}=${workspace.id},${PROJECT_LABEL}=${projectId}`;
  }

  private toVolumeSize(value?: string): number {
    if (!value) {
      return 0;
    }

    const match = /^(\d+)Gi$/.exec(value.trim());

    return match ? Number(match[1]) : 0;
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
