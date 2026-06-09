import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ServiceLog } from './kubernetes-logs.object';
import {
  LOG_FIELD_CONTAINER,
  LOG_FIELD_DEPLOYMENT,
  LOG_FIELD_LEVEL,
  LOG_FIELD_MESSAGE,
  LOG_FIELD_NAMESPACE,
  LOG_FIELD_POD,
  LOG_FIELD_STREAM,
  LOG_FIELD_STREAM_ID,
  LOG_FIELD_TIME,
} from './logsql';
import {
  compareServiceLogsAsc,
  compareServiceLogsDesc,
  rawTimeToEpochNanoseconds,
} from './service-log-order';

interface QueryOptions {
  start?: Date | string;
  end?: Date | string;
  limit: number;
  order: 'asc' | 'desc';
}

type RawLogEntry = Record<string, unknown>;

@Injectable()
export class VictoriaLogsClient {
  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    this.victoriaLogsUrl();

    return true;
  }

  async query(query: string, options: QueryOptions): Promise<ServiceLog[]> {
    const response = await fetch(this.buildUrl('/select/logsql/query'), {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: this.buildBody(query, options),
    });

    if (!response.ok) {
      throw new Error(
        `VictoriaLogs query failed with status ${response.status}`,
      );
    }

    return parseJsonLines(await response.text(), options.order);
  }

  private buildBody(query: string, options: QueryOptions): URLSearchParams {
    const body = new URLSearchParams();

    body.set('query', query);
    if (options.start) {
      body.set('start', formatTimeBound(options.start));
    }
    if (options.end) {
      body.set('end', formatTimeBound(options.end));
    }
    body.set('limit', String(options.limit));

    return body;
  }

  private buildUrl(path: string): URL {
    const baseUrl = this.victoriaLogsUrl();
    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/$/, '')}${path}`;

    return url;
  }

  private victoriaLogsUrl(): string {
    const url = this.configService
      .getOrThrow<string>('VICTORIA_LOGS_URL')
      .trim();

    if (!url) {
      throw new Error('VICTORIA_LOGS_URL is not configured');
    }

    return url;
  }
}

function parseJsonLines(
  body: string,
  order: QueryOptions['order'],
): ServiceLog[] {
  const entries: ServiceLog[] = [];

  for (const line of body.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    const entry = toServiceLogEntry(parseJsonLine(trimmedLine));
    if (entry) {
      entries.push(entry);
    }
  }

  const sortedEntries = entries.sort((left, right) =>
    order === 'desc'
      ? compareServiceLogsDesc(left, right)
      : compareServiceLogsAsc(left, right),
  );

  return withUniqueIds(sortedEntries);
}

function parseJsonLine(line: string): RawLogEntry | null {
  try {
    const value = JSON.parse(line) as unknown;

    return value && typeof value === 'object' ? (value as RawLogEntry) : null;
  } catch {
    return null;
  }
}

function toServiceLogEntry(entry: RawLogEntry | null): ServiceLog | null {
  if (!entry) {
    return null;
  }

  const rawTime = stringField(entry, LOG_FIELD_TIME);
  const timestamp = toDate(rawTime);
  const message = messageField(entry, LOG_FIELD_MESSAGE);
  if (!rawTime || !timestamp || message == null) {
    return null;
  }

  const streamId = stringField(entry, LOG_FIELD_STREAM_ID);
  const stream = stringField(entry, LOG_FIELD_STREAM);
  const level = normalizeLogLevel(stringField(entry, LOG_FIELD_LEVEL));
  const namespace = stringField(entry, LOG_FIELD_NAMESPACE);
  const podName = stringField(entry, LOG_FIELD_POD);
  const containerName = stringField(entry, LOG_FIELD_CONTAINER);
  const deploymentName = stringField(entry, LOG_FIELD_DEPLOYMENT);

  return {
    containerName,
    deploymentName,
    id: createServiceLogId({
      message,
      rawTime,
      stream,
      timestamp,
    }),
    level,
    message,
    namespace,
    podName,
    rawTime,
    stream,
    streamId,
    timestamp,
  };
}

function createServiceLogId(input: {
  message: string;
  rawTime: string;
  stream: string | null;
  timestamp: Date;
}): string {
  const epochNanoseconds =
    rawTimeToEpochNanoseconds(input.rawTime) ??
    BigInt(input.timestamp.getTime()) * 1_000_000n;

  return createHash('md5')
    .update(epochNanoseconds.toString())
    .update('\0')
    .update(input.message)
    .update('\0')
    .update(input.stream ?? '')
    .digest('hex');
}

function withUniqueIds(entries: ServiceLog[]): ServiceLog[] {
  const seenIds = new Map<string, number>();

  return entries.map((entry) => {
    const count = seenIds.get(entry.id) ?? 0;
    seenIds.set(entry.id, count + 1);

    if (count === 0) {
      return entry;
    }

    return {
      ...entry,
      id: `${entry.id}:${count}`,
    };
  });
}

function formatTimeBound(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString();
}

function stringField(entry: RawLogEntry, field: string): string | null {
  const value = entry[field];

  return typeof value === 'string' && value.length ? value : null;
}

function messageField(entry: RawLogEntry, field: string): string | null {
  const value = entry[field];

  return typeof value === 'string' ? value : null;
}

function normalizeLogLevel(value: string | null): string | null {
  const level = value?.trim().toUpperCase();
  if (!level) {
    return null;
  }

  if (level === 'WARNING') {
    return 'WARN';
  }

  if (level === 'ERR') {
    return 'ERROR';
  }

  return level;
}

function toDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
