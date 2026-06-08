jest.mock('@kubernetes/client-node', () => ({
  CoreV1Api: class CoreV1Api {},
}));

import type { CoreV1Api, V1Pod } from '@kubernetes/client-node';

import { Workspace } from '@/app/workspace/workspace.entity';

import { KubernetesMetricsService } from './kubernetes-metrics.service';
import { PrometheusClient } from './prometheus.client';

describe('KubernetesMetricsService', () => {
  it('returns service CPU, memory, network series and pod resource limits', async () => {
    const { service, coreV1Api, prometheusClient } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;
    const now = new Date('2026-06-08T08:00:00.000Z');

    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        pod({
          name: 'service-1-abc',
          containers: [
            {
              limits: {
                cpu: '500m',
                memory: '512Mi',
              },
            },
            {
              limits: {
                cpu: '0.25',
                memory: '256Mi',
              },
            },
          ],
        }),
      ],
    });
    prometheusClient.queryRange.mockImplementation(async (query: string) => {
      if (query.includes('container_cpu_usage_seconds_total')) {
        return [{ timestamp: now, value: 0.125 }];
      }
      if (query.includes('container_memory_working_set_bytes')) {
        return [{ timestamp: now, value: 268_435_456 }];
      }
      if (query.includes('container_network_receive_bytes_total')) {
        return [{ timestamp: now, value: 2048 }];
      }
      if (query.includes('container_network_transmit_bytes_total')) {
        return [{ timestamp: now, value: 1024 }];
      }

      return [];
    });

    const result = await service.getServiceMetrics(
      workspace,
      'project-1',
      'service-1',
      {
        now,
        rangeSeconds: 3600,
        stepSeconds: 300,
      },
    );

    expect(coreV1Api.listNamespacedPod).toHaveBeenCalledWith({
      namespace: 'project-1',
      labelSelector:
        'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace-id=workspace_1,kudeploy.com/project=project-1,kudeploy.com/service=service-1',
    });
    expect(prometheusClient.queryRange).toHaveBeenCalledWith(
      expect.stringContaining('container_cpu_usage_seconds_total'),
      {
        start: new Date('2026-06-08T07:00:00.000Z'),
        end: now,
        stepSeconds: 300,
      },
    );
    expect(result).toEqual({
      available: true,
      rangeSeconds: 3600,
      stepSeconds: 300,
      cpuLimitMillicores: 750,
      memoryLimitBytes: 805_306_368,
      cpuUsageMillicores: [{ timestamp: now, value: 125 }],
      memoryUsageBytes: [{ timestamp: now, value: 268_435_456 }],
      networkReceiveBytesPerSecond: [{ timestamp: now, value: 2048 }],
      networkTransmitBytesPerSecond: [{ timestamp: now, value: 1024 }],
    });
  });

  it('returns an unavailable empty result when Prometheus is not configured', async () => {
    const { service, coreV1Api, prometheusClient } = createService();

    prometheusClient.isConfigured.mockReturnValue(false);
    coreV1Api.listNamespacedPod.mockResolvedValue({ items: [] });

    await expect(
      service.getServiceMetrics(
        { id: 'workspace_1' } as Workspace,
        'project-1',
        'service-1',
      ),
    ).resolves.toMatchObject({
      available: false,
      cpuLimitMillicores: null,
      memoryLimitBytes: null,
      cpuUsageMillicores: [],
      memoryUsageBytes: [],
      networkReceiveBytesPerSecond: [],
      networkTransmitBytesPerSecond: [],
    });
    expect(prometheusClient.queryRange).not.toHaveBeenCalled();
  });

  it('allows seven day service metric ranges with coarse steps', async () => {
    const { service, coreV1Api, prometheusClient } = createService();

    prometheusClient.isConfigured.mockReturnValue(false);
    coreV1Api.listNamespacedPod.mockResolvedValue({ items: [] });

    await expect(
      service.getServiceMetrics(
        { id: 'workspace_1' } as Workspace,
        'project-1',
        'service-1',
        {
          rangeSeconds: 7 * 24 * 60 * 60,
          stepSeconds: 6 * 60 * 60,
        },
      ),
    ).resolves.toMatchObject({
      rangeSeconds: 7 * 24 * 60 * 60,
      stepSeconds: 6 * 60 * 60,
    });
  });

  it('keeps pod resource limits when Prometheus queries fail', async () => {
    const { service, coreV1Api, prometheusClient } = createService();

    coreV1Api.listNamespacedPod.mockResolvedValue({
      items: [
        pod({
          containers: [
            {
              limits: {
                cpu: '250m',
                memory: '128Mi',
              },
            },
          ],
        }),
      ],
    });
    prometheusClient.queryRange.mockRejectedValue(new Error('unreachable'));

    await expect(
      service.getServiceMetrics(
        { id: 'workspace_1' } as Workspace,
        'project-1',
        'service-1',
      ),
    ).resolves.toMatchObject({
      available: false,
      cpuLimitMillicores: 250,
      memoryLimitBytes: 134_217_728,
      cpuUsageMillicores: [],
      memoryUsageBytes: [],
      networkReceiveBytesPerSecond: [],
      networkTransmitBytesPerSecond: [],
    });
  });
});

function createService() {
  const coreV1Api = {
    listNamespacedPod: jest.fn(),
  };
  const prometheusClient = {
    isConfigured: jest.fn(() => true),
    queryRange: jest.fn(),
  };
  const service = new KubernetesMetricsService(
    coreV1Api as unknown as CoreV1Api,
    prometheusClient as unknown as PrometheusClient,
  );

  return {
    service,
    coreV1Api,
    prometheusClient,
  };
}

function pod(
  options: {
    name?: string;
    containers?: Array<{
      limits?: {
        cpu?: string;
        memory?: string;
      };
    }>;
  } = {},
): V1Pod {
  return {
    metadata: {
      name: options.name ?? 'service-1-abc',
    },
    spec: {
      containers: (options.containers ?? []).map((container, index) => ({
        name: `container-${index}`,
        resources: {
          limits: container.limits,
        },
      })),
    },
  } as V1Pod;
}
