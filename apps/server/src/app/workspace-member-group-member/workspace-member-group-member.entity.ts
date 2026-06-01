import { Index, Opt, Property, Unique } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Ref, t } from '@mikro-orm/postgresql';
import { Policy } from '@nest-boot/row-level-security';
import { Sonyflake } from 'sonyflake-js';

import { Workspace } from '@/app/workspace/workspace.entity';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';
import { WorkspaceMemberGroup } from '@/app/workspace-member-group/workspace-member-group.entity';

/** 工作区成员与成员组的关联实体。 */
@Policy({
  property: 'workspace',
  context: 'workspace_id',
  roles: ['authenticated'],
})
@Entity()
@Index({ properties: ['createdAt'] })
@Unique({ properties: ['group', 'member'] })
export class WorkspaceMemberGroupMember {
  /** 成员组关系唯一标识。 */
  @PrimaryKey({
    type: t.bigint,
  })
  id: Opt<string> = Sonyflake.next().toString();

  /** 创建时间。 */
  @Property({ type: t.datetime, defaultRaw: 'now()' })
  createdAt: Opt<Date> = new Date();

  /** 更新时间。 */
  @Property({
    type: t.datetime,
    defaultRaw: 'now()',
    onUpdate: () => new Date(),
  })
  updatedAt: Opt<Date> = new Date();

  /** 关联所属工作区。 */
  @ManyToOne(() => Workspace, { updateRule: 'cascade', deleteRule: 'cascade' })
  workspace!: Ref<Workspace>;

  /** 关联的成员组。 */
  @ManyToOne(() => WorkspaceMemberGroup, {
    updateRule: 'cascade',
    deleteRule: 'cascade',
  })
  group!: Ref<WorkspaceMemberGroup>;

  /** 关联的工作区成员。 */
  @ManyToOne(() => WorkspaceMember, {
    updateRule: 'cascade',
    deleteRule: 'cascade',
  })
  member!: Ref<WorkspaceMember>;
}
