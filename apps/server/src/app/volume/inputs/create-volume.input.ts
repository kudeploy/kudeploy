import { Field, ID, InputType, Int } from '@nest-boot/graphql';
import { IsInt, IsString, Min } from 'class-validator';

@InputType()
export class CreateVolumeInput {
  @IsString()
  @Field(() => ID)
  projectId!: string;

  @IsString()
  @Field(() => String)
  name!: string;

  @IsInt()
  @Min(1)
  @Field(() => Int)
  size!: number;
}
