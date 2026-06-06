import { Field, InputType } from '@nest-boot/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateProjectInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  name?: string;
}
