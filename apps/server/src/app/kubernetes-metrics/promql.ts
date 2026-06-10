export const MANAGED_BY_LABEL = 'app.kubernetes.io/managed-by';
export const MANAGED_BY_LABEL_VALUE = 'kudeploy';
export const DEPLOYMENT_LABEL = 'kudeploy.com/deployment';
export const PROJECT_LABEL = 'kudeploy.com/project';
export const SERVICE_LABEL = 'kudeploy.com/service';
export const WORKSPACE_LABEL = 'kudeploy.com/workspace';

export interface ServicePodSelectorInput {
  deploymentName?: string | null;
  workspaceId: string;
  projectId: string;
  serviceId: string;
}

export function buildServicePodLabelSelector({
  deploymentName,
  workspaceId,
  projectId,
  serviceId,
}: ServicePodSelectorInput): string {
  return [
    `${MANAGED_BY_LABEL}=${MANAGED_BY_LABEL_VALUE}`,
    `${WORKSPACE_LABEL}=${workspaceId}`,
    `${PROJECT_LABEL}=${projectId}`,
    `${SERVICE_LABEL}=${serviceId}`,
    ...(deploymentName ? [`${DEPLOYMENT_LABEL}=${deploymentName}`] : []),
  ].join(',');
}

export function buildPodNameRegexMatcher(
  namespace: string,
  podNames: string[],
): string {
  return [
    `namespace=${prometheusString(namespace)}`,
    `pod=~${prometheusString(`^(${podNames.map(escapeRegex).join('|')})$`)}`,
  ].join(',');
}

export function serviceCpuUsageQuery(podMatcher: string): string {
  return `sum(rate(container_cpu_usage_seconds_total{${podMatcher},container!="",image!=""}[5m]))`;
}

export function serviceMemoryUsageQuery(podMatcher: string): string {
  return `sum(container_memory_working_set_bytes{${podMatcher},container!="",image!=""})`;
}

export function serviceNetworkReceiveQuery(podMatcher: string): string {
  return `sum(rate(container_network_receive_bytes_total{${podMatcher}}[5m]))`;
}

export function serviceNetworkTransmitQuery(podMatcher: string): string {
  return `sum(rate(container_network_transmit_bytes_total{${podMatcher}}[5m]))`;
}

function prometheusString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

function escapeRegex(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}
