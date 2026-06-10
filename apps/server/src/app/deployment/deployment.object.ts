import { Field, ID, Int, ObjectType } from '@nest-boot/graphql';

import { DeploymentStatus } from './deployment-status.enum';

@ObjectType()
export class DeploymentPort {
  @Field(() => Int)
  port!: number;

  @Field(() => Int, { nullable: true })
  targetPort?: number | null;
}

@ObjectType()
export class DeploymentEnvVar {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  value?: string | null;
}

@ObjectType()
export class DeploymentEnvFrom {
  @Field(() => String)
  kind!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  prefix?: string | null;
}

@ObjectType()
export class DeploymentResources {
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
export class Deployment {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => ID)
  serviceId!: string;

  @Field(() => Int)
  version!: number;

  @Field(() => String)
  image!: string;

  @Field(() => Int, { nullable: true })
  replicas?: number | null;

  @Field(() => [DeploymentPort])
  ports!: DeploymentPort[];

  @Field(() => [DeploymentEnvVar])
  env!: DeploymentEnvVar[];

  @Field(() => [DeploymentEnvFrom])
  envFrom!: DeploymentEnvFrom[];

  @Field(() => [String])
  command!: string[];

  @Field(() => [String])
  args!: string[];

  @Field(() => DeploymentResources, { nullable: true })
  resources?: DeploymentResources | null;

  @Field(() => String, { nullable: true })
  serviceAccountName?: string | null;

  @Field(() => DeploymentStatus)
  status!: DeploymentStatus;

  @Field(() => Boolean)
  active!: boolean;

  @Field(() => Boolean)
  latest!: boolean;

  @Field(() => String, { nullable: true })
  kubernetesDeploymentName?: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
