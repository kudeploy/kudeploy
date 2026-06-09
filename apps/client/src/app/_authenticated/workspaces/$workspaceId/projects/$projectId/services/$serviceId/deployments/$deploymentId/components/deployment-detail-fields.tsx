import type { ReactNode } from "react";
import { t } from "i18next";

import { Badge } from "@/components/fabric-ui/badge";
import type { DeploymentStatus } from "@/gql/graphql";

const statusColors = {
  FAILED: "red",
  PENDING: "slate",
  PROGRESSING: "amber",
  READY: "green",
  UNKNOWN: "gray",
} as const;

export function DeploymentField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
}

export function DeploymentSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="min-w-0 space-y-3">
      <h3 className="text-muted-foreground text-xs font-medium uppercase">
        {title}
      </h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function DeploymentStatusBadge({
  status,
}: {
  status: DeploymentStatus;
}) {
  return (
    <Badge color={statusColors[status]}>{t(`service:status.${status}`)}</Badge>
  );
}

export function DeploymentValueList({ values }: { values: string[] }) {
  if (!values.length) {
    return <>{t("service:deployments.not_configured")}</>;
  }

  return (
    <div className="space-y-1">
      {values.map((value) => (
        <div key={value} className="break-all">
          {value}
        </div>
      ))}
    </div>
  );
}

export function formatCommand(values: readonly string[]) {
  return values.length
    ? values.join(" ")
    : t("service:deployments.not_configured");
}

export function formatPorts(deployment: {
  ports: ReadonlyArray<{
    port: number;
    targetPort?: number | null;
  }>;
}) {
  return deployment.ports.map((port) =>
    port.targetPort ? `${port.port} -> ${port.targetPort}` : String(port.port),
  );
}

export function formatResource(value?: string | null) {
  return value ?? t("service:deployments.not_configured");
}

export function formatEnv(deployment: {
  env: ReadonlyArray<{
    name: string;
    value?: string | null;
  }>;
}) {
  return deployment.env.map((env) =>
    env.value === null || env.value === undefined
      ? env.name
      : `${env.name}=${env.value}`,
  );
}

export function formatEnvFrom(deployment: {
  envFrom: ReadonlyArray<{
    kind: string;
    name: string;
    prefix?: string | null;
  }>;
}) {
  return deployment.envFrom.map((source) => {
    const prefix = source.prefix ? ` (${source.prefix})` : "";

    return `${source.kind}: ${source.name}${prefix}`;
  });
}
