import { Field, ID, InputType, Int } from '@nest-boot/graphql';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ServiceEnvVarInput } from './service-env-var.input';
import { ServiceHealthCheckInput } from './service-health-check.input';
import { ServicePortInput } from './service-port.input';
import { ServiceResourcesInput } from './service-resources.input';

@InputType()
export class CreateServiceInput {
  @IsString()
  @Field(() => ID)
  projectId!: string;

  @IsString()
  @Field(() => String)
  name!: string;

  @IsString()
  @Field(() => String)
  image!: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Field(() => Int, { nullable: true })
  replicas?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePortInput)
  @Field(() => [ServicePortInput])
  ports!: ServicePortInput[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceEnvVarInput)
  @Field(() => [ServiceEnvVarInput], { nullable: true })
  env?: ServiceEnvVarInput[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  command?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  args?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceResourcesInput)
  @Field(() => ServiceResourcesInput, { nullable: true })
  resources?: ServiceResourcesInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceHealthCheckInput)
  @Field(() => ServiceHealthCheckInput, { nullable: true })
  healthCheck?: ServiceHealthCheckInput;
}
