import { ServiceLog } from './kubernetes-logs.object';
import {
  compareServiceLogsAsc,
  serviceLogCursorPayload,
} from './service-log-order';

describe('service log order', () => {
  it('orders logs by raw nanosecond time', () => {
    const later = log({
      id: '1'.repeat(32),
      rawTime: '2026-06-08T16:46:23.000000001Z',
    });
    const earlier = log({
      id: 'f'.repeat(32),
      rawTime: '2026-06-08T16:46:23.000000000Z',
    });

    expect([later, earlier].sort(compareServiceLogsAsc)).toEqual([
      earlier,
      later,
    ]);
  });

  it('uses VictoriaLogs hash fields before id for logs with the same raw time', () => {
    const laterHash = log({
      id: '1'.repeat(32),
      messageHash: '20',
      rawTime: '2026-06-08T16:46:23.000000000Z',
    });
    const earlierHash = log({
      id: 'f'.repeat(32),
      messageHash: '10',
      rawTime: '2026-06-08T16:46:23.000000000Z',
    });

    expect([laterHash, earlierHash].sort(compareServiceLogsAsc)).toEqual([
      earlierHash,
      laterHash,
    ]);
  });

  it('builds cursor payloads from the log id, raw time, and sort fields', () => {
    expect(
      serviceLogCursorPayload(
        log({
          id: 'a'.repeat(32),
          messageHash: '20',
          rawTime: '2026-06-08T16:46:23.123456789Z',
          streamHash: '10',
          streamId: 'stream-2',
        }),
      ),
    ).toEqual({
      id: 'a'.repeat(32),
      mh: '20',
      sh: '10',
      sid: 'stream-2',
      t: '2026-06-08T16:46:23.123456789Z',
    });
  });
});

function log(input: {
  id: string;
  messageHash?: string;
  rawTime: string;
  streamHash?: string;
  streamId?: string;
}): ServiceLog {
  return {
    containerName: 'api',
    deploymentName: 'service-1-00002',
    id: input.id,
    level: null,
    message: 'line',
    messageHash: input.messageHash ?? '1',
    namespace: 'project-1',
    podName: 'pod-1',
    rawTime: input.rawTime,
    stream: '{pod="pod-1"}',
    streamHash: input.streamHash ?? '1',
    streamId: input.streamId ?? 'stream-1',
    timestamp: new Date(input.rawTime),
  };
}
