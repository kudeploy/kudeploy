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

  it('uses id as the stable tie-breaker for logs with the same raw time', () => {
    const laterId = log({
      id: 'f'.repeat(32),
      rawTime: '2026-06-08T16:46:23.000000000Z',
    });
    const earlierId = log({
      id: '1'.repeat(32),
      rawTime: '2026-06-08T16:46:23.000000000Z',
    });

    expect([laterId, earlierId].sort(compareServiceLogsAsc)).toEqual([
      earlierId,
      laterId,
    ]);
  });

  it('builds cursor payloads from the log id and raw time', () => {
    expect(
      serviceLogCursorPayload(
        log({
          id: 'a'.repeat(32),
          rawTime: '2026-06-08T16:46:23.123456789Z',
        }),
      ),
    ).toEqual({
      id: 'a'.repeat(32),
      t: '2026-06-08T16:46:23.123456789Z',
    });
  });
});

function log(input: { id: string; rawTime: string }): ServiceLog {
  return {
    containerName: 'api',
    deploymentName: 'service-1-00002',
    id: input.id,
    level: null,
    message: 'line',
    namespace: 'project-1',
    podName: 'pod-1',
    rawTime: input.rawTime,
    stream: '{pod="pod-1"}',
    streamId: 'stream-1',
    timestamp: new Date(input.rawTime),
  };
}
