import { ServiceLog } from './kubernetes-logs.object';

export interface ServiceLogCursorPayload {
  id: string;
  t: string;
}

export function serviceLogCursorPayload(
  log: ServiceLog,
): ServiceLogCursorPayload {
  return {
    id: log.id,
    t: log.rawTime,
  };
}

export function compareServiceLogsAsc(
  left: ServiceLog,
  right: ServiceLog,
): number {
  return compareSortTuples(
    serviceLogCursorPayload(left),
    serviceLogCursorPayload(right),
  );
}

export function compareServiceLogsDesc(
  left: ServiceLog,
  right: ServiceLog,
): number {
  return compareServiceLogsAsc(right, left);
}

export function compareServiceLogToCursor(
  log: ServiceLog,
  cursor: ServiceLogCursorPayload,
): number {
  return compareSortTuples(serviceLogCursorPayload(log), cursor);
}

function compareSortTuples(
  left: ServiceLogCursorPayload,
  right: ServiceLogCursorPayload,
): number {
  const timeComparison = compareRawTimes(left.t, right.t);

  if (timeComparison !== 0) {
    return timeComparison;
  }

  return left.id.localeCompare(right.id);
}

function compareRawTimes(left: string, right: string): number {
  const leftNs = rawTimeToEpochNanoseconds(left);
  const rightNs = rawTimeToEpochNanoseconds(right);

  if (leftNs != null && rightNs != null && leftNs !== rightNs) {
    return leftNs < rightNs ? -1 : 1;
  }

  return left.localeCompare(right);
}

export function rawTimeToEpochNanoseconds(value: string): bigint | null {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?Z$/.exec(
    value,
  );

  if (match) {
    const secondsMs = Date.parse(`${match[1]}.000Z`);
    if (Number.isNaN(secondsMs)) {
      return null;
    }

    return (
      BigInt(secondsMs) * 1_000_000n + BigInt((match[2] ?? '').padEnd(9, '0'))
    );
  }

  const milliseconds = Date.parse(value);
  if (Number.isNaN(milliseconds)) {
    return null;
  }

  return BigInt(milliseconds) * 1_000_000n;
}
