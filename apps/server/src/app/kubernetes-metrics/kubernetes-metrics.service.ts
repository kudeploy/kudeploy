import type { V1Pod } from '@kubernetes/client-node';
import { CoreV1Api } from '@kubernetes/client-node';
import { Injectable } from '@nestjs/common';

import {
  toKubernetesProjectName,
  toKubernetesServiceName,
} from '@/app/kubernetes/resource-names';
import { Workspace } from '@/app/workspace/workspace.entity';

import { ServiceMetrics } from './kubernetes-metrics.object';
import { PrometheusClient } from './prometheus.client';
import {
  buildPodNameRegexMatcher,
  buildServicePodLabelSelector,
  serviceCpuUsageQuery,
  serviceMemoryUsageQuery,
  serviceNetworkReceiveQuery,
  serviceNetworkTransmitQuery,
} from './promql';

interface ServiceMetricsOptions {
  activeDeploymentName?: string | null;
  now?: Date;
  rangeSeconds?: number | null;
  stepSeconds?: number | null;
}

const DEFAULT_RANGE_SECONDS = 60 * 60;
const DEFAULT_STEP_SECONDS = 5 * 60;
const MAX_RANGE_SECONDS = 7 * 24 * 60 * 60;
const MAX_STEP_SECONDS = 6 * 60 * 60;

@Injectable()
export class KubernetesMetricsService {
  constructor(
    private readonly coreV1Api: CoreV1Api,
    private readonly prometheusClient: PrometheusClient,
  ) {}

  async getServiceMetrics(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
    options: ServiceMetricsOptions = {},
  ): Promise<ServiceMetrics> {
    const rangeSeconds = clampPositiveInteger(
      options.rangeSeconds,
      DEFAULT_RANGE_SECONDS,
      60,
      MAX_RANGE_SECONDS,
    );
    const stepSeconds = clampPositiveInteger(
      options.stepSeconds,
      DEFAULT_STEP_SECONDS,
      15,
      MAX_STEP_SECONDS,
    );
    const empty = () => emptyMetrics(rangeSeconds, stepSeconds);

    let pods: V1Pod[];
    try {
      pods = await this.listServicePods(
        workspace,
        projectId,
        serviceId,
        options.activeDeploymentName,
      );
    } catch {
      return empty();
    }

    const limits = this.sumPodLimits(pods);
    const baseResult = {
      ...empty(),
      ...limits,
    };
    const podNames = pods
      .map((pod) => pod.metadata?.name)
      .filter((name): name is string => Boolean(name));

    let prometheusConfigured: boolean;
    try {
      prometheusConfigured = this.prometheusClient.isConfigured();
    } catch {
      prometheusConfigured = false;
    }

    if (!prometheusConfigured || podNames.length === 0) {
      return {
        ...baseResult,
        available: false,
      };
    }

    const end = options.now ?? new Date();
    const start = new Date(end.getTime() - rangeSeconds * 1000);
    const podMatcher = buildPodNameRegexMatcher(projectId, podNames);
    const queryOptions = { start, end, stepSeconds };

    try {
      const [
        cpuUsageCores,
        memoryUsageBytes,
        networkReceiveBytesPerSecond,
        networkTransmitBytesPerSecond,
      ] = await Promise.all([
        this.prometheusClient.queryRange(
          serviceCpuUsageQuery(podMatcher),
          queryOptions,
        ),
        this.prometheusClient.queryRange(
          serviceMemoryUsageQuery(podMatcher),
          queryOptions,
        ),
        this.prometheusClient.queryRange(
          serviceNetworkReceiveQuery(podMatcher),
          queryOptions,
        ),
        this.prometheusClient.queryRange(
          serviceNetworkTransmitQuery(podMatcher),
          queryOptions,
        ),
      ]);

      return {
        ...baseResult,
        available: true,
        cpuUsageMillicores: cpuUsageCores.map((point) => ({
          ...point,
          value: point.value * 1000,
        })),
        memoryUsageBytes,
        networkReceiveBytesPerSecond,
        networkTransmitBytesPerSecond,
      };
    } catch {
      return {
        ...baseResult,
        available: false,
      };
    }
  }

  private async listServicePods(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
    activeDeploymentName?: string | null,
  ): Promise<V1Pod[]> {
    const projectName = toKubernetesProjectName(projectId);
    const serviceName = toKubernetesServiceName(serviceId);

    const list = await this.coreV1Api.listNamespacedPod({
      namespace: projectName,
      labelSelector: buildServicePodLabelSelector({
        deploymentName: activeDeploymentName,
        workspaceId: workspace.id,
        projectId: projectName,
        serviceId: serviceName,
      }),
    });

    return list.items ?? [];
  }

  private sumPodLimits(
    pods: V1Pod[],
  ): Pick<ServiceMetrics, 'cpuLimitMillicores' | 'memoryLimitBytes'> {
    return {
      cpuLimitMillicores: sumContainerLimits(pods, 'cpu', (value) => {
        const cores = parseQuantity(value);

        return cores == null ? null : cores * 1000;
      }),
      memoryLimitBytes: sumContainerLimits(pods, 'memory', parseQuantity),
    };
  }
}

function emptyMetrics(
  rangeSeconds: number,
  stepSeconds: number,
): ServiceMetrics {
  return {
    available: false,
    rangeSeconds,
    stepSeconds,
    cpuLimitMillicores: null,
    memoryLimitBytes: null,
    cpuUsageMillicores: [],
    memoryUsageBytes: [],
    networkReceiveBytesPerSecond: [],
    networkTransmitBytesPerSecond: [],
  };
}

function sumContainerLimits(
  pods: V1Pod[],
  resource: 'cpu' | 'memory',
  parse: (value: string) => number | null,
): number | null {
  let hasLimit = false;
  let total = 0;

  for (const pod of pods) {
    for (const container of pod.spec?.containers ?? []) {
      const value = container.resources?.limits?.[resource];
      if (!value) {
        continue;
      }

      const parsedValue = parse(value);
      if (parsedValue == null) {
        continue;
      }

      hasLimit = true;
      total += parsedValue;
    }
  }

  return hasLimit ? total : null;
}

function parseQuantity(quantity: string): number | null {
  const match =
    /^([+-]?(?:\d+\.?\d*|\.\d+))(Ki|Mi|Gi|Ti|Pi|Ei|n|u|m|k|M|G|T|P|E)?$/.exec(
      quantity.trim(),
    );
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value)) {
    return null;
  }

  const suffix = match[2] ?? '';
  const multiplier = QUANTITY_MULTIPLIERS[suffix];

  return multiplier === undefined ? null : value * multiplier;
}

const QUANTITY_MULTIPLIERS: Record<string, number> = {
  '': 1,
  n: 1 / 1_000_000_000,
  u: 1 / 1_000_000,
  m: 1 / 1000,
  k: 1000,
  M: 1000 * 1000,
  G: 1000 * 1000 * 1000,
  T: 1000 * 1000 * 1000 * 1000,
  P: 1000 * 1000 * 1000 * 1000 * 1000,
  E: 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
  Ki: 1024,
  Mi: 1024 * 1024,
  Gi: 1024 * 1024 * 1024,
  Ti: 1024 * 1024 * 1024 * 1024,
  Pi: 1024 * 1024 * 1024 * 1024 * 1024,
  Ei: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
};

function clampPositiveInteger(
  value: number | null | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value) || value == null) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}
