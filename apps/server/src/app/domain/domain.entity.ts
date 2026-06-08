import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Opt,
  PrimaryKey,
  Property,
  Ref,
  t,
  Unique,
} from '@mikro-orm/postgresql';
import { Field, HideField, ID, ObjectType } from '@nest-boot/graphql';
import { Policy } from '@nest-boot/row-level-security';
import { Sonyflake } from 'sonyflake-js';

import { Workspace } from '@/app/workspace/workspace.entity';

import { DomainStatus } from './domain-status.enum';

/** 工作区绑定的自定义域名。 */
@ObjectType()
@Policy({
  property: 'workspace',
  context: 'workspace_id',
  roles: ['authenticated'],
})
@Entity()
@Unique({ properties: ['workspace', 'name'] })
@Index({ properties: ['workspace'] })
@Index({ properties: ['name'] })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
export class Domain {
  /** 域名唯一标识。 */
  @Field(() => ID)
  @PrimaryKey({ type: t.bigint })
  id: Opt<string> = Sonyflake.next().toString();

  /** 域名，例如 example.com。 */
  @Field(() => String)
  @Property({ type: t.string })
  name!: string;

  /** 域名验证状态。 */
  @Field(() => DomainStatus)
  @Enum({ items: () => DomainStatus, default: DomainStatus.PENDING })
  status: Opt<DomainStatus> = DomainStatus.PENDING;

  /** 需要配置到 TXT 记录中的验证令牌。 */
  @Field(() => String)
  @Property({ type: t.string })
  verificationToken!: string;

  /** 验证通过时间。 */
  @Field(() => Date, { nullable: true })
  @Property({ type: t.datetime, nullable: true })
  verifiedAt?: Opt<Date> | null = null;

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

  /** 域名所属工作区。 */
  @HideField()
  @ManyToOne(() => Workspace, { updateRule: 'cascade', deleteRule: 'cascade' })
  workspace!: Ref<Workspace>;
}
