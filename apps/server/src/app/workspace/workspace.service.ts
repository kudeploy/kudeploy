import { EntityManager } from '@mikro-orm/postgresql';
import { EntityService } from '@nest-boot/mikro-orm';
import { RequestContext } from '@nest-boot/request-context';
import {
  RowLevelSecurity,
  RowLevelSecurityMode,
} from '@nest-boot/row-level-security';
import { Injectable } from '@nestjs/common';

import { User } from '@/app/user/user.entity';
import { WorkspaceMemberRole } from '@/app/workspace-member/enums/workspace-member-role.enum';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';

import { CreateWorkspaceInput } from './inputs/create-workspace.input';
import { Workspace } from './workspace.entity';

/**
 * 工作区业务服务。
 */
@Injectable()
export class WorkspaceService extends EntityService<Workspace> {
  /**
   * 创建工作区服务。
   *
   * @param em - 当前请求使用的 MikroORM `EntityManager`。
   */
  constructor(protected readonly em: EntityManager) {
    super(Workspace, em);
  }

  /**
   * 创建工作区，并把创建者加入为 owner 成员。
   *
   * @param user - 创建工作区的用户。
   * @param input - 创建工作区输入参数。
   * @returns 创建完成的工作区。
   */
  async createWorkspace(
    user: User,
    input: CreateWorkspaceInput,
  ): Promise<Workspace> {
    const workspace = await RequestContext.child(async () => {
      RowLevelSecurity.setMode(RowLevelSecurityMode.DISABLED);

      const workspace = this.em.create(Workspace, {
        name: input.name,
      });

      // 创建 workspace 的同时创建一个 owner 成员
      const workspaceMember = this.em.create(WorkspaceMember, {
        workspace,
        user,
        name: user.name,
        email: user.email,
        role: WorkspaceMemberRole.OWNER,
      });

      await this.em.persist(workspace).persist(workspaceMember).flush();

      return workspace;
    });

    return workspace;
  }

  /**
   * 软删除工作区。
   *
   * @param workspace - 要软删除的工作区。
   * @returns 已软删除的工作区实体。
   */
  async softDelete(workspace: Workspace): Promise<Workspace> {
    return await RequestContext.child(() => {
      RowLevelSecurity.setMode(RowLevelSecurityMode.DISABLED);

      return super.update(workspace, {
        deletedAt: new Date(),
      });
    });
  }
}
