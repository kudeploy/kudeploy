import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { Activity, RefreshCw } from "lucide-react";
import { t } from "i18next";
import type { ColumnDef } from "@tanstack/react-table";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { graphql } from "@/gql";
import { cn } from "@/lib/utils";

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
  deploymentName?: string | null;
  message: string;
  namespace?: string | null;
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
      fullWidth
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
  entries: ReadonlyArray<LogEntry>;
  loading: boolean;
}) {
  const data = useMemo(() => [...entries], [entries]);
  const columns = useMemo<Array<ColumnDef<LogEntry>>>(
    () => [
      {
        id: "time",
        size: 176,
        header: () => t("service:logs.columns.time"),
        cell: ({ row }) => {
          const timestamp = toTimestamp(row.original.timestamp);

          return (
            <time
              className="text-muted-foreground font-mono tabular-nums"
              dateTime={timestamp}
              title={timestamp}
            >
              {dayjs(row.original.timestamp).format("YYYY-MM-DD HH:mm:ss")}
            </time>
          );
        },
      },
      {
        id: "deployment",
        size: 224,
        header: () => t("service:logs.columns.deployment"),
        cell: ({ row }) => (
          <DeploymentCell
            deployment={row.original.deploymentName ?? "-"}
            index={row.index}
          />
        ),
      },
      {
        id: "message",
        header: () => t("service:logs.columns.message"),
        cell: ({ row }) => (
          <pre className="min-w-0 font-mono break-words whitespace-pre-wrap">
            {row.original.message}
          </pre>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-h-160 overflow-auto">
      <Table className="table-fixed text-xs">
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col
              key={column.id}
              style={
                column.id === "message"
                  ? undefined
                  : { width: column.getSize() }
              }
            />
          ))}
        </colgroup>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "bg-background text-muted-foreground sticky top-0 z-10 h-auto px-4 py-2 text-xs font-medium",
                    header.column.id === "message"
                      ? "whitespace-normal"
                      : "whitespace-nowrap",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                className="bg-muted/50 h-96 text-center text-sm"
                colSpan={columns.length}
              >
                {t("service:logs.loading")}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="group">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "group-hover:bg-muted/50 px-4 py-2 text-xs transition-colors",
                      cell.column.id === "message" && "whitespace-normal",
                      cell.column.id === "deployment" &&
                        "overflow-hidden whitespace-nowrap",
                      cell.column.id === "time" && "whitespace-nowrap",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                className="border-border text-muted-foreground h-96 border-dashed text-center text-sm"
                colSpan={columns.length}
              >
                {t("service:logs.empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DeploymentCell({
  deployment,
  index,
}: {
  deployment: string;
  index: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="text-muted-foreground flex min-h-6 w-full min-w-0 items-center overflow-hidden bg-transparent p-0 text-left font-mono outline-none"
        data-testid={`service-log-deployment-${index}`}
      >
        <span className="block min-w-0 flex-1 truncate">{deployment}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{deployment}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function toTimestamp(value: string | number | Date): string {
  return new Date(value).toISOString();
}
