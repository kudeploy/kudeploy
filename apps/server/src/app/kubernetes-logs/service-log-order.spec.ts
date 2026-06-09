import { ServiceLog } from './kubernetes-logs.object';
import { compareServiceLogsAsc } from './service-log-order';

describe('service log order', () => {
  it('uses deterministic string ordering for cursor tuple fields', () => {
    const pod2 = log({
      id: '2'.repeat(64),
      message: 'line 2',
      podName: 'pod-2',
    });
    const pod10 = log({
      id: '1'.repeat(64),
      message: 'line 10',
      podName: 'pod-10',
    });

    expect([pod2, pod10].sort(compareServiceLogsAsc)).toEqual([pod10, pod2]);
  });
});

function log(input: {
  id: string;
  message: string;
  podName: string;
}): ServiceLog {
  return {
    containerName: 'api',
    deploymentName: 'service-1-00002',
    id: input.id,
    message: input.message,
    namespace: 'project-1',
    podName: input.podName,
    rawTime: '2026-06-08T16:46:23.000000000Z',
    streamId: 'stream-1',
    timestamp: new Date('2026-06-08T16:46:23.000Z'),
  };
}
