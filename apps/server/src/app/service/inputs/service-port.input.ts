import { Field, InputType, Int } from '@nest-boot/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@InputType()
export class ServicePortInput {
  @IsInt()
  @Min(1)
  @Max(65535)
  @Field(() => Int)
  port!: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(65535)
  @Field(() => Int, { nullable: true })
  targetPort?: number;
}
