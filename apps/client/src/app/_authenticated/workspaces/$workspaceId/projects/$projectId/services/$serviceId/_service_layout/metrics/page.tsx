import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Activity, Cpu, MemoryStick, Network } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { t } from "i18next";
import type { ReactNode } from "react";

import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Empty } from "@/components/thread-ui/empty";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { graphql } from "@/gql";

const GET_SERVICE_METRICS_FROM_SERVICE_METRICS_ROUTE = graphql(`
  query getServiceMetricsFromServiceMetricsRoute(
    $projectId: ID!
    $id: ID!
    $rangeSeconds: Int
    $stepSeconds: Int
  ) {
    service(projectId: $projectId, id: $id) {
      id
      metrics(rangeSeconds: $rangeSeconds, stepSeconds: $stepSeconds) {
        available
        rangeSeconds
        stepSeconds
        cpuLimitMillicores
        memoryLimitBytes
        cpuUsageMillicores {
          timestamp
          value
        }
        memoryUsageBytes {
          timestamp
          value
        }
        networkReceiveBytesPerSecond {
          timestamp
          value
        }
        networkTransmitBytesPerSecond {
          timestamp
          value
        }
      }
    }
  }
`);

const RANGE_OPTIONS = [
  {
    key: "one_hour",
    rangeSeconds: 60 * 60,
    stepSeconds: 2 * 60,
  },
  {
    key: "three_hours",
    rangeSeconds: 3 * 60 * 60,
    stepSeconds: 5 * 60,
  },
  {
    key: "six_hours",
    rangeSeconds: 6 * 60 * 60,
    stepSeconds: 10 * 60,
  },
  {
    key: "twelve_hours",
    rangeSeconds: 12 * 60 * 60,
    stepSeconds: 15 * 60,
  },
  {
    key: "day",
    rangeSeconds: 24 * 60 * 60,
    stepSeconds: 30 * 60,
  },
  {
    key: "three_days",
    rangeSeconds: 3 * 24 * 60 * 60,
    stepSeconds: 2 * 60 * 60,
  },
  {
    key: "seven_days",
    rangeSeconds: 7 * 24 * 60 * 60,
    stepSeconds: 6 * 60 * 60,
  },
] as const;

const DEFAULT_RANGE = RANGE_OPTIONS.find(
  (option) => option.key === "twelve_hours",
)!;

