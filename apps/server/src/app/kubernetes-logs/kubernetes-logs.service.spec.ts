import { Workspace } from '@/app/workspace/workspace.entity';

import {
  encodeServiceLogCursor,
  KubernetesLogsService,
} from './kubernetes-logs.service';
import { ServiceLog } from './kubernetes-logs.object';
import { VictoriaLogsClient } from './victoria-logs.client';

describe('KubernetesLogsService', () => {
  it('returns the latest service logs as a connection by default', async () => {
    const { service, victoriaLogsClient } = createService();
    const ready = log({
      id: 'b'.repeat(64),
      message: 'ready',
      rawTime: '2026-06-08T16:46:23.000000000Z',
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
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.stringContaining('_stream_id'),
      {
        end: new Date('2026-06-08T17:00:00.000Z'),
        limit: 501,
        order: 'desc',
        start: new Date('2026-05-09T17:00:00.000Z'),
      },
    );
  });

  it('loads older logs with first and after', async () => {
    const { service, victoriaLogsClient } = createService();
    const older = log({
      id: '1'.repeat(64),
      message: 'older',
      rawTime: '2026-06-08T16:46:21.000000000Z',
    });
    const oldestReturned = log({
      id: '2'.repeat(64),
      message: 'oldest returned',
      rawTime: '2026-06-08T16:46:22.000000000Z',
    });
    const newestReturned = log({
      id: '3'.repeat(64),
      message: 'newest returned',
      rawTime: '2026-06-08T16:46:22.500000000Z',
    });
    const after = encodeServiceLogCursor(
      log({
        id: '4'.repeat(64),
        message: 'after',
        rawTime: '2026-06-08T16:46:23.000000000Z',
      }),
    );

    victoriaLogsClient.query.mockResolvedValue([
      newestReturned,
      oldestReturned,
      older,
    ]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        after,
        first: 2,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toEqual({
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
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: encodeServiceLogCursor(newestReturned),
      },
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.stringContaining(
        '(_time:<"2026-06-08T16:46:23.000000000Z")',
      ),
      expect.objectContaining({
        limit: 3,
        order: 'desc',
      }),
    );
  });

  it('loads newer logs with last and before', async () => {
    const { service, victoriaLogsClient } = createService();
    const firstReturned = log({
      id: '5'.repeat(64),
      message: 'first returned',
      rawTime: '2026-06-08T16:46:24.000000000Z',
    });
    const secondReturned = log({
      id: '6'.repeat(64),
      message: 'second returned',
      rawTime: '2026-06-08T16:46:25.000000000Z',
    });
    const newer = log({
      id: '7'.repeat(64),
      message: 'newer',
      rawTime: '2026-06-08T16:46:26.000000000Z',
    });
    const before = encodeServiceLogCursor(
      log({
        id: '4'.repeat(64),
        message: 'before',
        rawTime: '2026-06-08T16:46:23.000000000Z',
      }),
    );

    victoriaLogsClient.query.mockResolvedValue([
      firstReturned,
      secondReturned,
      newer,
    ]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        before,
        last: 2,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toEqual({
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
        hasPreviousPage: true,
        startCursor: encodeServiceLogCursor(secondReturned),
      },
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.stringContaining(
        '(_time:>"2026-06-08T16:46:23.000000000Z")',
      ),
      expect.objectContaining({
        limit: 3,
        order: 'asc',
      }),
    );
  });

  it('uses the query sort tuple for same-timestamp cursors', async () => {
    const { service, victoriaLogsClient } = createService();
    const sameTimestamp = '2026-06-08T16:46:23.000000000Z';
    const olderSameTimestamp = log({
      id: 'f'.repeat(64),
      message: 'alpha',
      rawTime: sameTimestamp,
    });
    const newerSameTimestamp = log({
      id: '1'.repeat(64),
      message: 'zulu',
      rawTime: sameTimestamp,
    });
    const after = encodeServiceLogCursor(
      log({
        id: '0'.repeat(64),
        message: 'middle',
        rawTime: sameTimestamp,
      }),
    );

    victoriaLogsClient.query.mockResolvedValue([
      olderSameTimestamp,
      newerSameTimestamp,
    ]);

    await expect(
      service.getServiceLogs(workspace(), 'project-1', 'service-1', {
        after,
        first: 1,
        now: new Date('2026-06-08T17:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      edges: [
        {
          node: olderSameTimestamp,
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
  });

  it('orders exact-second and fractional-second timestamps chronologically', async () => {
    const { service, victoriaLogsClient } = createService();
    const exactSecond = log({
      id: '8'.repeat(64),
      message: 'exact second',
      rawTime: '2026-06-08T16:46:23Z',
    });
    const fractionalSecond = log({
      id: '9'.repeat(64),
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
        first: 10,
        last: 10,
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
  streamId?: string;
}): ServiceLog {
  return {
    containerName: 'api',
    deploymentName: 'service-1-00002',
    id: input.id,
    message: input.message,
    namespace: 'project-1',
    podName: 'pod-1',
    rawTime: input.rawTime,
    streamId: input.streamId ?? 'stream-1',
    timestamp: new Date(input.rawTime),
  };
}
