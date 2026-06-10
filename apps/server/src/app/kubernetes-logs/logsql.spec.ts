import { buildServiceLogsQuery } from './logsql';

describe('logsql', () => {
  it('builds a service log query from kudeploy pod labels', () => {
    expect(
      buildServiceLogsQuery({
        projectId: 'kd-project-1',
        serviceId: 'kd-service-1',
        workspaceId: 'workspace-1',
      }),
    ).toBe(
      '`kubernetes.pod_labels.app.kubernetes.io/managed-by`:="kudeploy" AND `kubernetes.pod_labels.kudeploy.com/workspace-id`:="workspace-1" AND `kubernetes.pod_labels.kudeploy.com/project`:="kd-project-1" AND `kubernetes.pod_labels.kudeploy.com/service`:="kd-service-1" | fields _time, _stream, _stream_id, _msg, level, `kubernetes.pod_namespace`, `kubernetes.pod_name`, `kubernetes.container_name`, `kubernetes.pod_labels.kudeploy.com/deployment`',
    );
  });

  it('adds Grafana-style time sort and limit for paged queries', () => {
    expect(
      buildServiceLogsQuery(
        {
          projectId: 'kd-project-1',
          serviceId: 'kd-service-1',
          workspaceId: 'workspace-1',
        },
        {
          limit: 501,
          order: 'desc',
        },
      ),
    ).toContain(
      'hash(_stream) as kudeploy_stream_hash | hash(_msg) as kudeploy_message_hash | sort by (_time, kudeploy_stream_hash, kudeploy_message_hash, _stream_id) desc limit 501',
    );
  });

  it('adds cursor tuple filters to older page queries', () => {
    const query = buildServiceLogsQuery(
      {
        projectId: 'kd-project-1',
        serviceId: 'kd-service-1',
        workspaceId: 'workspace-1',
      },
      {
        cursor: {
          mh: '20',
          sh: '10',
          sid: 'stream-1',
          t: '2026-06-08T16:46:23.123456789Z',
        },
        limit: 101,
        mode: 'forward',
        order: 'desc',
      },
    );

    expect(query).toContain(
      'filter (_time:<2026-06-08T16:46:23.123456789Z OR (_time:>=2026-06-08T16:46:23.123456789Z AND (kudeploy_stream_hash:<10 OR (kudeploy_stream_hash:=10 AND (kudeploy_message_hash:<20 OR (kudeploy_message_hash:=20 AND _stream_id:<"stream-1"))))))',
    );
    expect(query).toContain(
      'sort by (_time, kudeploy_stream_hash, kudeploy_message_hash, _stream_id) desc limit 101',
    );
  });

  it('adds cursor tuple filters to newer page queries', () => {
    const query = buildServiceLogsQuery(
      {
        projectId: 'kd-project-1',
        serviceId: 'kd-service-1',
        workspaceId: 'workspace-1',
      },
      {
        cursor: {
          mh: '20',
          sh: '10',
          sid: 'stream-1',
          t: '2026-06-08T16:46:23.123456789Z',
        },
        limit: 101,
        mode: 'backward',
        order: 'asc',
      },
    );

    expect(query).toContain(
      'filter (_time:>2026-06-08T16:46:23.123456789Z OR (_time:>=2026-06-08T16:46:23.123456789Z AND (kudeploy_stream_hash:>10 OR (kudeploy_stream_hash:=10 AND (kudeploy_message_hash:>20 OR (kudeploy_message_hash:=20 AND _stream_id:>"stream-1"))))))',
    );
    expect(query).toContain(
      'sort by (_time, kudeploy_stream_hash, kudeploy_message_hash, _stream_id) limit 101',
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
