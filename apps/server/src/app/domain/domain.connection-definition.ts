import { ArgsType, ObjectType } from '@nest-boot/graphql';
import { ConnectionBuilder } from '@nest-boot/graphql-connection';

import { Domain } from './domain.entity';

const { Connection, ConnectionArgs } = new ConnectionBuilder(Domain)
  .addField({
    field: 'name',
    searchable: true,
    filterable: true,
    sortable: true,
    type: 'string',
  })
  .addField({
    field: 'status',
    filterable: true,
    sortable: true,
    type: 'string',
  })
  .addField({
    field: 'created_at',
    replacement: 'createdAt',
    filterable: true,
    sortable: true,
    type: 'date',
  })
  .build();

/** 域名分页查询参数。 */
@ArgsType()
export class DomainConnectionArgs extends ConnectionArgs {}

/** 域名分页查询结果。 */
@ObjectType()
export class DomainConnection extends Connection {}
