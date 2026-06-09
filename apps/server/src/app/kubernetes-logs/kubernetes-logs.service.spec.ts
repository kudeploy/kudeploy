import { Workspace } from '@/app/workspace/workspace.entity';

import { KubernetesLogsService } from './kubernetes-logs.service';
import { VictoriaLogsClient } from './victoria-logs.client';

describe('KubernetesLogsService', () => {
  it('returns service logs from VictoriaLogs', async () => {
    const { service, victoriaLogsClient } = createService();
    const now = new Date('2026-06-08T17:00:00.000Z');

    victoriaLogsClient.query.mockResolvedValue([
      {
        containerName: 'api',
        deploymentName: 'service-1-00002',
        message: 'ready',
        namespace: 'project-1',
        podName: 'pod-1',
        timestamp: new Date('2026-06-08T16:46:23.000Z'),
      },
    ]);

    await expect(
      service.getServiceLogs(
        { id: 'workspace-1' } as Workspace,
        'project-1',
        'service-1',
        {
          limit: 100,
          now,
          rangeSeconds: 3600,
        },
      ),
    ).resolves.toEqual({
      available: true,
      entries: [
        {
          containerName: 'api',
          deploymentName: 'service-1-00002',
          message: 'ready',
          namespace: 'project-1',
          podName: 'pod-1',
          timestamp: new Date('2026-06-08T16:46:23.000Z'),
        },
      ],
      limit: 100,
      rangeSeconds: 3600,
    });
    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      'kubernetes.pod_labels.app.kubernetes.io/managed-by:="kudeploy" AND kubernetes.pod_labels.kudeploy.com/workspace-id:="workspace-1" AND kubernetes.pod_labels.kudeploy.com/project:="project-1" AND kubernetes.pod_labels.kudeploy.com/service:="service-1" | fields _time, _msg, kubernetes.pod_namespace, kubernetes.pod_name, kubernetes.container_name, kubernetes.pod_labels.kudeploy.com/deployment',
      {
        end: now,
        limit: 100,
        start: new Date('2026-06-08T16:00:00.000Z'),
      },
    );
  });

  it('returns an unavailable empty result when VictoriaLogs is not configured', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.isConfigured.mockReturnValue(false);

    await expect(
      service.getServiceLogs(
        { id: 'workspace-1' } as Workspace,
        'project-1',
        'service-1',
      ),
    ).resolves.toMatchObject({
      available: false,
      entries: [],
      limit: 200,
      rangeSeconds: 3600,
    });
    expect(victoriaLogsClient.query).not.toHaveBeenCalled();
  });

  it('clamps requested ranges and limits', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.query.mockResolvedValue([]);

    await service.getServiceLogs(
      { id: 'workspace-1' } as Workspace,
      'project-1',
      'service-1',
      {
        limit: 10_000,
        rangeSeconds: 60 * 60 * 24 * 30,
      },
    );

    expect(victoriaLogsClient.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 500,
      }),
    );
  });

  it('keeps a stable shape when VictoriaLogs queries fail', async () => {
    const { service, victoriaLogsClient } = createService();

    victoriaLogsClient.query.mockRejectedValue(new Error('unreachable'));

    await expect(
      service.getServiceLogs(
        { id: 'workspace-1' } as Workspace,
        'project-1',
        'service-1',
      ),
    ).resolves.toMatchObject({
      available: false,
      entries: [],
      limit: 200,
      rangeSeconds: 3600,
    });
  });
});

function createService() {
  const victoriaLogsClient = {
    isConfigured: jest.fn(() => true),
    query: jest.fn(),
  };
  const service = new KubernetesLogsService(
    victoriaLogsClient as unknown as VictoriaLogsClient,
  );

  return {
    service,
    victoriaLogsClient,
  };
}
