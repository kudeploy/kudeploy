import { ArgsType, ObjectType } from '@nest-boot/graphql';
import { ConnectionBuilder } from '@nest-boot/graphql-connection/dist/connection.builder';

import { Project } from './project.object';

const { Connection, ConnectionArgs } = new ConnectionBuilder(Project)
  .addField({
    field: 'name',
    searchable: true,
    filterable: true,
    type: 'string',
  })
  .addField({
    field: 'createdAt',
    filterable: true,
    sortable: true,
    type: 'date',
  })
  .build();

@ArgsType()
export class ProjectConnectionArgs extends ConnectionArgs {}

@ObjectType()
export class ProjectConnection extends Connection {}
