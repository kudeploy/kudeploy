import { ArgsType, ObjectType } from '@nest-boot/graphql';
import { ConnectionBuilder } from '@nest-boot/graphql-connection/dist/connection.builder';

import { Deployment } from './deployment.object';

const { Connection, ConnectionArgs } = new ConnectionBuilder(Deployment)
  .addField({
    field: 'version',
    filterable: true,
    sortable: true,
    type: 'number',
  })
  .addField({
    field: 'image',
    searchable: true,
    filterable: true,
    type: 'string',
  })
  .addField({
    field: 'status',
    filterable: true,
    sortable: true,
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
export class DeploymentConnectionArgs extends ConnectionArgs {}

@ObjectType()
export class DeploymentConnection extends Connection {}
