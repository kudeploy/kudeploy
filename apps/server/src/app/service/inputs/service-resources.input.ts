import { Field, InputType } from '@nest-boot/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ServiceResourcesInput {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  cpuRequest?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  cpuLimit?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  memoryRequest?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  memoryLimit?: string;
}
