import { ArgsType, ObjectType } from '@nest-boot/graphql';
import { ConnectionBuilder } from '@nest-boot/graphql-connection/dist/connection.builder';

import { RegistryCredential } from './registry-credential.object';

const { Connection, ConnectionArgs } = new ConnectionBuilder(RegistryCredential)
  .addField({
    field: 'name',
    searchable: true,
    filterable: true,
    type: 'string',
  })
  .addField({
    field: 'registry',
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
export class RegistryCredentialConnectionArgs extends ConnectionArgs {}

@ObjectType()
export class RegistryCredentialConnection extends Connection {}
