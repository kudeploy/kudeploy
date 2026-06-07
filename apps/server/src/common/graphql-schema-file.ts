import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const GRAPHQL_SCHEMA_FILE_ENV = 'GRAPHQL_SCHEMA_FILE';

export function getGraphqlSchemaFilePath() {
  return (
    process.env[GRAPHQL_SCHEMA_FILE_ENV] ?? join(process.cwd(), 'temp/schema.gql')
  );
}

export function ensureGraphqlSchemaDirectory() {
  const schemaFilePath = getGraphqlSchemaFilePath();

  mkdirSync(dirname(schemaFilePath), { recursive: true });

  return schemaFilePath;
}
