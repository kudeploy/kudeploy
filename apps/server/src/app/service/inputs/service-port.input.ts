import { Field, InputType, Int } from '@nest-boot/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class ServicePortInput {
  @IsInt()
  @Min(1)
  @Field(() => Int)
  port!: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Field(() => Int, { nullable: true })
  targetPort?: number;
}
