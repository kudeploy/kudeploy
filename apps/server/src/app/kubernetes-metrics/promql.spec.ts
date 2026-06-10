import {
  buildPodNameRegexMatcher,
  buildServicePodLabelSelector,
  serviceCpuUsageQuery,
  serviceMemoryUsageQuery,
  serviceNetworkReceiveQuery,
  serviceNetworkTransmitQuery,
} from './promql';

describe('kubernetes metrics PromQL helpers', () => {
  it('builds the kudeploy service pod label selector', () => {
    expect(
      buildServicePodLabelSelector({
        workspaceId: 'workspace_1',
        projectId: 'kd-project-1',
        serviceId: 'kd-service-1',
      }),
    ).toBe(
      'app.kubernetes.io/managed-by=kudeploy,kudeploy.com/workspace-id=workspace_1,kudeploy.com/project=kd-project-1,kudeploy.com/service=kd-service-1',
    );
  });

  it('escapes pod names for Prometheus regex matchers', () => {
    expect(
      buildPodNameRegexMatcher('project"one', [
        'service.1-abc',
        'service(2)-def',
      ]),
    ).toBe(
      'namespace="project\\"one",pod=~"^(service\\\\.1-abc|service\\\\(2\\\\)-def)$"',
    );
  });

  it('builds service metric queries from a pod matcher', () => {
    const matcher = 'namespace="project-1",pod=~"^(pod-1)$"';

    expect(serviceCpuUsageQuery(matcher)).toBe(
      'sum(rate(container_cpu_usage_seconds_total{namespace="project-1",pod=~"^(pod-1)$",container!="",image!=""}[5m]))',
    );
    expect(serviceMemoryUsageQuery(matcher)).toBe(
      'sum(container_memory_working_set_bytes{namespace="project-1",pod=~"^(pod-1)$",container!="",image!=""})',
    );
    expect(serviceNetworkReceiveQuery(matcher)).toBe(
      'sum(rate(container_network_receive_bytes_total{namespace="project-1",pod=~"^(pod-1)$"}[5m]))',
    );
    expect(serviceNetworkTransmitQuery(matcher)).toBe(
      'sum(rate(container_network_transmit_bytes_total{namespace="project-1",pod=~"^(pod-1)$"}[5m]))',
    );
  });
});
