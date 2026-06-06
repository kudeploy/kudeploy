import { ConnectionBuilder } from '@nest-boot/graphql-connection/dist/connection.builder';
import { OrderDirection } from '@nest-boot/graphql-connection/dist/enums/order-direction.enum';

import { KubernetesConnectionManager } from './kubernetes-connection.manager';

class TestKubernetesNode {
  id!: string;
  name!: string;
  createdAt!: Date;
}

const { Connection: TestKubernetesNodeConnection } = new ConnectionBuilder(
  TestKubernetesNode,
)
  .addField({
    field: 'name',
    type: 'string',
    filterable: true,
    searchable: true,
  })
  .addField({
    field: 'createdAt',
    type: 'date',
    sortable: true,
  })
  .build();

describe('KubernetesConnectionManager', () => {
  it('filters, sorts, and forward-paginates Kubernetes resource nodes', async () => {
    const manager = new KubernetesConnectionManager();
    const oldApi = node(
      'service-api-old',
      'Billing API',
      '2026-06-01T00:00:00.000Z',
    );
    const newApi = node(
      'service-api-new',
      'Accounts API',
      '2026-06-03T00:00:00.000Z',
    );
    const web = node('service-web', 'Web', '2026-06-02T00:00:00.000Z');

    const result = await manager.find(
      TestKubernetesNodeConnection,
      {
        first: 1,
        orderBy: {
          field: 'createdAt' as never,
          direction: OrderDirection.DESC,
        },
        query: 'api',
      },
      {
        items: [oldApi, web, newApi],
      },
    );

    expect(result.totalCount).toBe(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node).toBe(newApi);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.pageInfo.hasPreviousPage).toBe(false);

    const nextPage = await manager.find(
      TestKubernetesNodeConnection,
      {
        first: 1,
        after: result.pageInfo.endCursor ?? undefined,
        orderBy: {
          field: 'createdAt' as never,
          direction: OrderDirection.DESC,
        },
        query: 'api',
      },
      {
        items: [oldApi, web, newApi],
      },
    );

    expect(nextPage.totalCount).toBe(2);
    expect(nextPage.edges).toHaveLength(1);
    expect(nextPage.edges[0].node).toBe(oldApi);
    expect(nextPage.pageInfo.hasNextPage).toBe(false);
    expect(nextPage.pageInfo.hasPreviousPage).toBe(true);
  });
});

function node(id: string, name: string, createdAt: string): TestKubernetesNode {
  return Object.assign(new TestKubernetesNode(), {
    id,
    name,
    createdAt: new Date(createdAt),
  });
}