const resourceChartConfig = {
  usage: {
    label: t("service:metrics.usage"),
    color: "var(--chart-1)",
  },
  limit: {
    label: t("service:metrics.limit"),
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const networkChartConfig = {
  receive: {
    label: t("service:metrics.receive"),
    color: "var(--chart-1)",
  },
  transmit: {
    label: t("service:metrics.transmit"),
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/metrics/",
)({
  component: ServiceMetricsComponent,
  beforeLoad: () => ({ title: null }),
});

type MetricPoint = {
  timestamp: string | number | Date;
  value: number;
};

type ChartPoint = {
  timestamp: string;
  limit?: number | null;
  usage?: number | null;
  receive?: number | null;
  transmit?: number | null;
};

function ServiceMetricsComponent() {
  const { projectId, serviceId } = Route.useParams();
  const [range, setRange] =
    useState<(typeof RANGE_OPTIONS)[number]>(DEFAULT_RANGE);
  const { data, error, loading } = useQuery(
    GET_SERVICE_METRICS_FROM_SERVICE_METRICS_ROUTE,
    {
      variables: {
        projectId,
        id: serviceId,
        rangeSeconds: range.rangeSeconds,
        stepSeconds: range.stepSeconds,
      },
      notifyOnNetworkStatusChange: true,
      pollInterval: 30_000,
    },
  );
  const metrics = data?.service?.metrics;
  const updatedAt = useMemo(() => new Date(), [metrics]);
  const cpuData = useMemo(
    () =>
      toResourceChartData(
        metrics?.cpuUsageMillicores ?? [],
        metrics?.cpuLimitMillicores ?? null,
      ),
    [metrics],
  );
  const memoryData = useMemo(
    () =>
      toResourceChartData(
        metrics?.memoryUsageBytes ?? [],
        metrics?.memoryLimitBytes ?? null,
      ),
    [metrics],
  );
  const networkData = useMemo(
    () =>
      mergeChartSeries(
        metrics?.networkReceiveBytesPerSecond ?? [],
        metrics?.networkTransmitBytesPerSecond ?? [],
        "receive",
        "transmit",
      ),
    [metrics],
  );

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("service:tabs.metrics")}</PageTitle>
        <PageDescription>{t("service:metrics.description")}</PageDescription>
      </PageHeader>
      <PageContent>
        <div className="space-y-4" data-testid="service-metrics-page">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Activity className="size-4" />
              <span>
                {error
                  ? t("service:metrics.error")
                  : metrics?.available
                    ? t("service:metrics.updated", {
                        time: dayjs(updatedAt).format("HH:mm:ss"),
                      })
                    : loading
                      ? t("service:metrics.loading")
                      : t("service:metrics.unavailable")}
              </span>
            </div>

            <Select
              items={RANGE_OPTIONS.map((option) => ({
                label: t(`service:metrics.ranges.${option.key}`),
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
              <SelectTrigger aria-label={t("service:metrics.range")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {t(`service:metrics.ranges.${option.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ResourceMetricCard
              data={cpuData}
              empty={t("service:metrics.empty")}
              formatter={formatCpu}
              icon={<Cpu className="size-4" />}
              limit={metrics?.cpuLimitMillicores ?? null}
              loading={loading && !metrics}
              testId="service-cpu-metrics-card"
              title={t("service:metrics.cpu")}
              usage={lastValue(metrics?.cpuUsageMillicores)}
            />

            <ResourceMetricCard
              data={memoryData}
              empty={t("service:metrics.empty")}
              formatter={formatBytes}
              icon={<MemoryStick className="size-4" />}
              limit={metrics?.memoryLimitBytes ?? null}
              loading={loading && !metrics}
              testId="service-memory-metrics-card"
              title={t("service:metrics.memory")}
              usage={lastValue(metrics?.memoryUsageBytes)}
            />

            <NetworkMetricCard
              data={networkData}
              loading={loading && !metrics}
              receive={lastValue(metrics?.networkReceiveBytesPerSecond)}
              transmit={lastValue(metrics?.networkTransmitBytesPerSecond)}
            />
          </div>
        </div>
      </PageContent>
    </Page>
  );
}

function ResourceMetricCard({
  data,
  empty,
  formatter,
  icon,
  limit,
  loading,
  testId,
  title,
  usage,
}: {
  data: Array<ChartPoint>;
  empty: string;
  formatter: (value: number) => string;
  icon: ReactNode;
  limit: number | null;
  loading: boolean;
  testId: string;
  title: string;
  usage: number | null;
}) {
  const percentage =
    usage == null || limit == null || limit <= 0
      ? null
      : Math.min(100, (usage / limit) * 100);

  return (
    <Card data-testid={testId}>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          {limit == null
            ? t("service:metrics.no_limit")
            : t("service:metrics.limit_value", {
                value: formatter(limit),
              })}
        </CardDescription>
        <CardAction className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {usage == null ? "-" : formatter(usage)}
          </div>
          <div className="text-muted-foreground text-xs">
            {percentage == null
              ? t("service:metrics.current")
              : t("service:metrics.used_of_limit", {
                  percent: `${percentage.toFixed(1)}%`,
                })}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageBar percentage={percentage} />
        <MetricLineChart
          config={resourceChartConfig}
          data={data}
          empty={empty}
          formatter={formatter}
          loading={loading}
          series={[
            {
              key: "limit",
              dashed: true,
              label: t("service:metrics.limit"),
            },
            {
              key: "usage",
              label: t("service:metrics.usage"),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function NetworkMetricCard({
  data,
  loading,
  receive,
  transmit,
}: {
  data: Array<ChartPoint>;
  loading: boolean;
  receive: number | null;
  transmit: number | null;
}) {
  return (
    <Card className="lg:col-span-2" data-testid="service-network-metrics-card">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="size-4" />
          {t("service:metrics.network")}
        </CardTitle>
        <CardDescription>
          {t("service:metrics.network_description")}
        </CardDescription>
        <CardAction className="grid grid-cols-2 gap-6 text-right">
          <div>
            <div className="text-2xl font-semibold tabular-nums">
              {receive == null ? "-" : formatBytesPerSecond(receive)}
            </div>
            <div className="text-muted-foreground text-xs">
              {t("service:metrics.receive")}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums">
              {transmit == null ? "-" : formatBytesPerSecond(transmit)}
            </div>
            <div className="text-muted-foreground text-xs">
              {t("service:metrics.transmit")}
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <MetricLineChart
          config={networkChartConfig}
          data={data}
          empty={t("service:metrics.empty")}
          formatter={formatBytesPerSecond}
          loading={loading}
          series={[
            {
              key: "receive",
              label: t("service:metrics.receive"),
            },
            {
              key: "transmit",
              label: t("service:metrics.transmit"),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function UsageBar({ percentage }: { percentage: number | null }) {
  return (
    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
      <div
        className="bg-primary h-full transition-all"
        style={{ width: `${percentage ?? 0}%` }}
      />
    </div>
  );
}

function MetricLineChart({
  config,
  data,
  empty,
  formatter,
  loading,
  series,
}: {
  config: ChartConfig;
  data: Array<ChartPoint>;
  empty: string;
  formatter: (value: number) => string;
  loading: boolean;
  series: Array<{
    dashed?: boolean;
    key: keyof ChartPoint;
    label: string;
  }>;
}) {
  if (loading) {
    return (
      <div className="bg-muted/50 flex h-56 items-center justify-center rounded-md text-sm">
        {t("service:metrics.loading")}
      </div>
    );
  }

  if (!data.length) {
    return (
      <Empty
        className="h-56 rounded-md border border-dashed p-4"
        title={empty}
      />
    );
  }

  return (
    <ChartContainer className="h-56 w-full" config={config}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ bottom: 0, left: 0, right: 12, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="timestamp"
          minTickGap={24}
          tickFormatter={(value) => dayjs(value).format("HH:mm")}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => formatter(Number(value))}
          tickLine={false}
          tickMargin={8}
          width={56}
        />
        <ChartTooltip
          content={
            <MetricTooltip formatter={formatter} seriesLabels={series} />
          }
        />
        {series.map((item) => (
          <Line
            key={item.key}
            connectNulls
            dataKey={item.key}
            dot={false}
            stroke={`var(--color-${item.key})`}
            strokeDasharray={item.dashed ? "4 4" : undefined}
            strokeWidth={2}
            type="monotone"
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

function MetricTooltip({
  active,
  formatter,
  label,
  payload,
  seriesLabels,
}: {
  active?: boolean;
  formatter: (value: number) => string;
  label?: string | number;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    value?: unknown;
  }>;
  seriesLabels: Array<{
    key: keyof ChartPoint;
    label: string;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="border-border/50 bg-background min-w-36 rounded-md border px-3 py-2 text-xs shadow-xl">
      <div className="mb-2 font-medium">
        {dayjs(label).format("YYYY-MM-DD HH:mm")}
      </div>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const key = String(item.dataKey);
          const label =
            seriesLabels.find((series) => series.key === key)?.label ?? key;
          const value = Number(item.value);

          if (!Number.isFinite(value)) {
            return null;
          }

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {label}
              </span>
              <span className="font-mono tabular-nums">{formatter(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function toResourceChartData(
  points: ReadonlyArray<MetricPoint>,
  limit: number | null,
): Array<ChartPoint> {
  return points.map((point) => ({
    timestamp: toTimestamp(point.timestamp),
    usage: point.value,
    limit,
  }));
}

function mergeChartSeries(
  left: ReadonlyArray<MetricPoint>,
  right: ReadonlyArray<MetricPoint>,
  leftKey: "receive",
  rightKey: "transmit",
): Array<ChartPoint> {
  const values = new Map<string, ChartPoint>();

  for (const point of left) {
    const timestamp = toTimestamp(point.timestamp);
    values.set(timestamp, {
      ...(values.get(timestamp) ?? { timestamp }),
      [leftKey]: point.value,
    });
  }

  for (const point of right) {
    const timestamp = toTimestamp(point.timestamp);
    values.set(timestamp, {
      ...(values.get(timestamp) ?? { timestamp }),
      [rightKey]: point.value,
    });
  }

  return Array.from(values.values()).sort((leftValue, rightValue) =>
    leftValue.timestamp.localeCompare(rightValue.timestamp),
  );
}

function lastValue(points?: ReadonlyArray<MetricPoint> | null): number | null {
  return points?.at(-1)?.value ?? null;
}

function toTimestamp(value: string | number | Date): string {
  return new Date(value).toISOString();
}

function formatCpu(value: number): string {
  if (Math.abs(value) < 1000) {
    return `${value.toFixed(value < 10 ? 1 : 0)}m`;
  }

  return `${trimFraction(value / 1000)} cores`;
}

function formatBytesPerSecond(value: number): string {
  return `${formatBytes(value)}/s`;
}

function formatBytes(value: number): string {
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let scaled = Math.abs(value);
  let unitIndex = 0;

  while (scaled >= 1024 && unitIndex < units.length - 1) {
    scaled /= 1024;
    unitIndex += 1;
  }

  return `${value < 0 ? "-" : ""}${trimFraction(scaled)} ${units[unitIndex]}`;
}

function trimFraction(value: number): string {
  return value.toFixed(value >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}
