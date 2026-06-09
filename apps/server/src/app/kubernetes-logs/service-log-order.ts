import { ServiceLog } from './kubernetes-logs.object';

export interface ServiceLogCursorPayload {
  containerName: string | null;
  deploymentName: string | null;
  id: string;
  message: string;
  namespace: string | null;
  podName: string | null;
  streamId: string | null;
  t: string;
}

export function serviceLogCursorPayload(
  log: ServiceLog,
): ServiceLogCursorPayload {
  return {
    containerName: log.containerName,
    deploymentName: log.deploymentName,
    id: log.id,
    message: log.message,
    namespace: log.namespace,
    podName: log.podName,
    streamId: log.streamId,
    t: log.rawTime,
  };
}

export function compareServiceLogsAsc(
  left: ServiceLog,
  right: ServiceLog,
): number {
  return compareSortTuples(serviceLogCursorPayload(left), {
    ...serviceLogCursorPayload(right),
    t: right.rawTime,
  });
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
  return (
    compareRawTimes(left.t, right.t) ||
    compareNullableStrings(left.streamId, right.streamId) ||
    compareNullableStrings(left.namespace, right.namespace) ||
    compareNullableStrings(left.podName, right.podName) ||
    compareNullableStrings(left.containerName, right.containerName) ||
    compareNullableStrings(left.deploymentName, right.deploymentName) ||
    left.message.localeCompare(right.message) ||
    left.id.localeCompare(right.id)
  );
}

function compareRawTimes(left: string, right: string): number {
  const leftNs = rawTimeToEpochNanoseconds(left);
  const rightNs = rawTimeToEpochNanoseconds(right);

  if (leftNs != null && rightNs != null && leftNs !== rightNs) {
    return leftNs < rightNs ? -1 : 1;
  }

  return left.localeCompare(right);
}

function rawTimeToEpochNanoseconds(value: string): bigint | null {
  const match =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?Z$/.exec(
      value,
    );

  if (match) {
    const secondsMs = Date.parse(`${match[1]}.000Z`);
    if (Number.isNaN(secondsMs)) {
      return null;
    }

    return (
      BigInt(secondsMs) * 1_000_000n +
      BigInt((match[2] ?? '').padEnd(9, '0'))
    );
  }

  const milliseconds = Date.parse(value);
  if (Number.isNaN(milliseconds)) {
    return null;
  }

  return BigInt(milliseconds) * 1_000_000n;
}

function compareNullableStrings(
  left: string | null,
  right: string | null,
): number {
  return (left ?? '').localeCompare(right ?? '');
}
