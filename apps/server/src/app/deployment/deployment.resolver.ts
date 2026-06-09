import { Args, ID, Query, Resolver } from '@nest-boot/graphql';
import { Can, PermissionAction } from '@nest-boot/permission';

import { Workspace } from '@/app/workspace/workspace.entity';
import { CurrentWorkspace } from '@/common/decorators/current-workspace.decorator';

import {
  DeploymentConnection,
  DeploymentConnectionArgs,
} from './deployment.connection-definition';
import { Deployment } from './deployment.object';
import { DeploymentService } from './deployment.service';

@Resolver(() => Deployment)
export class DeploymentResolver {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Can(PermissionAction.READ, Deployment)
  @Query(() => DeploymentConnection)
  async deployments(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'serviceId', type: () => ID }) serviceId: string,
    @Args() args: DeploymentConnectionArgs,
  ): Promise<DeploymentConnection> {
    return await this.deploymentService.findDeployments(
      workspace,
      projectId,
      serviceId,
      args,
    );
  }

  @Can(PermissionAction.READ, Deployment)
  @Query(() => Deployment, { nullable: true })
  async deployment(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Deployment | null> {
    return await this.deploymentService.findDeployment(
      workspace,
      projectId,
      id,
    );
  }
}
