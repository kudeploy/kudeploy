import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  LOG_FIELD_CONTAINER,
  LOG_FIELD_DEPLOYMENT,
  LOG_FIELD_MESSAGE,
  LOG_FIELD_NAMESPACE,
  LOG_FIELD_POD,
  LOG_FIELD_TIME,
} from './logsql';
import { ServiceLogEntry } from './kubernetes-logs.object';

interface QueryOptions {
  start: Date;
  end: Date;
  limit: number;
}

type RawLogEntry = Record<string, unknown>;

@Injectable()
export class VictoriaLogsClient {
  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.victoriaLogsUrl());
  }

  async query(
    query: string,
    options: QueryOptions,
  ): Promise<ServiceLogEntry[]> {
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

    return parseJsonLines(await response.text());
  }

  private buildBody(query: string, options: QueryOptions): URLSearchParams {
    const body = new URLSearchParams();

    body.set('query', query);
    body.set('start', options.start.toISOString());
    body.set('end', options.end.toISOString());
    body.set('limit', String(options.limit));

    return body;
  }

  private buildUrl(path: string): URL {
    const baseUrl = this.victoriaLogsUrl();
    if (!baseUrl) {
      throw new Error('VICTORIA_LOGS_URL is not configured');
    }

    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/$/, '')}${path}`;

    return url;
  }

  private victoriaLogsUrl(): string | null {
    const url = this.configService.get<string>('VICTORIA_LOGS_URL')?.trim();

    return url?.length ? url : null;
  }
}

function parseJsonLines(body: string): ServiceLogEntry[] {
  const entries: ServiceLogEntry[] = [];

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

  return entries.sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
  );
}

function parseJsonLine(line: string): RawLogEntry | null {
  try {
    const value = JSON.parse(line) as unknown;

    return value && typeof value === 'object' ? (value as RawLogEntry) : null;
  } catch {
    return null;
  }
}

function toServiceLogEntry(entry: RawLogEntry | null): ServiceLogEntry | null {
  if (!entry) {
    return null;
  }

  const timestamp = toDate(stringField(entry, LOG_FIELD_TIME));
  const message = stringField(entry, LOG_FIELD_MESSAGE);
  if (!timestamp || message == null) {
    return null;
  }

  return {
    containerName: stringField(entry, LOG_FIELD_CONTAINER),
    deploymentName: stringField(entry, LOG_FIELD_DEPLOYMENT),
    message,
    namespace: stringField(entry, LOG_FIELD_NAMESPACE),
    podName: stringField(entry, LOG_FIELD_POD),
    timestamp,
  };
}

function stringField(entry: RawLogEntry, field: string): string | null {
  const value = entry[field];

  return typeof value === 'string' && value.length ? value : null;
}

function toDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
