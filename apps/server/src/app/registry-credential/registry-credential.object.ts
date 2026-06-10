import { Field, ID, ObjectType } from '@nest-boot/graphql';

@ObjectType()
export class RegistryCredential {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  registry!: string;

  @Field(() => String)
  username!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
