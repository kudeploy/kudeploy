import {
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  Opt,
  PrimaryKey,
  Property,
  t,
} from '@mikro-orm/postgresql';
import { Field, ID, ObjectType } from '@nest-boot/graphql';
import { Policy, PolicyCommand } from '@nest-boot/row-level-security';
import { Sonyflake } from 'sonyflake-js';

import { Domain } from '@/app/domain/domain.entity';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';
import { WorkspaceMemberGroup } from '@/app/workspace-member-group/workspace-member-group.entity';
import { SoftDeletePolicy } from '@/common/decorators/soft-delete-policy.decorator';

import { WorkspaceFeature } from './enums/features.enum';

/**
 * 工作区实体。
 */
@ObjectType()
@SoftDeletePolicy()
@Policy({
  name: 'workspace_select_policy',
  command: PolicyCommand.SELECT,
  using: '(true)',
  roles: ['authenticated', 'anonymous'],
})
@Policy({
  name: 'workspace_insert_policy',
  command: PolicyCommand.INSERT,
  withCheck: '(true)',
  roles: ['authenticated'],
})
@Policy({
  name: 'workspace_update_policy',
  command: PolicyCommand.UPDATE,
  property: 'id',
  context: 'workspace_id',
  roles: ['authenticated'],
})
@Entity()
@Index({ properties: ['createdAt'] })
@Index({ properties: ['deletedAt'] })
export class Workspace {
  /** 工作区唯一标识。 */
  @Field(() => ID)
  @PrimaryKey({
    type: t.bigint,
  })
  id: Opt<string> = Sonyflake.next().toString();

  /** 工作区名称。 */
  @Field(() => String)
  @Property({ type: t.string })
  name!: string;

  /** 工作区已启用的功能。 */
  @Field(() => [WorkspaceFeature])
  @Enum({ items: () => WorkspaceFeature, array: true, defaultRaw: "'{}'" })
  features: Opt<WorkspaceFeature[]> = [];

  /** 创建时间。 */
  @Field(() => Date)
  @Property({ type: t.datetime, defaultRaw: 'now()' })
  createdAt: Opt<Date> = new Date();

  /** 更新时间。 */
  @Field(() => Date)
  @Property({
    type: t.datetime,
    defaultRaw: 'now()',
    onUpdate: () => new Date(),
  })
  updatedAt: Opt<Date> = new Date();

  /** 软删除时间，为空表示未删除。 */
  @Field(() => Date, { nullable: true })
  @Property({ type: t.datetime, nullable: true })
  deletedAt?: Date;

  /** 工作区成员集合。 */
  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members = new Collection<WorkspaceMember>(this);

  /** 工作区成员组集合。 */
  @OneToMany(() => WorkspaceMemberGroup, (group) => group.workspace)
  memberGroups = new Collection<WorkspaceMemberGroup>(this);

  /** 工作区绑定域名集合。 */
  @OneToMany(() => Domain, (domain) => domain.workspace)
  domains = new Collection<Domain>(this);
}
