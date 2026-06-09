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
      'kubernetes.pod_labels.app.kubernetes.io/managed-by:="kudeploy" AND kubernetes.pod_labels.kudeploy.com/workspace-id:="workspace-1" AND kubernetes.pod_labels.kudeploy.com/project:="project-1" AND kubernetes.pod_labels.kudeploy.com/service:="service-1" | fields _time, _msg, kubernetes.pod_namespace, kubernetes.pod_name, kubernetes.container_name, kubernetes.pod_labels.kudeploy.com/deployment',
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
      'kubernetes.pod_labels.kudeploy.com/service:="service-\\"quoted\\""',
    );
  });
});
