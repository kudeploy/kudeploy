import { ConfigService } from '@nestjs/config';

import { VictoriaLogsClient } from './victoria-logs.client';

describe('VictoriaLogsClient', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('queries VictoriaLogs and parses stable log identities', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        [
          '{"_time":"2026-06-08T16:46:23.000000000Z","_stream":"{pod=\\"pod-1\\"}","_stream_id":"stream-1","_msg":"ready","kubernetes.pod_name":"pod-1"}',
          '{"_time":"2026-06-08T16:46:22.838035630Z","_stream":"{pod=\\"pod-1\\",container=\\"api\\"}","_stream_id":"stream-1","_msg":"started","kubernetes.pod_namespace":"project-1","kubernetes.pod_name":"pod-1","kubernetes.container_name":"api","kubernetes.pod_labels.kudeploy.com/deployment":"service-1-00002"}',
          '{"_time":"2026-06-08T16:46:22.838035630Z","_stream":"{pod=\\"pod-1\\",container=\\"api\\"}","_stream_id":"stream-1","_msg":"started again","kubernetes.pod_namespace":"project-1","kubernetes.pod_name":"pod-1","kubernetes.container_name":"api","kubernetes.pod_labels.kudeploy.com/deployment":"service-1-00002"}',
          '',
        ].join('\n'),
    });
    const client = createClient('http://victoria-logs:9428/root/');

    const result = await client.query('error', {
      end: new Date('2026-06-08T17:00:00.000Z'),
      limit: 100,
      order: 'asc',
      start: new Date('2026-06-08T16:00:00.000Z'),
    });

    expect(result).toHaveLength(3);
    expect(result.map((entry) => entry.rawTime)).toEqual([
      '2026-06-08T16:46:22.838035630Z',
      '2026-06-08T16:46:22.838035630Z',
      '2026-06-08T16:46:23.000000000Z',
    ]);
    expect(result[0]).toMatchObject({
      containerName: 'api',
      deploymentName: 'service-1-00002',
      message: 'started',
      namespace: 'project-1',
      podName: 'pod-1',
      stream: '{pod="pod-1",container="api"}',
      streamId: 'stream-1',
      timestamp: new Date('2026-06-08T16:46:22.838Z'),
    });
    expect(result[0].id).toMatch(/^[a-f0-9]{32}$/);
    expect(result[1].id).toMatch(/^[a-f0-9]{32}$/);
    expect(result[0].id).toBe('54cb01904044cfe64f368adbd6d860ef');
    expect(result[0].id).not.toBe(result[1].id);

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://victoria-logs:9428/root/select/logsql/query'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }),
    );
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('query')).toBe('error');
    expect(body.get('start')).toBe('2026-06-08T16:00:00.000Z');
    expect(body.get('end')).toBe('2026-06-08T17:00:00.000Z');
    expect(body.get('limit')).toBe('100');
  });

  it('parses log levels from the level field', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        [
          '{"_time":"2026-06-08T16:46:21.000000000Z","_stream_id":"stream-1","_msg":"plain message"}',
          '{"_time":"2026-06-08T16:46:22.000000000Z","_stream_id":"stream-1","level":"warning","_msg":"structured warning"}',
          '{"_time":"2026-06-08T16:46:23.000000000Z","_stream_id":"stream-1","level":"error","_msg":"structured error"}',
          '{"_time":"2026-06-08T16:46:24.000000000Z","_stream_id":"stream-1","_msg":"2026/06/08 16:46:24 [notice] worker started"}',
        ].join('\n'),
    });
    const client = createClient('http://victoria-logs:9428');

    const result = await client.query('logs', {
      limit: 100,
      order: 'asc',
    });

    expect(result.map((entry) => entry.level)).toEqual([
      null,
      'WARN',
      'ERROR',
      null,
    ]);
  });

  it('preserves blank log messages', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        '{"_time":"2026-06-08T16:46:21.000000000Z","_stream_id":"stream-1","_msg":""}',
    });
    const client = createClient('http://victoria-logs:9428');

    await expect(
      client.query('logs', {
        limit: 100,
        order: 'asc',
      }),
    ).resolves.toMatchObject([
      {
        message: '',
      },
    ]);
  });

  it('omits optional time bounds when they are not provided', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    const client = createClient('http://victoria-logs:9428');

    await client.query('error', {
      limit: 501,
      order: 'desc',
    });

    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('start')).toBeNull();
    expect(body.get('end')).toBeNull();
    expect(body.get('limit')).toBe('501');
  });

  it('throws when the VictoriaLogs URL is not configured', async () => {
    const client = createClient(null);

    expect(() => client.isConfigured()).toThrow('VICTORIA_LOGS_URL');
    await expect(
      client.query('error', {
        limit: 100,
        order: 'asc',
      }),
    ).rejects.toThrow('VICTORIA_LOGS_URL');
  });

  it('throws when VictoriaLogs returns an error status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'unavailable',
    });
    const client = createClient('http://victoria-logs:9428');

    await expect(
      client.query('error', {
        limit: 100,
        order: 'asc',
      }),
    ).rejects.toThrow('VictoriaLogs query failed with status 503');
  });
});

function createClient(victoriaLogsUrl: string | null): VictoriaLogsClient {
  const configService = {
    get: jest.fn((key: string) =>
      key === 'VICTORIA_LOGS_URL' ? (victoriaLogsUrl ?? undefined) : undefined,
    ),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'VICTORIA_LOGS_URL' && victoriaLogsUrl) {
        return victoriaLogsUrl;
      }

      throw new Error(`${key} is not configured`);
    }),
  };

  return new VictoriaLogsClient(configService as unknown as ConfigService);
}
