import { ArgsType, ObjectType } from '@nest-boot/graphql';
import { ConnectionBuilder } from '@nest-boot/graphql-connection/dist/connection.builder';

import { Service } from './service.object';

const { Connection, ConnectionArgs } = new ConnectionBuilder(Service)
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
export class ServiceConnectionArgs extends ConnectionArgs {}

@ObjectType()
export class ServiceConnection extends Connection {}
