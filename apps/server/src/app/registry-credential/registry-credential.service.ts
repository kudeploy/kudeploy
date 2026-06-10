import { CoreV1Api, type V1Secret } from '@kubernetes/client-node';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sonyflake } from 'sonyflake-js';

import { SERVER_SIDE_APPLY_OPTIONS } from '@/app/kubernetes';
import {
  hasKubernetesRegistryCredentialNamePrefix,
  toGraphqlProjectId,
  toGraphqlRegistryCredentialId,
  toKubernetesProjectName,
  toKubernetesRegistryCredentialName,
} from '@/app/kubernetes/resource-names';
import {
  DISPLAY_NAME_ANNOTATION,
  KUDEPLOY_FIELD_MANAGER,
  MANAGED_BY_LABEL,
  MANAGED_BY_LABEL_VALUE,
  PROJECT_LABEL,
  ProjectService,
  WORKSPACE_LABEL,
} from '@/app/project/project.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { KubernetesConnectionManager } from '@/lib/kubernetes-graphql-connection/kubernetes-connection.manager';

import { CreateRegistryCredentialInput } from './inputs/create-registry-credential.input';
import { UpdateRegistryCredentialInput } from './inputs/update-registry-credential.input';
import {
  RegistryCredentialConnection,
  RegistryCredentialConnectionArgs,
} from './registry-credential.connection-definition';
import { RegistryCredential } from './registry-credential.object';

export const REGISTRY_CREDENTIAL_SECRET_TYPE = 'kubernetes.io/dockerconfigjson';
export const REGISTRY_ANNOTATION = 'kudeploy.com/registry';
export const REGISTRY_USERNAME_ANNOTATION = 'kudeploy.com/registry-username';
export const DOCKER_CONFIG_JSON_KEY = '.dockerconfigjson';

export interface RegistryCredentialResource extends Omit<V1Secret, 'metadata'> {
  metadata?: {
    name?: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
  };
}

interface RegistryCredentialResourceInput {
  name: string;
  registry: string;
  username: string;
  password: string;
}

interface DockerAuthEntry {
  auth?: string;
  username?: string;
  password?: string;
}

@Injectable()
export class RegistryCredentialService {
  constructor(
    private readonly coreV1Api: CoreV1Api,
    private readonly connectionManager: KubernetesConnectionManager,
    private readonly projectService: ProjectService,
  ) {}

  async findRegistryCredentials(
    workspace: Workspace,
    projectId: string,
    args: RegistryCredentialConnectionArgs,
  ): Promise<RegistryCredentialConnection> {
    const projectName = toKubernetesProjectName(projectId);

    await this.ensureProject(workspace, projectId);

    const list = (await this.coreV1Api.listNamespacedSecret({
      namespace: projectName,
      labelSelector: this.registryCredentialLabelSelector(
        workspace,
        projectName,
      ),
    })) as { items?: RegistryCredentialResource[] };

    const items = (list.items ?? [])
      .filter((resource) =>
        this.belongsToWorkspaceAndProject(resource, workspace, projectName),
      )
      .map((resource) => this.toRegistryCredential(resource));

    return await this.connectionManager.find(
      RegistryCredentialConnection,
      args,
      {
        items,
      },
    );
  }

