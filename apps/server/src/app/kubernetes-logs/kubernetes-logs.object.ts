import { Field, ID, ObjectType } from '@nest-boot/graphql';
import { PageInfo } from '@nest-boot/graphql-connection/dist/objects/page-info.object';

@ObjectType()
export class ServiceLog {
  @Field(() => ID)
  id!: string;

  @Field(() => Date)
  timestamp!: Date;

  @Field(() => String)
  message!: string;

  @Field(() => String, { nullable: true })
  level!: string | null;

  @Field(() => String, { nullable: true })
  namespace!: string | null;

  @Field(() => String, { nullable: true })
  podName!: string | null;

  @Field(() => String, { nullable: true })
  containerName!: string | null;

  @Field(() => String, { nullable: true })
  deploymentName!: string | null;

  rawTime!: string;

  streamId!: string | null;
}

@ObjectType()
export class ServiceLogEdge {
  @Field(() => ServiceLog)
  node!: ServiceLog;

  @Field(() => String)
  cursor!: string;
}

@ObjectType()
export class ServiceLogConnection {
  @Field(() => Boolean)
  available!: boolean;

  @Field(() => [ServiceLogEdge])
  edges!: ServiceLogEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}
