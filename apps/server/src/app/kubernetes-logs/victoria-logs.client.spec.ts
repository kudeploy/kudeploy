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

  it('queries VictoriaLogs and parses JSON lines', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        [
          '{"_time":"2026-06-08T16:46:22.83803563Z","_msg":"started","kubernetes.pod_namespace":"project-1","kubernetes.pod_name":"pod-1","kubernetes.container_name":"api","kubernetes.pod_labels.kudeploy.com/deployment":"service-1-00002"}',
          '{"_time":"2026-06-08T16:46:23.000Z","_msg":"ready","kubernetes.pod_name":"pod-1"}',
          '',
        ].join('\n'),
    });
    const client = createClient('http://victoria-logs:9428/root/');

    await expect(
      client.query('error', {
        start: new Date('2026-06-08T16:00:00.000Z'),
        end: new Date('2026-06-08T17:00:00.000Z'),
        limit: 100,
      }),
    ).resolves.toEqual([
      {
        containerName: 'api',
        deploymentName: 'service-1-00002',
        message: 'started',
        namespace: 'project-1',
        podName: 'pod-1',
        timestamp: new Date('2026-06-08T16:46:22.838Z'),
      },
      {
        containerName: null,
        deploymentName: null,
        message: 'ready',
        namespace: null,
        podName: 'pod-1',
        timestamp: new Date('2026-06-08T16:46:23.000Z'),
      },
    ]);

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

  it('reports when the VictoriaLogs URL is not configured', () => {
    const client = createClient('');

    expect(client.isConfigured()).toBe(false);
    expect(() =>
      client.query('error', {
        start: new Date(),
        end: new Date(),
        limit: 100,
      }),
    ).rejects.toThrow('VICTORIA_LOGS_URL is not configured');
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
        start: new Date(),
        end: new Date(),
        limit: 100,
      }),
    ).rejects.toThrow('VictoriaLogs query failed with status 503');
  });
});

function createClient(victoriaLogsUrl: string): VictoriaLogsClient {
  const configService = {
    get: jest.fn((key: string) =>
      key === 'VICTORIA_LOGS_URL' ? victoriaLogsUrl : undefined,
    ),
  };

  return new VictoriaLogsClient(configService as unknown as ConfigService);
}
