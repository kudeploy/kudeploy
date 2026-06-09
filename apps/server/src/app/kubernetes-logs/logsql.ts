const MANAGED_BY_LABEL_VALUE = 'kudeploy';

const LOG_FIELD_MANAGED_BY =
  'kubernetes.pod_labels.app.kubernetes.io/managed-by';
const LOG_FIELD_WORKSPACE_ID =
  'kubernetes.pod_labels.kudeploy.com/workspace-id';
const LOG_FIELD_PROJECT = 'kubernetes.pod_labels.kudeploy.com/project';
const LOG_FIELD_SERVICE = 'kubernetes.pod_labels.kudeploy.com/service';

export const LOG_FIELD_TIME = '_time';
export const LOG_FIELD_STREAM_ID = '_stream_id';
export const LOG_FIELD_MESSAGE = '_msg';
export const LOG_FIELD_LEVEL = 'level';
export const LOG_FIELD_NAMESPACE = 'kubernetes.pod_namespace';
export const LOG_FIELD_POD = 'kubernetes.pod_name';
export const LOG_FIELD_CONTAINER = 'kubernetes.container_name';
export const LOG_FIELD_DEPLOYMENT =
  'kubernetes.pod_labels.kudeploy.com/deployment';

export interface ServiceLogsQueryInput {
  workspaceId: string;
  projectId: string;
  serviceId: string;
}

export interface ServiceLogsQueryOptions {
  limit?: number;
  order?: 'asc' | 'desc';
}

const LOG_FIELDS = [
  LOG_FIELD_TIME,
  LOG_FIELD_STREAM_ID,
  LOG_FIELD_MESSAGE,
  LOG_FIELD_LEVEL,
  LOG_FIELD_NAMESPACE,
  LOG_FIELD_POD,
  LOG_FIELD_CONTAINER,
  LOG_FIELD_DEPLOYMENT,
];

const LOG_SORT_FIELDS = [
  LOG_FIELD_TIME,
  LOG_FIELD_STREAM_ID,
  LOG_FIELD_NAMESPACE,
  LOG_FIELD_POD,
  LOG_FIELD_CONTAINER,
  LOG_FIELD_DEPLOYMENT,
  LOG_FIELD_MESSAGE,
];

export function buildServiceLogsQuery(
  { workspaceId, projectId, serviceId }: ServiceLogsQueryInput,
  options: ServiceLogsQueryOptions = {},
): string {
  const pipes = [
    [
      exactFilter(LOG_FIELD_MANAGED_BY, MANAGED_BY_LABEL_VALUE),
      exactFilter(LOG_FIELD_WORKSPACE_ID, workspaceId),
      exactFilter(LOG_FIELD_PROJECT, projectId),
      exactFilter(LOG_FIELD_SERVICE, serviceId),
    ].join(' AND '),
  ];

  if (options.limit != null) {
    pipes.push(
      `sort by (${LOG_SORT_FIELDS.join(', ')})${options.order === 'desc' ? ' desc' : ''} limit ${options.limit}`,
    );
  }

  pipes.push(`fields ${LOG_FIELDS.join(', ')}`);

  return pipes.join(' | ');
}

function exactFilter(field: string, value: string): string {
  return `${field}:=${logsQlString(value)}`;
}

function logsQlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}
