import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Activity, RefreshCw } from "lucide-react";
import { t } from "i18next";

import { Page } from "@/components/fabric-ui/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { graphql } from "@/gql";

const GET_SERVICE_LOGS_FROM_SERVICE_LOGS_ROUTE = graphql(`
  query getServiceLogsFromServiceLogsRoute(
    $projectId: ID!
    $id: ID!
    $rangeSeconds: Int
    $limit: Int
  ) {
    service(projectId: $projectId, id: $id) {
      id
      logs(rangeSeconds: $rangeSeconds, limit: $limit) {
        available
        rangeSeconds
        limit
        entries {
          timestamp
          message
          namespace
          podName
          containerName
          deploymentName
        }
      }
    }
  }
`);

const RANGE_OPTIONS = [
  {
    key: "one_hour",
    rangeSeconds: 60 * 60,
  },
  {
    key: "three_hours",
    rangeSeconds: 3 * 60 * 60,
  },
  {
    key: "six_hours",
    rangeSeconds: 6 * 60 * 60,
  },
  {
    key: "twelve_hours",
    rangeSeconds: 12 * 60 * 60,
  },
  {
    key: "day",
    rangeSeconds: 24 * 60 * 60,
  },
  {
    key: "three_days",
    rangeSeconds: 3 * 24 * 60 * 60,
  },
  {
    key: "seven_days",
    rangeSeconds: 7 * 24 * 60 * 60,
  },
] as const;

const LIMIT_OPTIONS = [100, 200, 500] as const;
const DEFAULT_RANGE = RANGE_OPTIONS.find(
  (option) => option.key === "one_hour",
)!;
const DEFAULT_LIMIT = 200;

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/logs/",
)({
  component: ServiceLogsComponent,
  beforeLoad: () => ({ title: null }),
});

type LogEntry = {
  containerName?: string | null;
  deploymentName?: string | null;
  message: string;
  namespace?: string | null;
  podName?: string | null;
  timestamp: string | number | Date;
};

function ServiceLogsComponent() {
  const { projectId, serviceId } = Route.useParams();
  const [range, setRange] =
    useState<(typeof RANGE_OPTIONS)[number]>(DEFAULT_RANGE);
  const [limit, setLimit] =
    useState<(typeof LIMIT_OPTIONS)[number]>(DEFAULT_LIMIT);
  const { data, error, loading, refetch } = useQuery(
    GET_SERVICE_LOGS_FROM_SERVICE_LOGS_ROUTE,
    {
      variables: {
        projectId,
        id: serviceId,
        rangeSeconds: range.rangeSeconds,
        limit,
      },
      notifyOnNetworkStatusChange: true,
      pollInterval: 15_000,
    },
  );
  const logs = data?.service?.logs;
  const entries = useMemo(
    () => [...(logs?.entries ?? [])].reverse(),
    [logs?.entries],
  );
  const updatedAt = useMemo(() => new Date(), [logs]);

  return (
    <Page
      title={t("service:tabs.logs")}
      description={t("service:logs.description")}
    >
      <div className="space-y-4" data-testid="service-logs-page">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Activity className="size-4" />
            <span>
              {error
                ? t("service:logs.error")
                : logs?.available
                  ? t("service:logs.updated", {
                      count: logs.entries.length,
                      time: dayjs(updatedAt).format("HH:mm:ss"),
                    })
                  : loading
                    ? t("service:logs.loading")
                    : t("service:logs.unavailable")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              items={RANGE_OPTIONS.map((option) => ({
                label: t(`service:logs.ranges.${option.key}`),
                value: option.key,
              }))}
              value={range.key}
              onValueChange={(value) => {
                const option = RANGE_OPTIONS.find((item) => item.key === value);
                if (option) {
                  setRange(option);
                }
              }}
            >
              <SelectTrigger aria-label={t("service:logs.range")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {t(`service:logs.ranges.${option.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              items={LIMIT_OPTIONS.map((option) => ({
                label: String(option),
                value: String(option),
              }))}
              value={String(limit)}
              onValueChange={(value) => {
                const option = LIMIT_OPTIONS.find(
                  (item) => String(item) === value,
                );
                if (option) {
                  setLimit(option);
                }
              }}
            >
              <SelectTrigger aria-label={t("service:logs.limit")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              aria-label={t("service:logs.refresh")}
              disabled={loading}
              size="icon"
              variant="outline"
              onClick={() => void refetch()}
            >
              <RefreshCw className={loading ? "animate-spin" : undefined} />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">
              {t("service:logs.recent")}
            </CardTitle>
            <CardDescription>
              {t("service:logs.recent_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LogEntries entries={entries} loading={loading && !logs} />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

function LogEntries({
  entries,
  loading,
}: {
  entries: readonly LogEntry[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-muted/50 flex h-96 items-center justify-center text-sm">
        {t("service:logs.loading")}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="border-border text-muted-foreground flex h-96 items-center justify-center border-dashed text-sm">
        {t("service:logs.empty")}
      </div>
    );
  }

  return (
    <div className="max-h-[640px] overflow-auto">
      <div className="min-w-[960px] divide-y">
        {entries.map((entry, index) => (
          <div
            key={`${toTimestamp(entry.timestamp)}-${entry.podName ?? "pod"}-${index}`}
            className="grid grid-cols-[11rem_14rem_14rem_minmax(0,1fr)] gap-3 px-4 py-2 text-xs"
          >
            <time
              className="text-muted-foreground font-mono tabular-nums"
              dateTime={toTimestamp(entry.timestamp)}
            >
              {dayjs(entry.timestamp).format("YYYY-MM-DD HH:mm:ss")}
            </time>
            <div className="text-muted-foreground min-w-0 truncate font-mono">
              {entry.deploymentName ?? "-"}
            </div>
            <div className="text-muted-foreground min-w-0 truncate font-mono">
              {formatRuntime(entry)}
            </div>
            <pre className="min-w-0 font-mono break-words whitespace-pre-wrap">
              {entry.message}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRuntime(entry: LogEntry): string {
  const pod = entry.podName ?? "-";
  const container = entry.containerName;

  return container ? `${pod} / ${container}` : pod;
}

function toTimestamp(value: string | number | Date): string {
  return new Date(value).toISOString();
}
