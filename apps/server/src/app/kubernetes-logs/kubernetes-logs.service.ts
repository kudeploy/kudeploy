import { Injectable } from '@nestjs/common';

import { Workspace } from '@/app/workspace/workspace.entity';

import { ServiceLog, ServiceLogConnection } from './kubernetes-logs.object';
import { buildServiceLogsQuery } from './logsql';
import {
  compareServiceLogToCursor,
  compareServiceLogsDesc,
  serviceLogCursorPayload,
} from './service-log-order';
import type { ServiceLogCursorPayload } from './service-log-order';
import { VictoriaLogsClient } from './victoria-logs.client';

interface ServiceLogsOptions {
  after?: string | null;
  before?: string | null;
  first?: number | null;
  last?: number | null;
  now?: Date;
}

const DEFAULT_PAGE_SIZE = 500;
const MAX_PAGE_SIZE = 500;
const MAX_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class KubernetesLogsService {
  constructor(private readonly victoriaLogsClient: VictoriaLogsClient) {}

  async getServiceLogs(
    workspace: Workspace,
    projectId: string,
    serviceId: string,
    options: ServiceLogsOptions = {},
  ): Promise<ServiceLogConnection> {
    const paging = getPaging(options);
    const cursor = decodeServiceLogCursor(
      paging.mode === 'forward' ? options.after : options.before,
    );
    const empty = () => emptyConnection(false);

    if (!this.victoriaLogsClient.isConfigured()) {
      return empty();
    }

    const now = options.now ?? new Date();
    const lowerBound = new Date(now.getTime() - MAX_LOOKBACK_MS);
    const order = paging.mode === 'backward' ? 'asc' : 'desc';
    const queryLimit = paging.limit + 1;

    try {
      const rows = await this.victoriaLogsClient.query(
        buildServiceLogsQuery(
          {
            workspaceId: workspace.id,
            projectId,
            serviceId,
          },
          {
            cursorBoundary: cursor
              ? {
                  cursor,
                  direction: paging.mode === 'forward' ? 'older' : 'newer',
                }
              : undefined,
            limit: queryLimit,
            order,
          },
        ),
        {
          end: paging.mode === 'forward' ? cursorEnd(cursor, now) : now,
          limit: queryLimit,
          order,
          start:
            paging.mode === 'backward'
              ? cursorStart(cursor, lowerBound)
              : lowerBound,
        },
      );

      return toConnection({
        cursor,
        limit: paging.limit,
        mode: paging.mode,
        rows,
      });
    } catch {
      return empty();
    }
  }
}

export function encodeServiceLogCursor(log: ServiceLog) {
  return Buffer.from(JSON.stringify(serviceLogCursorPayload(log))).toString(
    'base64url',
  );
}

function decodeServiceLogCursor(
  cursor: string | null | undefined,
): ServiceLogCursorPayload | null {
  if (!cursor) {
    return null;
  }

  try {
    const value = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as unknown;

    if (
      value &&
      typeof value === 'object' &&
      typeof (value as ServiceLogCursorPayload).t === 'string' &&
      typeof (value as ServiceLogCursorPayload).id === 'string' &&
      !Number.isNaN(new Date((value as ServiceLogCursorPayload).t).getTime())
    ) {
      return {
        containerName: stringOrNull(
          (value as Partial<ServiceLogCursorPayload>).containerName,
        ),
        deploymentName: stringOrNull(
          (value as Partial<ServiceLogCursorPayload>).deploymentName,
        ),
        id: (value as ServiceLogCursorPayload).id,
        message:
          typeof (value as Partial<ServiceLogCursorPayload>).message ===
          'string'
            ? (value as ServiceLogCursorPayload).message
            : '',
        namespace: stringOrNull(
          (value as Partial<ServiceLogCursorPayload>).namespace,
        ),
        podName: stringOrNull(
          (value as Partial<ServiceLogCursorPayload>).podName,
        ),
        streamId: stringOrNull(
          (value as Partial<ServiceLogCursorPayload>).streamId,
        ),
        t: (value as ServiceLogCursorPayload).t,
      };
    }
  } catch {
    // Fall through to the shared error below.
  }

  throw new Error('Invalid service log cursor');
}

function getPaging(options: ServiceLogsOptions): {
  limit: number;
  mode: 'backward' | 'forward';
} {
  const isForward = options.first != null || options.after != null;
  const isBackward = options.last != null || options.before != null;

  if (isForward && isBackward) {
    throw new Error('paging must use either first/after or last/before');
  }

  if (isForward) {
    return {
      limit: clampPageSize(options.first),
      mode: 'forward',
    };
  }

  if (isBackward) {
    return {
      limit: clampPageSize(options.last),
      mode: 'backward',
    };
  }

  return {
    limit: clampPageSize(options.first),
    mode: 'forward',
  };
}

function toConnection({
  cursor,
  limit,
  mode,
  rows,
}: {
  cursor: ServiceLogCursorPayload | null;
  limit: number;
  mode: 'backward' | 'forward';
  rows: ServiceLog[];
}): ServiceLogConnection {
  const filteredRows = cursor
    ? rows.filter((row) =>
        mode === 'forward'
          ? compareServiceLogToCursor(row, cursor) < 0
          : compareServiceLogToCursor(row, cursor) > 0,
      )
    : rows;
  const sortedRows = [...filteredRows].sort(compareServiceLogsDesc);
  const pageRows =
    mode === 'forward'
      ? sortedRows.slice(0, limit)
      : sortedRows.slice(Math.max(sortedRows.length - limit, 0));
  const edges = pageRows.map((node) => ({
    cursor: encodeServiceLogCursor(node),
    node,
  }));

  return {
    available: true,
    edges,
    pageInfo: {
      endCursor: edges[edges.length - 1]?.cursor ?? null,
      hasNextPage: mode === 'forward' ? filteredRows.length > limit : !!cursor,
      hasPreviousPage:
        mode === 'forward' ? !!cursor : filteredRows.length > limit,
      startCursor: edges[0]?.cursor ?? null,
    },
  };
}

function emptyConnection(available: boolean): ServiceLogConnection {
  return {
    available,
    edges: [],
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
    },
  };
}

function cursorStart(
  cursor: ServiceLogCursorPayload | null,
  lowerBound: Date,
): Date {
  if (!cursor) {
    return lowerBound;
  }

  return maxDate(lowerBound, new Date(cursor.t));
}

function cursorEnd(cursor: ServiceLogCursorPayload | null, now: Date): Date {
  if (!cursor) {
    return now;
  }

  return minDate(now, new Date(new Date(cursor.t).getTime() + 1));
}

function clampPageSize(value: number | null | undefined): number {
  if (!Number.isFinite(value) || value == null) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(value)));
}

function maxDate(left: Date, right: Date): Date {
  return left.getTime() > right.getTime() ? left : right;
}

function minDate(left: Date, right: Date): Date {
  return left.getTime() < right.getTime() ? left : right;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
