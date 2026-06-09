import { ConfigService } from '@nestjs/config';

import { PrometheusClient } from './prometheus.client';

describe('PrometheusClient', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('queries Prometheus range data', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        status: 'success',
        data: {
          resultType: 'matrix',
          result: [
            {
              values: [
                [1_779_964_800, '1.5'],
                [1_779_965_100, '2.5'],
              ],
            },
          ],
        },
      }),
      ok: true,
    });
    const client = createClient('http://prometheus:9090/base/');

    await expect(
      client.queryRange('up', {
        end: new Date('2026-06-08T08:05:00.000Z'),
        start: new Date('2026-06-08T08:00:00.000Z'),
        stepSeconds: 300,
      }),
    ).resolves.toEqual([
      {
        timestamp: new Date(1_779_964_800 * 1000),
        value: 1.5,
      },
      {
        timestamp: new Date(1_779_965_100 * 1000),
        value: 2.5,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        'http://prometheus:9090/base/api/v1/query_range?query=up&start=1780905600&end=1780905900&step=300',
      ),
    );
  });

  it('throws when the Prometheus URL is not configured', async () => {
    const client = createClient(null);

    expect(() => client.isConfigured()).toThrow('PROMETHEUS_URL');
    await expect(
      client.queryRange('up', {
        end: new Date('2026-06-08T08:05:00.000Z'),
        start: new Date('2026-06-08T08:00:00.000Z'),
        stepSeconds: 300,
      }),
    ).rejects.toThrow('PROMETHEUS_URL');
  });
});

function createClient(prometheusUrl: string | null): PrometheusClient {
  const configService = {
    get: jest.fn((key: string) =>
      key === 'PROMETHEUS_URL' ? (prometheusUrl ?? undefined) : undefined,
    ),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'PROMETHEUS_URL' && prometheusUrl) {
        return prometheusUrl;
      }

      throw new Error(`${key} is not configured`);
    }),
  };

  return new PrometheusClient(configService as unknown as ConfigService);
}
