import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nest-boot/graphql';
import { Can, PermissionAction } from '@nest-boot/permission';

import { Project } from '@/app/project/project.object';
import { Workspace } from '@/app/workspace/workspace.entity';
import { CurrentWorkspace } from '@/common/decorators/current-workspace.decorator';

import { CreateRegistryCredentialInput } from './inputs/create-registry-credential.input';
import { UpdateRegistryCredentialInput } from './inputs/update-registry-credential.input';
import {
  RegistryCredentialConnection,
  RegistryCredentialConnectionArgs,
} from './registry-credential.connection-definition';
import { RegistryCredential } from './registry-credential.object';
import { RegistryCredentialService } from './registry-credential.service';

@Resolver(() => RegistryCredential)
export class RegistryCredentialResolver {
  constructor(
    private readonly registryCredentialService: RegistryCredentialService,
  ) {}

  @Can(PermissionAction.READ, RegistryCredential)
  @Query(() => RegistryCredentialConnection)
  async registryCredentials(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args() args: RegistryCredentialConnectionArgs,
  ): Promise<RegistryCredentialConnection> {
    return await this.registryCredentialService.findRegistryCredentials(
      workspace,
      projectId,
      args,
    );
  }

  @Can(PermissionAction.READ, RegistryCredential)
  @Query(() => RegistryCredential, { nullable: true })
  async registryCredential(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<RegistryCredential | null> {
    return await this.registryCredentialService.findRegistryCredential(
      workspace,
      projectId,
      id,
    );
  }

  @Can(PermissionAction.CREATE, RegistryCredential)
  @Mutation(() => RegistryCredential)
  async createRegistryCredential(
    @CurrentWorkspace() workspace: Workspace,
    @Args('input') input: CreateRegistryCredentialInput,
  ): Promise<RegistryCredential> {
    return await this.registryCredentialService.createRegistryCredential(
      workspace,
      input,
    );
  }

  @Can(PermissionAction.UPDATE, RegistryCredential)
  @Mutation(() => RegistryCredential)
  async updateRegistryCredential(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
    @Args('input') input: UpdateRegistryCredentialInput,
  ): Promise<RegistryCredential> {
    return await this.registryCredentialService.updateRegistryCredential(
      workspace,
      projectId,
      id,
      input,
    );
  }

  @Can(PermissionAction.DELETE, RegistryCredential)
  @Mutation(() => RegistryCredential)
  async deleteRegistryCredential(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<RegistryCredential> {
    return await this.registryCredentialService.deleteRegistryCredential(
      workspace,
      projectId,
      id,
    );
  }
}

@Resolver(() => Project)
export class ProjectRegistryCredentialResolver {
  constructor(
    private readonly registryCredentialService: RegistryCredentialService,
  ) {}

  @Can(PermissionAction.READ, RegistryCredential)
  @ResolveField(() => RegistryCredentialConnection)
  async registryCredentials(
    @CurrentWorkspace() workspace: Workspace,
    @Parent() project: Project,
    @Args() args: RegistryCredentialConnectionArgs,
  ): Promise<RegistryCredentialConnection> {
    return await this.registryCredentialService.findRegistryCredentials(
      workspace,
      project.id,
      args,
    );
  }
}
