import { ArgsType, ObjectType } from '@nest-boot/graphql';
import { ConnectionBuilder } from '@nest-boot/graphql-connection/dist/connection.builder';

import { Volume } from './volume.object';

const { Connection, ConnectionArgs } = new ConnectionBuilder(Volume)
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
export class VolumeConnectionArgs extends ConnectionArgs {}

@ObjectType()
export class VolumeConnection extends Connection {}
