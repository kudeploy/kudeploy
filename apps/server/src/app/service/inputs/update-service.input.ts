import { Field, InputType, Int } from '@nest-boot/graphql';
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
  replicas?: number;

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
}