  async findRegistryCredential(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<RegistryCredential | null> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesRegistryCredentialName(id);

    await this.ensureProject(workspace, projectId);

    try {
      const resource = (await this.coreV1Api.readNamespacedSecret({
        namespace: projectName,
        name,
      })) as RegistryCredentialResource;

      if (
        !this.belongsToWorkspaceAndProject(resource, workspace, projectName)
      ) {
        return null;
      }

      return this.toRegistryCredential(resource);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async createRegistryCredential(
    workspace: Workspace,
    input: CreateRegistryCredentialInput,
  ): Promise<RegistryCredential> {
    const projectName = toKubernetesProjectName(input.projectId);

    await this.ensureProject(workspace, input.projectId);

    const name = toKubernetesRegistryCredentialName(String(Sonyflake.next()));
    const resource = (await this.coreV1Api.createNamespacedSecret({
      namespace: projectName,
      body: this.buildRegistryCredentialResource(workspace, projectName, name, {
        name: this.required(input.name, 'Name is required'),
        registry: this.required(input.registry, 'Registry is required'),
        username: this.required(input.username, 'Username is required'),
        password: this.required(input.password, 'Password is required'),
      }),
      fieldManager: KUDEPLOY_FIELD_MANAGER,
    })) as RegistryCredentialResource;

    return this.toRegistryCredential(resource);
  }

  async updateRegistryCredential(
    workspace: Workspace,
    projectId: string,
    id: string,
    input: UpdateRegistryCredentialInput,
  ): Promise<RegistryCredential> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesRegistryCredentialName(id);

    await this.ensureProject(workspace, projectId);

    const existingResource = await this.getOwnedRegistryCredential(
      workspace,
      projectName,
      name,
    );
    const existing = this.toRegistryCredential(existingResource);
    const existingPassword = this.toDockerAuth(existingResource)?.password;
    const password = this.nonEmpty(input.password)
      ? input.password.trim()
      : existingPassword;

    if (!password) {
      throw new BadRequestException('Registry credential password is required');
    }

    const resource = (await this.coreV1Api.patchNamespacedSecret(
      {
        namespace: projectName,
        name,
        body: this.buildRegistryCredentialResource(
          workspace,
          projectName,
          name,
          {
            name: this.optional(input.name) ?? existing.name,
            registry: this.optional(input.registry) ?? existing.registry,
            username: this.optional(input.username) ?? existing.username,
            password,
          },
        ),
        fieldManager: KUDEPLOY_FIELD_MANAGER,
        force: true,
      },
      SERVER_SIDE_APPLY_OPTIONS,
    )) as RegistryCredentialResource;

    return this.toRegistryCredential(resource);
  }

  async deleteRegistryCredential(
    workspace: Workspace,
    projectId: string,
    id: string,
  ): Promise<RegistryCredential> {
    const projectName = toKubernetesProjectName(projectId);
    const name = toKubernetesRegistryCredentialName(id);

    await this.ensureProject(workspace, projectId);

    const resource = await this.getOwnedRegistryCredential(
      workspace,
      projectName,
      name,
    );

    await this.coreV1Api.deleteNamespacedSecret({
      namespace: projectName,
      name,
    });

    return this.toRegistryCredential(resource);
  }

  toRegistryCredential(
    resource: RegistryCredentialResource,
  ): RegistryCredential {
    const createdAt = this.toDate(resource.metadata?.creationTimestamp);
    const dockerAuth = this.toDockerAuth(resource);

    return {
      id: resource.metadata?.name
        ? toGraphqlRegistryCredentialId(resource.metadata.name)
        : '',
      projectId: resource.metadata?.namespace
        ? toGraphqlProjectId(resource.metadata.namespace)
        : '',
      name:
        resource.metadata?.annotations?.[DISPLAY_NAME_ANNOTATION] ??
        resource.metadata?.name ??
        '',
      registry:
        resource.metadata?.annotations?.[REGISTRY_ANNOTATION] ??
        dockerAuth?.registry ??
        '',
      username:
        resource.metadata?.annotations?.[REGISTRY_USERNAME_ANNOTATION] ??
        dockerAuth?.username ??
        '',
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

  private async getOwnedRegistryCredential(
    workspace: Workspace,
    projectName: string,
    name: string,
  ): Promise<RegistryCredentialResource> {
    try {
      const resource = (await this.coreV1Api.readNamespacedSecret({
        namespace: projectName,
        name,
      })) as RegistryCredentialResource;

      if (
        !this.belongsToWorkspaceAndProject(resource, workspace, projectName)
      ) {
        throw new NotFoundException('Registry credential not found');
      }

      return resource;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('Registry credential not found');
      }
      throw error;
    }
  }

  private buildRegistryCredentialResource(
    workspace: Workspace,
    projectName: string,
    name: string,
    input: RegistryCredentialResourceInput,
  ): V1Secret {
    return {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name,
        namespace: projectName,
        labels: {
          [MANAGED_BY_LABEL]: MANAGED_BY_LABEL_VALUE,
          [WORKSPACE_LABEL]: workspace.id,
          [PROJECT_LABEL]: projectName,
        },
        annotations: {
          [DISPLAY_NAME_ANNOTATION]: input.name,
          [REGISTRY_ANNOTATION]: input.registry,
          [REGISTRY_USERNAME_ANNOTATION]: input.username,
        },
      },
      stringData: {
        [DOCKER_CONFIG_JSON_KEY]: this.buildDockerConfigJson(input),
      },
      type: REGISTRY_CREDENTIAL_SECRET_TYPE,
    };
  }

  private buildDockerConfigJson(input: RegistryCredentialResourceInput) {
    return JSON.stringify({
      auths: {
        [input.registry]: {
          auth: Buffer.from(`${input.username}:${input.password}`).toString(
            'base64',
          ),
          username: input.username,
          password: input.password,
        },
      },
    });
  }

  private belongsToWorkspaceAndProject(
    resource: RegistryCredentialResource,
    workspace: Workspace,
    projectName: string,
  ): boolean {
    return (
      resource.metadata?.namespace === projectName &&
      !!resource.metadata?.name &&
      hasKubernetesRegistryCredentialNamePrefix(resource.metadata.name) &&
      resource.metadata?.labels?.[MANAGED_BY_LABEL] ===
        MANAGED_BY_LABEL_VALUE &&
      resource.metadata?.labels?.[WORKSPACE_LABEL] === workspace.id &&
      resource.metadata?.labels?.[PROJECT_LABEL] === projectName &&
      resource.type === REGISTRY_CREDENTIAL_SECRET_TYPE
    );
  }

  private registryCredentialLabelSelector(
    workspace: Workspace,
    projectName: string,
  ): string {
    return `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE},${WORKSPACE_LABEL}=${workspace.id},${PROJECT_LABEL}=${projectName}`;
  }

  private toDockerAuth(
    resource: RegistryCredentialResource,
  ): (DockerAuthEntry & { registry: string }) | null {
    const encodedDockerConfigJson = resource.data?.[DOCKER_CONFIG_JSON_KEY];

    if (!encodedDockerConfigJson) {
      return null;
    }

    try {
      const dockerConfig = JSON.parse(
        Buffer.from(encodedDockerConfigJson, 'base64').toString('utf8'),
      ) as { auths?: Record<string, DockerAuthEntry> };
      const [registry, entry] =
        Object.entries(dockerConfig.auths ?? {})[0] ?? [];

      if (!registry || !entry) {
        return null;
      }

      const decodedAuth = this.decodeDockerAuth(entry.auth);

      return {
        registry,
        username: entry.username ?? decodedAuth?.username,
        password: entry.password ?? decodedAuth?.password,
        auth: entry.auth,
      };
    } catch {
      return null;
    }
  }

  private decodeDockerAuth(auth?: string) {
    if (!auth) {
      return null;
    }

    const decoded = Buffer.from(auth, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  }

  private required(value: string, message: string): string {
    const result = this.optional(value);

    if (!result) {
      throw new BadRequestException(message);
    }

    return result;
  }

  private optional(value?: string | null): string | undefined {
    return this.nonEmpty(value) ? value.trim() : undefined;
  }

  private nonEmpty(value?: string | null): value is string {
    return typeof value === 'string' && value.trim().length > 0;
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
