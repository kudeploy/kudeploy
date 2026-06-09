import { Injectable } from '@nestjs/common';

import { Workspace } from '@/app/workspace/workspace.entity';

import { ServiceLogs } from './kubernetes-logs.object';
import { buildServiceLogsQuery } from './logsql';
import { VictoriaLogsClient } from './victoria-logs.client';

interface ServiceLogsOptions {
  limit?: number | null;
  now?: Date;
  rangeSeconds?: number | null;
}

const DEFAULT_RANGE_SECONDS = 60 * 60;
const MAX_RANGE_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

@Injectable()
export class KubernetesLogsService {
  constructor(private readonly victoriaLogsClient: VictoriaLogsClient) {}

  async getServiceLogs(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
    options: ServiceLogsOptions = {},
  ): Promise<ServiceLogs> {
    const rangeSeconds = clampPositiveInteger(
      options.rangeSeconds,
      DEFAULT_RANGE_SECONDS,
      60,
      MAX_RANGE_SECONDS,
    );
    const limit = clampPositiveInteger(
      options.limit,
      DEFAULT_LIMIT,
      1,
      MAX_LIMIT,
    );
    const empty = () => emptyLogs(rangeSeconds, limit);

    if (!this.victoriaLogsClient.isConfigured()) {
      return empty();
    }

    const end = options.now ?? new Date();
    const start = new Date(end.getTime() - rangeSeconds * 1000);

    try {
      return {
        available: true,
        entries: await this.victoriaLogsClient.query(
          buildServiceLogsQuery({
            workspaceId: workspace.id,
            projectId,
            serviceId,
          }),
          {
            end,
            limit,
            start,
          },
        ),
        limit,
        rangeSeconds,
      };
    } catch {
      return empty();
    }
  }
}

function emptyLogs(rangeSeconds: number, limit: number): ServiceLogs {
  return {
    available: false,
    entries: [],
    limit,
    rangeSeconds,
  };
}

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
