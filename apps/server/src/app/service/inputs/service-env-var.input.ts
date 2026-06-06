import { Field, InputType } from '@nest-boot/graphql';
import { IsString } from 'class-validator';

@InputType()
export class ServiceEnvVarInput {
  @IsString()
  @Field(() => String)
  key!: string;

  @IsString()
  @Field(() => String)
  value!: string;
}
