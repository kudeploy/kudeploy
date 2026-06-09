import { Workspace } from '@/app/workspace/workspace.entity';

import { ServiceLog } from './kubernetes-logs.object';
import {
  encodeServiceLogCursor,
  KubernetesLogsService,
} from './kubernetes-logs.service';
import { VictoriaLogsClient } from './victoria-logs.client';

describe('KubernetesLogsService', () => {
  it('returns the latest service logs as a connection by default', async () => {
    const { service, victoriaLogsClient } = createService();
    const ready = log({
      id: 'b'.repeat(32),
      message: 'ready',
      rawTime: '2026-06-08T16:46:23.123456789Z',
    });

    victoriaLogsClient.query.mockResolvedValue([ready]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toEqual({
      available: true,
      edges: [
        {
          cursor: encodeServiceLogCursor(ready),
          node: ready,
        },
      ],
      pageInfo: {
        endCursor: encodeServiceLogCursor(ready),
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: encodeServiceLogCursor(ready),
      },
    });
    expect(decodeCursor(encodeServiceLogCursor(ready))).toEqual({
      id: 'b'.repeat(32),
      mh: '1',
      sh: '1',
      sid: 'stream-1',
      t: '2026-06-08T16:46:23.123456789Z',
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.stringContaining('_stream'),
      {
        end: new Date('2026-06-08T17:00:00.000Z'),
        limit: 1001,
        order: 'desc',
        start: new Date('2026-05-09T17:00:00.000Z'),
      },
    );
  });

  it('clamps small page sizes up to the Grafana-style default', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.query.mockResolvedValue([]);

    await service.getServiceLogs(workspace(), 'project-1', 'service-1', {
      first: 10,
    });

    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 1001,
      }),
    );
  });

  it('clamps large page sizes down to the Grafana hard cap', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.query.mockResolvedValue([]);

    await service.getServiceLogs(workspace(), 'project-1', 'service-1', {
      first: 20_000,
    });

    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 10_000,
      }),
    );
  });

  it('loads older logs with first and after by using the cursor time as the end bound', async () => {
    const { service, victoriaLogsClient } = createService();
    const newestReturned = log({
      id: '3'.repeat(32),
      message: 'newest returned',
      rawTime: '2026-06-08T16:46:22.500000000Z',
    });
    const oldestReturned = log({
      id: '2'.repeat(32),
      message: 'oldest returned',
      rawTime: '2026-06-08T16:46:22.000000000Z',
    });
    const afterLog = log({
      id: '4'.repeat(32),
      message: 'after',
      rawTime: '2026-06-08T16:46:23.123456789Z',
    });
    const after = encodeServiceLogCursor(afterLog);

    victoriaLogsClient.query.mockResolvedValue([
      newestReturned,
      oldestReturned,
    ]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        after,
        first: 1000,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      available: true,
      edges: [
        {
          cursor: encodeServiceLogCursor(newestReturned),
          node: newestReturned,
        },
        {
          cursor: encodeServiceLogCursor(oldestReturned),
          node: oldestReturned,
        },
      ],
      pageInfo: {
        endCursor: encodeServiceLogCursor(oldestReturned),
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: encodeServiceLogCursor(newestReturned),
      },
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.stringContaining(
        'filter (_time:<2026-06-08T16:46:23.123456789Z',
      ),
      expect.objectContaining({
        end: '2026-06-08T16:46:23.123456790Z',
        limit: 1001,
        order: 'desc',
      }),
    );
  });

  it('keeps same-timestamp rows after the cursor when loading older logs', async () => {
    const { service, victoriaLogsClient } = createService();
    const cursorLog = log({
      id: '8'.repeat(32),
      message: 'cursor',
      rawTime: '2026-06-08T16:46:23.123456789Z',
    });
    const duplicateCursor = log({
      id: cursorLog.id,
      message: 'duplicate cursor',
      rawTime: cursorLog.rawTime,
    });
    const sameTimestampOlderId = log({
      id: '2'.repeat(32),
      message: 'same timestamp older id',
      rawTime: cursorLog.rawTime,
    });
    const olderTimestamp = log({
      id: 'f'.repeat(32),
      message: 'older timestamp',
      rawTime: '2026-06-08T16:46:22.999999999Z',
    });

    victoriaLogsClient.query.mockResolvedValue([
      duplicateCursor,
      sameTimestampOlderId,
      olderTimestamp,
    ]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        after: encodeServiceLogCursor(cursorLog),
        first: 1000,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      edges: [
        {
          node: sameTimestampOlderId,
        },
        {
          node: olderTimestamp,
        },
      ],
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        end: '2026-06-08T16:46:23.123456790Z',
      }),
    );
  });

  it('does not advertise another older page when cursor filtering removes every fetched row', async () => {
    const { service, victoriaLogsClient } = createService();
    const cursorLog = log({
      id: '8'.repeat(32),
      message: 'cursor',
      rawTime: '2026-06-08T16:46:23.123456789Z',
    });
    const filteredRows = Array.from({ length: 1001 }, (_, index) =>
      log({
        id: `f${index.toString().padStart(31, '0')}`,
        message: `newer same timestamp ${index}`,
        rawTime: cursorLog.rawTime,
      }),
    );

    victoriaLogsClient.query.mockResolvedValue(filteredRows);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        after: encodeServiceLogCursor(cursorLog),
        first: 1000,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: null,
      },
    });
  });

  it('loads newer logs with last and before by using the cursor time as the start bound', async () => {
    const { service, victoriaLogsClient } = createService();
    const firstReturned = log({
      id: '5'.repeat(32),
      message: 'first returned',
      rawTime: '2026-06-08T16:46:24.000000000Z',
    });
    const secondReturned = log({
      id: '6'.repeat(32),
      message: 'second returned',
      rawTime: '2026-06-08T16:46:25.000000000Z',
    });
    const beforeLog = log({
      id: '4'.repeat(32),
      message: 'before',
      rawTime: '2026-06-08T16:46:23.123456789Z',
    });
    const before = encodeServiceLogCursor(beforeLog);

    victoriaLogsClient.query.mockResolvedValue([firstReturned, secondReturned]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        before,
        last: 1000,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      available: true,
      edges: [
        {
          cursor: encodeServiceLogCursor(secondReturned),
          node: secondReturned,
        },
        {
          cursor: encodeServiceLogCursor(firstReturned),
          node: firstReturned,
        },
      ],
      pageInfo: {
        endCursor: encodeServiceLogCursor(firstReturned),
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: encodeServiceLogCursor(secondReturned),
      },
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.stringContaining(
        'filter (_time:>2026-06-08T16:46:23.123456789Z',
      ),
      expect.objectContaining({
        limit: 1001,
        order: 'asc',
        start: '2026-06-08T16:46:23.123456789Z',
      }),
    );
  });

  it('orders exact-second and fractional-second timestamps chronologically', async () => {
    const { service, victoriaLogsClient } = createService();
    const exactSecond = log({
      id: '8'.repeat(32),
      message: 'exact second',
      rawTime: '2026-06-08T16:46:23Z',
    });
    const fractionalSecond = log({
      id: '9'.repeat(32),
      message: 'fractional second',
      rawTime: '2026-06-08T16:46:23.100000000Z',
    });

    victoriaLogsClient.query.mockResolvedValue([exactSecond, fractionalSecond]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      edges: [
        {
          node: fractionalSecond,
        },
        {
          node: exactSecond,
        },
      ],
    });
  });

  it('rejects mixed forward and backward pagination', async () => {
    const { service } = createService();

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        first: 1000,
        last: 1000,
      }),
    ).rejects.toThrow('paging must use either first/after or last/before');
  });

  it('returns an unavailable empty connection when VictoriaLogs is not configured', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.isConfigured.mockReturnValue(false);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1'),
    ).resolves.toEqual({
      available: false,
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
      },
    });
    expect(victoriaLogsClient.query).not.toHaveBeenCalled();
  });

  it('returns an unavailable empty connection when VictoriaLogs config is missing', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.isConfigured.mockImplementation(() => {
      throw new Error('VICTORIA_LOGS_URL is not configured');
    });

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1'),
    ).resolves.toEqual({
      available: false,
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
      },
    });
    expect(victoriaLogsClient.query).not.toHaveBeenCalled();
  });

  it('keeps a stable empty connection when VictoriaLogs queries fail', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.query.mockRejectedValue(new Error('unreachable'));

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1'),
    ).resolves.toEqual({
      available: false,
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
      },
    });
  });
});

function createService() {
  const victoriaLogsClient = {
    isConfigured: jest.fn(() => true),
    query: jest.fn(),
  };
  const service = new KubernetesLogsService(
    victoriaLogsClient as unknown as VictoriaLogsClient,
  );

  return {
    service,
    victoriaLogsClient,
  };
}

function workspace(): Workspace {
  return { id: 'workspace-1' } as Workspace;
}

function log(input: {
  id: string;
  message: string;
  rawTime: string;
  stream?: string;
  streamId?: string;
}): ServiceLog {
  return {
    containerName: 'api',
    deploymentName: 'service-1-00002',
    id: input.id,
    level: null,
    message: input.message,
    messageHash: '1',
    namespace: 'project-1',
    podName: 'pod-1',
    rawTime: input.rawTime,
    stream: input.stream ?? '{pod="pod-1"}',
    streamHash: '1',
    streamId: input.streamId ?? 'stream-1',
    timestamp: new Date(input.rawTime),
  };
}

function decodeCursor(cursor: string): unknown {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
}
