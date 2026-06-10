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

import { CreateVolumeInput } from './inputs/create-volume.input';
import {
  VolumeConnection,
  VolumeConnectionArgs,
} from './volume.connection-definition';
import { Volume } from './volume.object';
import { VolumeService } from './volume.service';

@Resolver(() => Volume)
export class VolumeResolver {
  constructor(private readonly volumeService: VolumeService) {}

  @Can(PermissionAction.READ, Volume)
  @Query(() => VolumeConnection)
  async volumes(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args() args: VolumeConnectionArgs,
  ): Promise<VolumeConnection> {
    return await this.volumeService.findVolumes(workspace, projectId, args);
  }

  @Can(PermissionAction.READ, Volume)
  @Query(() => Volume, { nullable: true })
  async volume(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Volume | null> {
    return await this.volumeService.findVolume(workspace, projectId, id);
  }

  @Can(PermissionAction.CREATE, Volume)
  @Mutation(() => Volume)
  async createVolume(
    @CurrentWorkspace() workspace: Workspace,
    @Args('input') input: CreateVolumeInput,
  ): Promise<Volume> {
    return await this.volumeService.createVolume(workspace, input);
  }

  @Can(PermissionAction.DELETE, Volume)
  @Mutation(() => Volume)
  async deleteVolume(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Volume> {
    return await this.volumeService.deleteVolume(workspace, projectId, id);
  }
}

@Resolver(() => Project)
export class ProjectVolumeResolver {
  constructor(private readonly volumeService: VolumeService) {}

  @Can(PermissionAction.READ, Volume)
  @ResolveField(() => VolumeConnection)
  async volumes(
    @CurrentWorkspace() workspace: Workspace,
    @Parent() project: Project,
    @Args() args: VolumeConnectionArgs,
  ): Promise<VolumeConnection> {
    return await this.volumeService.findVolumes(workspace, project.id, args);
  }
}
