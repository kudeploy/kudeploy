import { Field, ID, Int, ObjectType } from '@nest-boot/graphql';

import { VolumeStatus } from './volume-status.enum';

@ObjectType('Volume')
export class Volume {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Int)
  size!: number;

  @Field(() => VolumeStatus)
  status!: VolumeStatus;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
