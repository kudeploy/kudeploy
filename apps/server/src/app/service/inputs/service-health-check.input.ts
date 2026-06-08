import { Field, InputType, Int } from '@nest-boot/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { ServiceHealthCheckType } from '../service-health-check-type.enum';

@InputType()
export class ServiceHealthCheckInput {
  @IsEnum(ServiceHealthCheckType)
  @Field(() => ServiceHealthCheckType)
  type!: ServiceHealthCheckType;

  @IsInt()
  @Min(1)
  @Max(65535)
  @Field(() => Int)
  port!: number;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  path?: string;
}
