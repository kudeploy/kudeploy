import { Field, Int, ObjectType } from '@nest-boot/graphql';

@ObjectType()
export class ServiceLogEntry {
  @Field(() => Date)
  timestamp!: Date;

  @Field(() => String)
  message!: string;

  @Field(() => String, { nullable: true })
  namespace!: string | null;

  @Field(() => String, { nullable: true })
  podName!: string | null;

  @Field(() => String, { nullable: true })
  containerName!: string | null;

  @Field(() => String, { nullable: true })
  deploymentName!: string | null;
}

@ObjectType()
export class ServiceLogs {
  @Field(() => Boolean)
  available!: boolean;

  @Field(() => Int)
  rangeSeconds!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => [ServiceLogEntry])
  entries!: ServiceLogEntry[];
}
