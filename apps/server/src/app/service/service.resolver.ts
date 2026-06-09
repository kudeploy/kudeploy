import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nest-boot/graphql';
import { Can, PermissionAction } from '@nest-boot/permission';

import {
  KubernetesMetricsService,
  ServiceMetrics,
} from '@/app/kubernetes-metrics';
import {
  KubernetesLogsService,
  ServiceLogConnection,
} from '@/app/kubernetes-logs';
import { Workspace } from '@/app/workspace/workspace.entity';
import { CurrentWorkspace } from '@/common/decorators/current-workspace.decorator';

import { CreateServiceInput } from './inputs/create-service.input';
import { UpdateServiceInput } from './inputs/update-service.input';
import {
  ServiceConnection,
  ServiceConnectionArgs,
} from './service.connection-definition';
import { Service } from './service.object';
import { ServiceService } from './service.service';

@Resolver(() => Service)
export class ServiceResolver {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly kubernetesLogsService: KubernetesLogsService,
    private readonly kubernetesMetricsService: KubernetesMetricsService,
  ) {}

  @Can(PermissionAction.READ, Service)
  @Query(() => ServiceConnection)
  async services(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args() args: ServiceConnectionArgs,
  ): Promise<ServiceConnection> {
    return await this.serviceService.findServices(workspace, projectId, args);
  }

  @Can(PermissionAction.READ, Service)
  @Query(() => Service, { nullable: true })
  async service(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Service | null> {
    return await this.serviceService.findService(workspace, projectId, id);
  }

  @Can(PermissionAction.CREATE, Service)
  @Mutation(() => Service)
  async createService(
    @CurrentWorkspace() workspace: Workspace,
    @Args('input') input: CreateServiceInput,
  ): Promise<Service> {
    return await this.serviceService.createService(workspace, input);
  }

  @Can(PermissionAction.UPDATE, Service)
  @Mutation(() => Service)
  async updateService(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
    @Args('input') input: UpdateServiceInput,
  ): Promise<Service> {
    return await this.serviceService.updateService(
      workspace,
      projectId,
      id,
      input,
    );
  }

  @Can(PermissionAction.DELETE, Service)
  @Mutation(() => Service)
  async deleteService(
    @CurrentWorkspace() workspace: Workspace,
    @Args({ name: 'projectId', type: () => ID }) projectId: string,
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Service> {
    return await this.serviceService.deleteService(workspace, projectId, id);
  }

  @Can(PermissionAction.READ, Service)
  @ResolveField(() => ServiceLogConnection)
  async logs(
    @CurrentWorkspace() workspace: Workspace,
    @Parent() service: Service,
    @Args({ name: 'first', type: () => Int, nullable: true })
    first?: number | null,
    @Args({ name: 'after', type: () => String, nullable: true })
    after?: string | null,
    @Args({ name: 'last', type: () => Int, nullable: true })
    last?: number | null,
    @Args({ name: 'before', type: () => String, nullable: true })
    before?: string | null,
  ): Promise<ServiceLogConnection> {
    return await this.kubernetesLogsService.getServiceLogs(
      workspace,
      service.projectId,
      service.id,
      {
        after,
        before,
        first,
        last,
      },
    );
  }

  @Can(PermissionAction.READ, Service)
  @ResolveField(() => ServiceMetrics)
  async metrics(
    @CurrentWorkspace() workspace: Workspace,
    @Parent() service: Service,
    @Args({ name: 'rangeSeconds', type: () => Int, nullable: true })
    rangeSeconds?: number | null,
    @Args({ name: 'stepSeconds', type: () => Int, nullable: true })
    stepSeconds?: number | null,
  ): Promise<ServiceMetrics> {
    return await this.kubernetesMetricsService.getServiceMetrics(
      workspace,
      service.projectId,
      service.id,
      {
        activeDeploymentName: service.activeDeploymentName,
        rangeSeconds,
        stepSeconds,
      },
    );
  }
}
