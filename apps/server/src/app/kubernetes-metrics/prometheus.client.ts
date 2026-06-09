import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MetricPoint {
  timestamp: Date;
  value: number;
}

interface QueryRangeOptions {
  start: Date;
  end: Date;
  stepSeconds: number;
}

interface PrometheusQueryRangeResponse {
  status: 'success' | 'error';
  data?: {
    resultType: 'matrix';
    result: {
      values?: [number, string][];
    }[];
  };
  error?: string;
}

@Injectable()
export class PrometheusClient {
  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.prometheusUrl());
  }

  async queryRange(
    query: string,
    options: QueryRangeOptions,
  ): Promise<MetricPoint[]> {
    const url = this.buildUrl('/api/v1/query_range');

    url.searchParams.set('query', query);
    url.searchParams.set(
      'start',
      String(Math.floor(options.start.getTime() / 1000)),
    );
    url.searchParams.set(
      'end',
      String(Math.floor(options.end.getTime() / 1000)),
    );
    url.searchParams.set('step', String(options.stepSeconds));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Prometheus query failed with status ${response.status}`);
    }

    const body = (await response.json()) as PrometheusQueryRangeResponse;
    if (body.status !== 'success') {
      throw new Error(body.error ?? 'Prometheus query failed');
    }

    return toMetricPoints(body);
  }

  private buildUrl(path: string): URL {
    const baseUrl = this.prometheusUrl();
    if (!baseUrl) {
      throw new Error('PROMETHEUS_URL is not configured');
    }

    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/$/, '')}${path}`;

    return url;
  }

  private prometheusUrl(): string | null {
    const url = this.configService.get<string>('PROMETHEUS_URL')?.trim();

    return url?.length ? url : null;
  }
}

function toMetricPoints(response: PrometheusQueryRangeResponse): MetricPoint[] {
  const valuesByTimestamp = new Map<number, number>();

  for (const result of response.data?.result ?? []) {
    for (const [timestamp, rawValue] of result.values ?? []) {
      const value = Number(rawValue);
      if (!Number.isFinite(value)) {
        continue;
      }

      valuesByTimestamp.set(
        timestamp,
        (valuesByTimestamp.get(timestamp) ?? 0) + value,
      );
    }
  }

  return Array.from(valuesByTimestamp.entries())
    .sort(([left], [right]) => left - right)
    .map(([timestamp, value]) => ({
      timestamp: new Date(timestamp * 1000),
      value,
    }));
}
