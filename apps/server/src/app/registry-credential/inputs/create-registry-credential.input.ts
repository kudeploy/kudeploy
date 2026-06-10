import { Field, ID, InputType } from '@nest-boot/graphql';
import { IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateRegistryCredentialInput {
  @IsString()
  @Field(() => ID)
  projectId!: string;

  @IsString()
  @MaxLength(255)
  @Field(() => String)
  name!: string;

  @IsString()
  @MaxLength(255)
  @Field(() => String)
  registry!: string;

  @IsString()
  @MaxLength(255)
  @Field(() => String)
  username!: string;

  @IsString()
  @Field(() => String)
  password!: string;
}
