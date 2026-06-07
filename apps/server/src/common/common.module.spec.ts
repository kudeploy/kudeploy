import { join } from 'node:path';

import { getGraphqlSchemaFilePath } from './graphql-schema-file';

describe('CommonModule GraphQL schema file', () => {
  const originalGraphqlSchemaFile = process.env.GRAPHQL_SCHEMA_FILE;

  afterEach(() => {
    if (originalGraphqlSchemaFile === undefined) {
      delete process.env.GRAPHQL_SCHEMA_FILE;
      return;
    }

    process.env.GRAPHQL_SCHEMA_FILE = originalGraphqlSchemaFile;
  });

  it('writes generated schema under the writable temp directory by default', () => {
    delete process.env.GRAPHQL_SCHEMA_FILE;

    expect(getGraphqlSchemaFilePath()).toBe(
      join(process.cwd(), 'temp/schema.gql'),
    );
  });

  it('allows the generated schema path to be overridden', () => {
    process.env.GRAPHQL_SCHEMA_FILE = '/tmp/kudeploy/schema.gql';

    expect(getGraphqlSchemaFilePath()).toBe('/tmp/kudeploy/schema.gql');
  });
});
