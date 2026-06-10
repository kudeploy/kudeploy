import { Field, InputType } from '@nest-boot/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateRegistryCredentialInput {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Field(() => String, { nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Field(() => String, { nullable: true })
  registry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Field(() => String, { nullable: true })
  username?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  password?: string;
}
