import { Field, ID, Int, ObjectType } from '@nest-boot/graphql';

import { ServiceStatus } from './service-status.enum';

@ObjectType()
export class ServicePort {
  @Field(() => Int)
  port!: number;

  @Field(() => Int, { nullable: true })
  targetPort?: number | null;
}

@ObjectType()
export class ServiceEnvVar {
  @Field(() => String)
  key!: string;

  @Field(() => String)
  value!: string;
}

@ObjectType('Service')
export class Service {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  image!: string;

  @Field(() => Int, { nullable: true })
  replicas?: number | null;

  @Field(() => [ServicePort])
  ports!: ServicePort[];

  @Field(() => [ServiceEnvVar])
  env!: ServiceEnvVar[];

  @Field(() => ServiceStatus)
  status!: ServiceStatus;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
