import { Field, InputType, Int } from '@nest-boot/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { ServiceEnvVarInput } from './service-env-var.input';
import { ServiceHealthCheckInput } from './service-health-check.input';
import { ServicePortInput } from './service-port.input';
import { ServiceResourcesInput } from './service-resources.input';

@InputType()
export class UpdateServiceInput {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  image?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Field(() => Int, { nullable: true })
  replicas?: number | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServicePortInput)
  @Field(() => [ServicePortInput], { nullable: true })
  ports?: ServicePortInput[];

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
  command?: string[] | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  args?: string[] | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceResourcesInput)
  @Field(() => ServiceResourcesInput, { nullable: true })
  resources?: ServiceResourcesInput | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceHealthCheckInput)
  @Field(() => ServiceHealthCheckInput, { nullable: true })
  healthCheck?: ServiceHealthCheckInput | null;
}
