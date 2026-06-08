import { Field, ID, Int, ObjectType } from '@nest-boot/graphql';

import { ServiceHealthCheckType } from './service-health-check-type.enum';
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

@ObjectType()
export class ServiceResources {
  @Field(() => String, { nullable: true })
  cpuRequest?: string | null;

  @Field(() => String, { nullable: true })
  cpuLimit?: string | null;

  @Field(() => String, { nullable: true })
  memoryRequest?: string | null;

  @Field(() => String, { nullable: true })
  memoryLimit?: string | null;
}

@ObjectType()
export class ServiceHealthCheck {
  @Field(() => ServiceHealthCheckType)
  type!: ServiceHealthCheckType;

  @Field(() => Int)
  port!: number;

  @Field(() => String, { nullable: true })
  path?: string | null;
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

  @Field(() => [String])
  command!: string[];

  @Field(() => [String])
  args!: string[];

  @Field(() => ServiceResources, { nullable: true })
  resources?: ServiceResources | null;

  @Field(() => ServiceHealthCheck, { nullable: true })
  healthCheck?: ServiceHealthCheck | null;

  @Field(() => ServiceStatus)
  status!: ServiceStatus;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
