import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import { Activity, RefreshCw } from "lucide-react";
import { t } from "i18next";
import type { RefObject } from "react";

import type { GetServiceLogsFromServiceLogsRouteQuery } from "@/gql/graphql";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { graphql } from "@/gql";
import { cn } from "@/lib/utils";

const LOG_PAGE_SIZE = 1000;
const LOAD_OLDER_THRESHOLD_PX = 48;
const LOG_ROW_LAYOUT = "flex min-w-full";
const LOG_TIME_COLUMN = "w-44 shrink-0";
const LOG_DEPLOYMENT_COLUMN = "w-20 shrink-0";
const LOG_LEVEL_COLUMN = "w-20 shrink-0";
const LOG_MESSAGE_COLUMN = "min-w-0 flex-1";

const GET_SERVICE_LOGS_FROM_SERVICE_LOGS_ROUTE = graphql(`
  query getServiceLogsFromServiceLogsRoute(
    $projectId: ID!
    $id: ID!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    service(projectId: $projectId, id: $id) {
      id
      logs(first: $first, after: $after, last: $last, before: $before) {
        available
        edges {
          cursor
          node {
            id
            timestamp
            level
            message
            namespace
            deploymentName
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/logs/",
)({
  component: ServiceLogsComponent,
  beforeLoad: () => ({ title: null }),
});

type LogsConnection = NonNullable<
  NonNullable<GetServiceLogsFromServiceLogsRouteQuery["service"]>["logs"]
>;
type LogEdge = LogsConnection["edges"][number];
type LogsPageInfo = LogsConnection["pageInfo"];

function ServiceLogsComponent() {
  const { projectId, serviceId } = Route.useParams();
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const pageInfoRef = useRef<LogsPageInfo | null>(null);
  const initializedRef = useRef(false);
  const isLoadingOlderRef = useRef(false);
  const [available, setAvailable] = useState(true);
  const [edges, setEdges] = useState<Array<LogEdge>>([]);
  const [failed, setFailed] = useState(false);
  const [pageInfo, setPageInfo] = useState<LogsPageInfo | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const { data, error, fetchMore, loading, refetch } = useQuery(
    GET_SERVICE_LOGS_FROM_SERVICE_LOGS_ROUTE,
    {
      variables: {
        projectId,
        id: serviceId,
        first: LOG_PAGE_SIZE,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    initializedRef.current = false;
    pageInfoRef.current = null;
    isLoadingOlderRef.current = false;
    setAvailable(true);
    setEdges([]);
    setFailed(false);
    setPageInfo(null);
    setUpdatedAt(null);
    setIsLoadingOlder(false);
  }, [projectId, serviceId]);

  useEffect(() => {
    pageInfoRef.current = pageInfo;
  }, [pageInfo]);

  const scrollToLatest = useCallback(() => {
    const element = scrollParentRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = 0;
  }, []);

  const replaceConnection = useCallback(
    (connection: LogsConnection | null | undefined, shouldScroll = false) => {
      if (!connection) {
        return;
      }

      setAvailable(connection.available);
      setEdges(connection.edges);
      setFailed(false);
      setPageInfo(connection.pageInfo);
      setUpdatedAt(new Date());

      if (shouldScroll) {
        requestAnimationFrame(scrollToLatest);
      }
    },
    [scrollToLatest],
  );

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const connection = data?.service?.logs;
    if (!connection) {
      return;
    }

    initializedRef.current = true;
    replaceConnection(connection, true);
  }, [data?.service?.logs, replaceConnection]);

  const loadOlder = useCallback(async () => {
    const currentPageInfo = pageInfoRef.current;

    if (
      isLoadingOlderRef.current ||
      !currentPageInfo?.hasNextPage ||
      !currentPageInfo.endCursor
    ) {
      return;
    }

    isLoadingOlderRef.current = true;
    setIsLoadingOlder(true);

    try {
      const result = await fetchMore({
        variables: {
          projectId,
          id: serviceId,
          first: LOG_PAGE_SIZE,
          after: currentPageInfo.endCursor,
        },
      });
      const connection = result.data?.service?.logs;

      if (!connection) {
        return;
      }

      setAvailable(connection.available);
      setFailed(false);
      setEdges((currentEdges) => mergeEdges(currentEdges, connection.edges));
      setPageInfo((current) =>
        mergePageInfoForOlder(current, connection.pageInfo),
      );
      setUpdatedAt(new Date());
    } catch {
      setFailed(true);
    } finally {
      isLoadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [fetchMore, projectId, serviceId]);

  const handleScroll = useCallback(() => {
    const element = scrollParentRef.current;
    if (!element) {
      return;
    }

    if (isNearBottom(element)) {
      void loadOlder();
    }
  }, [loadOlder]);

  const refreshLogs = useCallback(async () => {
    try {
      const result = await refetch({
        projectId,
        id: serviceId,
        first: LOG_PAGE_SIZE,
        after: undefined,
        before: undefined,
        last: undefined,
      });

      initializedRef.current = true;
      replaceConnection(result.data?.service?.logs, true);
    } catch {
      setFailed(true);
    }
  }, [projectId, refetch, replaceConnection, serviceId]);

  const statusText = getStatusText({
    available,
    count: edges.length,
    error: failed || Boolean(error),
    loading: loading && !edges.length,
    updatedAt,
  });
  return (
    <section
      className="flex h-[calc(100dvh-7rem)] min-h-0 flex-col"
      data-testid="service-logs-page"
    >
      <div className="flex shrink-0 flex-col gap-2 border-b px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <Activity className="size-4 shrink-0" />
          <span>{statusText}</span>
          {isLoadingOlder ? (
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <Spinner />
              {t("service:logs.loading_older")}
            </span>
          ) : null}
        </div>

        <Button
          aria-label={t("service:logs.refresh")}
          className="shrink-0 self-start sm:self-auto"
          disabled={loading || isLoadingOlder}
          size="icon"
          variant="outline"
          onClick={() => void refreshLogs()}
        >
          <RefreshCw
            className={loading || isLoadingOlder ? "animate-spin" : undefined}
          />
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <LogEntries
          entries={edges}
          loadingOlder={isLoadingOlder}
          loading={loading && !edges.length}
          onScroll={handleScroll}
          serviceId={serviceId}
          scrollParentRef={scrollParentRef}
        />
      </div>
    </section>
  );
}

function LogEntries({
  entries,
  loading,
  loadingOlder,
  onScroll,
  serviceId,
  scrollParentRef,
}: {
  entries: ReadonlyArray<LogEdge>;
  loading: boolean;
  loadingOlder: boolean;
  onScroll: () => void;
  serviceId: string;
  scrollParentRef: RefObject<HTMLDivElement | null>;
}) {
  const rowVirtualizer = useVirtualizer({
    count: entries.length,
    estimateSize: () => 40,
    getScrollElement: () => scrollParentRef.current,
    overscan: 20,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={scrollParentRef}
      className="h-full min-h-0 overflow-auto overscroll-contain"
      onScroll={onScroll}
    >
      <div className="grid min-w-0 text-xs" role="table">
        <div
          className="bg-background sticky top-0 z-20 border-b"
          role="rowgroup"
        >
          <div className={LOG_ROW_LAYOUT} role="row">
            <div
              className={cn(
                "text-muted-foreground px-4 py-2 text-xs font-medium whitespace-nowrap",
                LOG_TIME_COLUMN,
              )}
              role="columnheader"
            >
              {t("service:logs.columns.time")}
            </div>
            <div
              className={cn(
                "text-muted-foreground px-4 py-2 text-xs font-medium whitespace-nowrap",
                LOG_DEPLOYMENT_COLUMN,
              )}
              role="columnheader"
            >
              {t("service:logs.columns.deployment")}
            </div>
            <div
              className={cn(
                "text-muted-foreground px-4 py-2 text-xs font-medium whitespace-nowrap",
                LOG_LEVEL_COLUMN,
              )}
              role="columnheader"
            >
              {t("service:logs.columns.level")}
            </div>
            <div
              className={cn(
                "text-muted-foreground px-4 py-2 text-xs font-medium whitespace-normal",
                LOG_MESSAGE_COLUMN,
              )}
              role="columnheader"
            >
              {t("service:logs.columns.message")}
            </div>
          </div>
        </div>
        <div data-elastic-offset={0} data-testid="service-logs-elastic-content">
          {loading ? (
            <LogLoadingRow label={t("service:logs.loading")} className="h-96" />
          ) : entries.length ? (
            <>
              <div
                className="relative grid"
                role="rowgroup"
                style={{ height: rowVirtualizer.getTotalSize() }}
              >
                {virtualRows.map((virtualRow) => {
                  const edge = entries[virtualRow.index];
                  const timestamp = toTimestamp(edge.node.timestamp);

                  return (
                    <div
                      key={edge.node.id}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      className={cn(
                        "group absolute w-full border-b transition-colors",
                        LOG_ROW_LAYOUT,
                      )}
                      data-index={virtualRow.index}
                      role="row"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div
                        className={cn(
                          "group-hover:bg-muted/50 px-4 py-2 text-xs whitespace-nowrap transition-colors",
                          LOG_TIME_COLUMN,
                        )}
                        role="cell"
                      >
                        <time
                          className="text-muted-foreground font-mono tabular-nums"
                          dateTime={timestamp}
                          title={timestamp}
                        >
                          {dayjs(edge.node.timestamp).format(
                            "YYYY-MM-DD HH:mm:ss",
                          )}
                        </time>
                      </div>
                      <div
                        className={cn(
                          "group-hover:bg-muted/50 overflow-hidden px-4 py-2 text-xs whitespace-nowrap transition-colors",
                          LOG_DEPLOYMENT_COLUMN,
                        )}
                        role="cell"
                      >
                        <DeploymentCell
                          deployment={edge.node.deploymentName ?? "-"}
                          serviceId={serviceId}
                        />
                      </div>
                      <div
                        className={cn(
                          "group-hover:bg-muted/50 px-4 py-2 text-xs whitespace-nowrap transition-colors",
                          LOG_LEVEL_COLUMN,
                        )}
                        role="cell"
                      >
                        <LogLevelCell level={edge.node.level} />
                      </div>
                      <div
                        className={cn(
                          "group-hover:bg-muted/50 px-4 py-2 text-xs whitespace-normal transition-colors",
                          LOG_MESSAGE_COLUMN,
                        )}
                        role="cell"
                      >
                        <pre className="min-w-0 font-mono break-words whitespace-pre-wrap">
                          {edge.node.message}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
              {loadingOlder ? (
                <LogLoadingRow label={t("service:logs.loading_older")} />
              ) : null}
            </>
          ) : (
            <div role="rowgroup">
              <div className={LOG_ROW_LAYOUT} role="row">
                <div
                  className="border-border text-muted-foreground flex h-96 flex-1 items-center justify-center border-dashed text-center text-sm"
                  role="cell"
                >
                  {t("service:logs.empty")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogLoadingRow({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  return (
    <div role="rowgroup">
      <div className={LOG_ROW_LAYOUT} role="row">
        <div
          className={cn(
            "text-muted-foreground flex flex-1 items-center justify-center gap-2 py-3 text-sm",
            className,
          )}
          role="cell"
        >
          <Spinner />
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

function LogLevelCell({ level }: { level?: string | null }) {
  const label = level?.trim() || "-";

  return (
    <span className={cn("font-mono", getLogLevelClass(label))}>{label}</span>
  );
}

function DeploymentCell({
  deployment,
  serviceId,
}: {
  deployment: string;
  serviceId: string;
}) {
  const label = formatDeploymentName(deployment, serviceId);

  return (
    <span className="text-muted-foreground block min-w-0 truncate font-mono">
      {label}
    </span>
  );
}

function formatDeploymentName(deployment: string, serviceId: string): string {
  const prefix = `${serviceId}-`;

  return deployment.startsWith(prefix)
    ? deployment.slice(prefix.length)
    : deployment;
}

function getLogLevelClass(level: string): string {
  switch (level.toUpperCase()) {
    case "ERROR":
    case "FATAL":
    case "PANIC":
    case "CRITICAL":
      return "text-destructive";
    case "WARN":
    case "WARNING":
      return "text-amber-600 dark:text-amber-400";
    case "INFO":
    case "NOTICE":
      return "text-sky-600 dark:text-sky-400";
    default:
      return "text-muted-foreground";
  }
}

function mergeEdges(
  firstEdges: ReadonlyArray<LogEdge>,
  secondEdges: ReadonlyArray<LogEdge>,
): Array<LogEdge> {
  const edgesById = new Map<string, LogEdge>();

  for (const edge of [...firstEdges, ...secondEdges]) {
    edgesById.set(edge.node.id, edge);
  }

  return [...edgesById.values()];
}

function mergePageInfoForOlder(
  current: LogsPageInfo | null,
  older: LogsPageInfo,
): LogsPageInfo {
  return {
    endCursor: older.endCursor ?? current?.endCursor ?? null,
    hasNextPage: older.hasNextPage,
    hasPreviousPage: current?.hasPreviousPage ?? older.hasPreviousPage,
    startCursor: current?.startCursor ?? older.startCursor ?? null,
  };
}

function getStatusText({
  available,
  count,
  error,
  loading,
  updatedAt,
}: {
  available: boolean;
  count: number;
  error: boolean;
  loading: boolean;
  updatedAt: Date | null;
}) {
  if (error) {
    return t("service:logs.error");
  }

  if (!available) {
    return t("service:logs.unavailable");
  }

  if (loading || !updatedAt) {
    return t("service:logs.loading");
  }

  return t("service:logs.updated", {
    count,
    time: dayjs(updatedAt).format("HH:mm:ss"),
  });
}

function isNearBottom(element: HTMLElement): boolean {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    LOAD_OLDER_THRESHOLD_PX
  );
}

function toTimestamp(value: string | number | Date): string {
  return new Date(value).toISOString();
}
