import { Args, ID, Mutation, Query, Resolver } from '@nest-boot/graphql';
import { Can, PermissionAction } from '@nest-boot/permission';

import { Workspace } from '@/app/workspace/workspace.entity';
import { CurrentWorkspace } from '@/common/decorators/current-workspace.decorator';

import { CreateProjectInput } from './inputs/create-project.input';
import { UpdateProjectInput } from './inputs/update-project.input';
import {
  ProjectConnection,
  ProjectConnectionArgs,
} from './project.connection-definition';
import { Project } from './project.object';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Can(PermissionAction.READ, Project)
  @Query(() => ProjectConnection)
  async projects(
    @CurrentWorkspace() workspace: Workspace,
    @Args() args: ProjectConnectionArgs,
  ): Promise<ProjectConnection> {
    return await this.projectService.findProjects(workspace, args);
  }

  @Can(PermissionAction.READ, Project)
  @Query(() => Project, { nullable: true })
  async project(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Project | null> {
    return await this.projectService.findProject(workspace, id);
  }

  @Can(PermissionAction.CREATE, Project)
  @Mutation(() => Project)
  async createProject(
    @CurrentWorkspace() workspace: Workspace,
    @Args('input') input: CreateProjectInput,
  ): Promise<Project> {
    return await this.projectService.createProject(workspace, input);
  }

  @Can(PermissionAction.UPDATE, Project)
  @Mutation(() => Project)
  async updateProject(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'id', type: () => ID }) id: string,
    @Args('input') input: UpdateProjectInput,
  ): Promise<Project> {
    return await this.projectService.updateProject(workspace, id, input);
  }

  @Can(PermissionAction.DELETE, Project)
  @Mutation(() => Project)
  async deleteProject(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Project> {
    return await this.projectService.deleteProject(workspace, id);
  }
}
