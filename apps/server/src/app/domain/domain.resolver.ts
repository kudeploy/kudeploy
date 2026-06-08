import { Args, ID, Mutation, Query, Resolver } from '@nest-boot/graphql';
import { ConnectionManager } from '@nest-boot/graphql-connection';
import { Can, PermissionAction } from '@nest-boot/permission';

import { Workspace } from '@/app/workspace/workspace.entity';
import { CurrentWorkspace } from '@/common/decorators/current-workspace.decorator';

import {
  DomainConnection,
  DomainConnectionArgs,
} from './domain.connection-definition';
import { Domain } from './domain.entity';
import { DomainService } from './domain.service';
import { CreateDomainInput } from './inputs/create-domain.input';

/** 提供工作区自定义域名的查询、创建、验证和删除接口。 */
@Resolver(() => Domain)
export class DomainResolver {
  constructor(
    private readonly domainService: DomainService,
    private readonly cm: ConnectionManager,
  ) {}

  /** 分页查询当前工作区的域名。 */
  @Can(PermissionAction.READ, Domain)
  @Query(() => DomainConnection)
  async domains(
    @Args() args: DomainConnectionArgs,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<DomainConnection> {
    return await this.cm.find(DomainConnection, args, {
      where: { workspace },
    });
  }

  /** 查询当前工作区的单个域名。 */
  @Can(PermissionAction.READ, Domain)
  @Query(() => Domain, { nullable: true })
  async domain(
    @Args('id', { type: () => ID }) id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Domain | null> {
    return await this.domainService.findOne({
      id,
      workspace,
    });
  }

  /** 创建当前工作区的域名。 */
  @Can(PermissionAction.CREATE, Domain)
  @Mutation(() => Domain)
  async createDomain(
    @Args('input') input: CreateDomainInput,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Domain> {
    return await this.domainService.createDomain(workspace, input);
  }

  /** 触发当前工作区域名的 TXT 验证。 */
  @Can(PermissionAction.UPDATE, Domain)
  @Mutation(() => Domain)
  async verifyDomain(
    @Args('id', { type: () => ID }) id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Domain> {
    const domain = await this.domainService.findOneOrFail({
      id,
      workspace,
    });

    return await this.domainService.verifyDomain(domain);
  }

  /** 删除当前工作区的域名。 */
  @Can(PermissionAction.DELETE, Domain)
  @Mutation(() => Domain)
  async deleteDomain(
    @Args('id', { type: () => ID }) id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Domain> {
    const domain = await this.domainService.findOneOrFail({
      id,
      workspace,
    });

    return await this.domainService.remove(domain);
  }
}
