import { Injectable } from '@nestjs/common';
import { get } from 'lodash';

import { Cursor } from '@nest-boot/graphql-connection/dist/cursor';
import { OrderDirection } from '@nest-boot/graphql-connection/dist/enums/order-direction.enum';
import { GRAPHQL_CONNECTION_METADATA } from '@nest-boot/graphql-connection/dist/graphql-connection.constants';
import type { ConnectionMetadata } from '@nest-boot/graphql-connection/dist/interfaces/connection-metadata.interface';
import type { ConnectionArgsInterface } from '@nest-boot/graphql-connection/dist/interfaces/connection-args.interface';
import type { ConnectionInterface } from '@nest-boot/graphql-connection/dist/interfaces/connection.interface';
import type { ConnectionClass } from '@nest-boot/graphql-connection/dist/types/connection-class.type';

export interface KubernetesConnectionFindOptions<Entity extends object> {
  items: Entity[];
}

@Injectable()
export class KubernetesConnectionManager {
  async find<Entity extends { id?: string }>(
    connectionClass: ConnectionClass<Entity>,
    args: ConnectionArgsInterface<Entity>,
    options: KubernetesConnectionFindOptions<Entity>,
  ): Promise<ConnectionInterface<Entity>> {
    const metadata = this.getMetadata(connectionClass);
    const queryFilteredItems = this.applyQuery(options.items, args, metadata);
    const filteredItems = this.applyFilter(queryFilteredItems, args.filter);
    const sortedItems = this.sortItems(filteredItems, args);
    const { pageItems, hasNextPage, hasPreviousPage } = this.paginate(
      sortedItems,
      args,
    );

    const edges = pageItems.map((node) => ({
      node,
      cursor: new Cursor({
        id: node.id,
        ...(args.orderBy
          ? {
              value: get(node, args.orderBy.field),
            }
          : {}),
      }).toString(),
    }));

    return {
      totalCount: filteredItems.length,
      edges,
      pageInfo: {
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  private getMetadata<Entity extends object>(
    connectionClass: ConnectionClass<Entity>,
  ): ConnectionMetadata<Entity> {
    const metadata = Reflect.getMetadata(
      GRAPHQL_CONNECTION_METADATA,
      connectionClass,
    ) as ConnectionMetadata<Entity> | undefined;

    if (!metadata) {
      throw new Error('Connection metadata not found');
    }

    return metadata;
  }

  private applyQuery<Entity extends object>(
    items: Entity[],
    args: ConnectionArgsInterface<Entity>,
    metadata: ConnectionMetadata<Entity>,
  ): Entity[] {
    const query = args.query?.trim().toLowerCase();

    if (!query) {
      return items;
    }

    const searchableFields = [...metadata.fieldOptionsMap.values()]
      .filter((field) => field.searchable)
      .map((field) =>
        'replacement' in field && typeof field.replacement === 'string'
          ? field.replacement
          : field.field,
      );

    if (searchableFields.length === 0) {
      return items;
    }

    return items.filter((item) =>
      searchableFields.some((field) =>
        String(get(item, field) ?? '')
          .toLowerCase()
          .includes(query),
      ),
    );
  }

  private applyFilter<Entity extends object>(
    items: Entity[],
    filter: ConnectionArgsInterface<Entity>['filter'],
  ): Entity[] {
    if (!filter) {
      return items;
    }

    return items.filter((item) => this.matchesFilter(item, filter));
  }

  private matchesFilter(item: object, filter: unknown): boolean {
    if (!filter || typeof filter !== 'object') {
      return true;
    }

    return Object.entries(filter).every(([key, value]) => {
      if (key === '$and' && Array.isArray(value)) {
        return value.every((child) => this.matchesFilter(item, child));
      }
      if (key === '$or' && Array.isArray(value)) {
        return value.some((child) => this.matchesFilter(item, child));
      }

      return this.matchesFieldFilter(get(item, key), value);
    });
  }

  private matchesFieldFilter(actual: unknown, filter: unknown): boolean {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
      return actual === filter;
    }

    return Object.entries(filter).every(([operator, expected]) => {
      switch (operator) {
        case '$eq':
          return actual === expected;
        case '$ne':
          return actual !== expected;
        case '$in':
          return Array.isArray(expected) && expected.includes(actual);
        case '$gt':
          return this.compareValues(actual, expected) > 0;
        case '$gte':
          return this.compareValues(actual, expected) >= 0;
        case '$lt':
          return this.compareValues(actual, expected) < 0;
        case '$lte':
          return this.compareValues(actual, expected) <= 0;
        default:
          return true;
      }
    });
  }

  private sortItems<Entity extends { id?: string }>(
    items: Entity[],
    args: ConnectionArgsInterface<Entity>,
  ): Entity[] {
    const orderField = args.orderBy?.field ?? 'id';
    const direction = args.orderBy?.direction ?? OrderDirection.ASC;
    const directionFactor = direction === OrderDirection.ASC ? 1 : -1;

    return [...items].sort((left, right) => {
      const fieldComparison =
        this.compareValues(get(left, orderField), get(right, orderField)) *
        directionFactor;

      if (fieldComparison !== 0 || orderField === 'id') {
        return fieldComparison;
      }

      return this.compareValues(left.id, right.id) * directionFactor;
    });
  }

  private paginate<Entity extends { id?: string }>(
    items: Entity[],
    args: ConnectionArgsInterface<Entity>,
  ) {
    const isForwardPaging =
      typeof args.first === 'number' || typeof args.after === 'string';
    const isBackwardPaging =
      typeof args.last === 'number' || typeof args.before === 'string';

    if (isForwardPaging && isBackwardPaging) {
      throw new Error('paging must use either first/after or last/before');
    }

    if (isBackwardPaging) {
      const beforeIndex = this.cursorIndex(items, args.before);
      const beforeItems =
        beforeIndex === -1 ? items : items.slice(0, beforeIndex);
      const limit = args.last ?? beforeItems.length;

      return {
        pageItems: beforeItems.slice(Math.max(beforeItems.length - limit, 0)),
        hasNextPage: args.before != null,
        hasPreviousPage: beforeItems.length > limit,
      };
    }

    const afterIndex = this.cursorIndex(items, args.after);
    const afterItems = afterIndex === -1 ? items : items.slice(afterIndex + 1);
    const limit = args.first ?? afterItems.length;

    return {
      pageItems: afterItems.slice(0, limit),
      hasNextPage: afterItems.length > limit,
      hasPreviousPage: args.after != null,
    };
  }

  private cursorIndex<Entity extends { id?: string }>(
    items: Entity[],
    cursorValue?: string,
  ): number {
    if (!cursorValue) {
      return -1;
    }

    const cursor = new Cursor(cursorValue);
    return items.findIndex((item) => item.id === cursor.id);
  }

  private compareValues(left: unknown, right: unknown): number {
    const normalizedLeft = left instanceof Date ? left.getTime() : left;
    const normalizedRight = right instanceof Date ? right.getTime() : right;

    if (normalizedLeft == null && normalizedRight == null) {
      return 0;
    }
    if (normalizedLeft == null) {
      return -1;
    }
    if (normalizedRight == null) {
      return 1;
    }
    if (normalizedLeft < normalizedRight) {
      return -1;
    }
    if (normalizedLeft > normalizedRight) {
      return 1;
    }
    return 0;
  }
}
