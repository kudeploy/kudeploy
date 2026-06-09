import { buildServiceLogsQuery } from './logsql';

describe('logsql', () => {
  it('builds a service log query from kudeploy pod labels', () => {
    expect(
      buildServiceLogsQuery({
        projectId: 'project-1',
        serviceId: 'service-1',
        workspaceId: 'workspace-1',
      }),
    ).toBe(
      '`kubernetes.pod_labels.app.kubernetes.io/managed-by`:="kudeploy" AND `kubernetes.pod_labels.kudeploy.com/workspace-id`:="workspace-1" AND `kubernetes.pod_labels.kudeploy.com/project`:="project-1" AND `kubernetes.pod_labels.kudeploy.com/service`:="service-1" | fields _time, _stream_id, _msg, level, `kubernetes.pod_namespace`, `kubernetes.pod_name`, `kubernetes.container_name`, `kubernetes.pod_labels.kudeploy.com/deployment`',
    );
  });

  it('adds stable sort and limit for paged queries', () => {
    expect(
      buildServiceLogsQuery(
        {
          projectId: 'project-1',
          serviceId: 'service-1',
          workspaceId: 'workspace-1',
        },
        {
          limit: 501,
          order: 'desc',
        },
      ),
    ).toContain(
      'sort by (_time, `kubernetes.pod_namespace`, `kubernetes.pod_name`, `kubernetes.container_name`, `kubernetes.pod_labels.kudeploy.com/deployment`, _msg) desc limit 501',
    );
  });

  it('adds cursor tuple filters before limiting older pages', () => {
    const query = buildServiceLogsQuery(
      {
        projectId: 'project-1',
        serviceId: 'service-1',
        workspaceId: 'workspace-1',
      },
      {
        cursorBoundary: {
          cursor: {
            containerName: 'api',
            deploymentName: 'service-1-00002',
            id: 'a'.repeat(64),
            message: 'line 10',
            namespace: 'project-1',
            podName: 'pod-10',
            streamId: 'stream-1',
            t: '2026-06-08T16:46:23.123456789Z',
          },
          direction: 'older',
        },
        limit: 101,
        order: 'desc',
      },
    );

    expect(query).toContain(
      '(_time:<"2026-06-08T16:46:23.123456789Z")',
    );
    expect(query).toContain(
      '(_time:="2026-06-08T16:46:23.123456789Z" AND `kubernetes.pod_namespace`:="project-1" AND (`kubernetes.pod_name`:"" OR `kubernetes.pod_name`:<"pod-10"))',
    );
    expect(query).toContain(
      'sort by (_time, `kubernetes.pod_namespace`, `kubernetes.pod_name`, `kubernetes.container_name`, `kubernetes.pod_labels.kudeploy.com/deployment`, _msg) desc limit 101',
    );
  });

  it('adds cursor tuple filters before limiting newer pages', () => {
    const query = buildServiceLogsQuery(
      {
        projectId: 'project-1',
        serviceId: 'service-1',
        workspaceId: 'workspace-1',
      },
      {
        cursorBoundary: {
          cursor: {
            containerName: null,
            deploymentName: null,
            id: 'b'.repeat(64),
            message: '',
            namespace: null,
            podName: 'pod-1',
            streamId: 'stream-1',
            t: '2026-06-08T16:46:23.000000000Z',
          },
          direction: 'newer',
        },
        limit: 101,
        order: 'asc',
      },
    );

    expect(query).toContain(
      '(_time:>"2026-06-08T16:46:23.000000000Z")',
    );
    expect(query).toContain(
      '(_time:="2026-06-08T16:46:23.000000000Z" AND `kubernetes.pod_namespace`:*)',
    );
    expect(query).toContain(
      '(_time:="2026-06-08T16:46:23.000000000Z" AND `kubernetes.pod_namespace`:"" AND `kubernetes.pod_name`:="pod-1" AND `kubernetes.container_name`:*)',
    );
    expect(query).toContain(
      'sort by (_time, `kubernetes.pod_namespace`, `kubernetes.pod_name`, `kubernetes.container_name`, `kubernetes.pod_labels.kudeploy.com/deployment`, _msg) limit 101',
    );
  });

  it('escapes LogsQL string values', () => {
    expect(
      buildServiceLogsQuery({
        projectId: 'project-1',
        serviceId: 'service-"quoted"',
        workspaceId: 'workspace-1',
      }),
    ).toContain(
      '`kubernetes.pod_labels.kudeploy.com/service`:="service-\\"quoted\\""',
    );
  });
});
