import {
  parseMigrationWaitTimeout,
  waitForMigrations,
} from './wait-for-migrations';

describe('wait for migrations script', () => {
  it('parses migration wait timeout arguments', () => {
    expect(parseMigrationWaitTimeout([])).toBe(60);
    expect(parseMigrationWaitTimeout(['--migration-wait-timeout=45'])).toBe(45);
    expect(parseMigrationWaitTimeout(['--migration-wait-timeout', '30'])).toBe(
      30,
    );
  });

  it('rejects invalid migration wait timeout arguments', () => {
    expect(() =>
      parseMigrationWaitTimeout(['--migration-wait-timeout=0']),
    ).toThrow('positive integer');
    expect(() =>
      parseMigrationWaitTimeout(['--migration-wait-timeout']),
    ).toThrow('requires a value');
    expect(() =>
      parseMigrationWaitTimeout(['--migration-wait-timeout=slow']),
    ).toThrow('positive integer');
  });

  it('waits until there are no pending migrations', async () => {
    let elapsedMs = 0;
    const getPendingMigrations = jest
      .fn()
      .mockResolvedValueOnce([{ name: 'Migration20260601153226' }])
      .mockResolvedValueOnce([]);
    const orm = {
      close: jest.fn(),
      getMigrator: () => ({ getPendingMigrations }),
    };

    await waitForMigrations({
      createOrm: async () => orm as never,
      intervalMs: 1000,
      logger: silentLogger,
      now: () => elapsedMs,
      sleep: async (ms) => {
        elapsedMs += ms;
      },
      timeoutSeconds: 5,
    });

    expect(getPendingMigrations).toHaveBeenCalledTimes(2);
    expect(orm.close).toHaveBeenCalledWith(true);
  });

  it('times out when migrations remain pending', async () => {
    let elapsedMs = 0;
    const orm = {
      close: jest.fn(),
      getMigrator: () => ({
        getPendingMigrations: jest
          .fn()
          .mockResolvedValue([{ name: 'Migration20260601153226' }]),
      }),
    };

    await expect(
      waitForMigrations({
        createOrm: async () => orm as never,
        intervalMs: 1000,
        logger: silentLogger,
        now: () => elapsedMs,
        sleep: async (ms) => {
          elapsedMs += ms;
        },
        timeoutSeconds: 2,
      }),
    ).rejects.toThrow(
      'Timed out waiting for database migrations after 2 seconds',
    );

    expect(orm.close).toHaveBeenCalledWith(true);
  });
});

const silentLogger = {
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
};
