import { Field, ID, ObjectType } from '@nest-boot/graphql';

import { ProjectStatus } from './project-status.enum';

@ObjectType('Project')
export class Project {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => ProjectStatus)
  status!: ProjectStatus;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
