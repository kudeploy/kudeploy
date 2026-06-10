const MANAGED_BY_LABEL_VALUE = 'kudeploy';

const LOG_FIELD_MANAGED_BY =
  'kubernetes.pod_labels.app.kubernetes.io/managed-by';
const LOG_FIELD_WORKSPACE_ID =
  'kubernetes.pod_labels.kudeploy.com/workspace-id';
const LOG_FIELD_PROJECT = 'kubernetes.pod_labels.kudeploy.com/project';
const LOG_FIELD_SERVICE = 'kubernetes.pod_labels.kudeploy.com/service';

export const LOG_FIELD_TIME = '_time';
export const LOG_FIELD_STREAM = '_stream';
export const LOG_FIELD_STREAM_ID = '_stream_id';
export const LOG_FIELD_MESSAGE = '_msg';
export const LOG_FIELD_STREAM_HASH = 'kudeploy_stream_hash';
export const LOG_FIELD_MESSAGE_HASH = 'kudeploy_message_hash';
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
  cursor?: ServiceLogsQueryCursor | null;
  limit?: number;
  mode?: 'backward' | 'forward';
  order?: 'asc' | 'desc';
}

interface ServiceLogsQueryCursor {
  mh: string;
  sh: string;
  sid: string;
  t: string;
}

const LOG_BASE_FIELDS = [
  LOG_FIELD_TIME,
  LOG_FIELD_STREAM,
  LOG_FIELD_STREAM_ID,
  LOG_FIELD_MESSAGE,
  LOG_FIELD_LEVEL,
  LOG_FIELD_NAMESPACE,
  LOG_FIELD_POD,
  LOG_FIELD_CONTAINER,
  LOG_FIELD_DEPLOYMENT,
];

const LOG_GENERATED_FIELDS = [LOG_FIELD_STREAM_HASH, LOG_FIELD_MESSAGE_HASH];

const LOG_SORT_FIELDS = [
  LOG_FIELD_TIME,
  LOG_FIELD_STREAM_HASH,
  LOG_FIELD_MESSAGE_HASH,
  LOG_FIELD_STREAM_ID,
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
    ]
      .filter((filter): filter is string => Boolean(filter))
      .join(' AND '),
  ];

  if (options.limit != null) {
    pipes.push(
      `hash(${logsQlField(LOG_FIELD_STREAM)}) as ${logsQlField(LOG_FIELD_STREAM_HASH)}`,
      `hash(${logsQlField(LOG_FIELD_MESSAGE)}) as ${logsQlField(LOG_FIELD_MESSAGE_HASH)}`,
    );
    const cursorFilter = cursorTupleFilter(options.cursor, options.mode);
    if (cursorFilter) {
      pipes.push(`filter ${cursorFilter}`);
    }
    pipes.push(
      `sort by (${LOG_SORT_FIELDS.map(logsQlField).join(', ')})${options.order === 'desc' ? ' desc' : ''} limit ${options.limit}`,
    );
  }

  const fields =
    options.limit != null
      ? [...LOG_BASE_FIELDS, ...LOG_GENERATED_FIELDS]
      : LOG_BASE_FIELDS;

  pipes.push(`fields ${fields.map(logsQlField).join(', ')}`);

  return pipes.join(' | ');
}

function exactFilter(field: string, value: string): string {
  return `${logsQlField(field)}:=${logsQlString(value)}`;
}

function cursorTupleFilter(
  cursor: ServiceLogsQueryCursor | null | undefined,
  mode: ServiceLogsQueryOptions['mode'],
): string | null {
  if (!cursor || !mode) {
    return null;
  }

  const messageHash = logsQlInteger(cursor.mh);
  const streamHash = logsQlInteger(cursor.sh);
  if (!messageHash || !streamHash || !isSafeLogTime(cursor.t)) {
    return null;
  }

  const direction = mode === 'forward' ? '<' : '>';
  const timeFilter =
    mode === 'forward'
      ? `${logsQlField(LOG_FIELD_TIME)}:<${cursor.t}`
      : `${logsQlField(LOG_FIELD_TIME)}:>${cursor.t}`;

  return `(${timeFilter} OR (${logsQlField(LOG_FIELD_TIME)}:>=${cursor.t} AND (${cursorSortTupleFilter({ direction, messageHash, streamHash, streamId: cursor.sid })})))`;
}

function cursorSortTupleFilter({
  direction,
  messageHash,
  streamHash,
  streamId,
}: {
  direction: '<' | '>';
  messageHash: string;
  streamHash: string;
  streamId: string;
}): string {
  const streamHashField = logsQlField(LOG_FIELD_STREAM_HASH);
  const messageHashField = logsQlField(LOG_FIELD_MESSAGE_HASH);
  const streamIdField = logsQlField(LOG_FIELD_STREAM_ID);

  return `${streamHashField}:${direction}${streamHash} OR (${streamHashField}:=${streamHash} AND (${messageHashField}:${direction}${messageHash} OR (${messageHashField}:=${messageHash} AND ${streamIdField}:${direction}${logsQlString(streamId)})))`;
}

function logsQlInteger(value: string): string | null {
  return /^-?\d+$/.test(value) ? value : null;
}

function isSafeLogTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(
    value,
  );
}

function logsQlField(field: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(field)) {
    return field;
  }

  return `\`${field.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\``;
}

function logsQlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}
