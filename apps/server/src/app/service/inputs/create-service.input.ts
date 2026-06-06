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
import { ServicePortInput } from './service-port.input';

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
}
