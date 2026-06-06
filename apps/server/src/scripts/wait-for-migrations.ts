import { Migrator, type UmzugMigration } from '@mikro-orm/migrations';
import { MikroORM } from '@mikro-orm/postgresql';

import createMikroOrmConfig from '../mikro-orm.config';

const DEFAULT_MIGRATION_WAIT_TIMEOUT_SECONDS = 60;
const DEFAULT_MIGRATION_CHECK_INTERVAL_MS = 2_000;
const MIGRATION_WAIT_TIMEOUT_FLAG = '--migration-wait-timeout';

type MigrationLogger = Pick<typeof console, 'error' | 'log' | 'warn'>;
type MigrationOrm = {
  close(force?: boolean): Promise<void> | void;
  getMigrator(): {
    getPendingMigrations(): Promise<UmzugMigration[]>;
  };
};

type CreateOrm = () => Promise<MigrationOrm>;

export type WaitForMigrationsOptions = {
  createOrm?: CreateOrm;
  intervalMs?: number;
  logger?: MigrationLogger;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  timeoutSeconds?: number;
};

export async function createOrm(): Promise<MigrationOrm> {
  const config = (await createMikroOrmConfig()) as any;

  return MikroORM.init({
    ...config,
    extensions: [...(config.extensions ?? []), Migrator],
  } as never) as Promise<MigrationOrm>;
}

export async function waitForMigrations({
  createOrm: createMigrationOrm = createOrm,
  intervalMs = DEFAULT_MIGRATION_CHECK_INTERVAL_MS,
  logger = console,
  now = Date.now,
  sleep = sleepFor,
  timeoutSeconds = DEFAULT_MIGRATION_WAIT_TIMEOUT_SECONDS,
}: WaitForMigrationsOptions = {}): Promise<void> {
  const timeoutMs = timeoutSeconds * 1_000;
  const startedAt = now();
  let lastError: unknown;
  let lastPendingMigrations: UmzugMigration[] = [];

  while (now() - startedAt <= timeoutMs) {
    try {
      lastPendingMigrations = await getPendingMigrations(createMigrationOrm);
      lastError = undefined;

      if (lastPendingMigrations.length === 0) {
        logger.log('Database migrations are up to date.');
        return;
      }

      logger.warn(
        `Waiting for ${lastPendingMigrations.length} pending database migration(s): ${formatMigrationNames(lastPendingMigrations)}`,
      );
    } catch (error) {
      lastError = error;
      logger.warn(
        `Waiting for database migrations check to succeed: ${formatError(error)}`,
      );
    }

    const remainingMs = timeoutMs - (now() - startedAt);

    if (remainingMs <= 0) {
      break;
    }

    await sleep(Math.min(intervalMs, remainingMs));
  }

  throw new Error(
    [
      `Timed out waiting for database migrations after ${timeoutSeconds} seconds.`,
      lastPendingMigrations.length > 0
        ? `Pending migrations: ${formatMigrationNames(lastPendingMigrations)}.`
        : undefined,
      lastError ? `Last error: ${formatError(lastError)}.` : undefined,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function parseMigrationWaitTimeout(args: string[]): number {
  const flagIndex = args.indexOf(MIGRATION_WAIT_TIMEOUT_FLAG);
  const equalsArg = args.find((arg) =>
    arg.startsWith(`${MIGRATION_WAIT_TIMEOUT_FLAG}=`),
  );

  if (flagIndex >= 0 && args[flagIndex + 1] === undefined) {
    throw new Error(`${MIGRATION_WAIT_TIMEOUT_FLAG} requires a value.`);
  }

  const rawValue =
    equalsArg?.slice(MIGRATION_WAIT_TIMEOUT_FLAG.length + 1) ??
    (flagIndex >= 0 ? args[flagIndex + 1] : undefined);

  if (rawValue === undefined) {
    return DEFAULT_MIGRATION_WAIT_TIMEOUT_SECONDS;
  }

  const timeoutSeconds = Number(rawValue);

  if (!Number.isInteger(timeoutSeconds) || timeoutSeconds <= 0) {
    throw new Error(
      `${MIGRATION_WAIT_TIMEOUT_FLAG} must be a positive integer number of seconds.`,
    );
  }

  return timeoutSeconds;
}

async function main() {
  const timeoutSeconds = parseMigrationWaitTimeout(process.argv.slice(2));

  await waitForMigrations({ timeoutSeconds });
}

async function getPendingMigrations(
  createMigrationOrm: CreateOrm,
): Promise<UmzugMigration[]> {
  const orm = await createMigrationOrm();

  try {
    return await orm.getMigrator().getPendingMigrations();
  } finally {
    await orm.close(true);
  }
}

function formatMigrationNames(migrations: UmzugMigration[]): string {
  return migrations.map((migration) => migration.name).join(', ');
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function sleepFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (require.main === module) {
  void main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
