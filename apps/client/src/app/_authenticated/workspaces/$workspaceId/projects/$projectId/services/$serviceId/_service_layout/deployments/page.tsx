import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowRight, GitBranch, Layers3 } from "lucide-react";
import { t } from "i18next";
import type { ReactNode } from "react";

import type {
  DeploymentStatus,
  GetServiceDeploymentsFromServiceDeploymentsRouteQuery,
} from "@/gql/graphql";
import { Badge } from "@/components/fabric-ui/badge";
import { Page } from "@/components/fabric-ui/page";
import { Link } from "@/components/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";
import { DeploymentOrderField } from "@/gql/graphql";
import { OrderDirection } from "@/lib/connection-search";

const GET_SERVICE_DEPLOYMENTS_FROM_SERVICE_DEPLOYMENTS_ROUTE = graphql(`
  query getServiceDeploymentsFromServiceDeploymentsRoute(
    $projectId: ID!
    $serviceId: ID!
    $first: Int
    $orderBy: DeploymentOrder
  ) {
    deployments(
      projectId: $projectId
      serviceId: $serviceId
      first: $first
      orderBy: $orderBy
    ) {
      totalCount
      edges {
        node {
          id
          projectId
          serviceId
          version
          image
          replicas
          status
          active
          latest
          kubernetesDeploymentName
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/deployments/",
)({
  component: ServiceDeploymentsComponent,
  beforeLoad: () => ({ title: null }),
});

type DeploymentRow =
  GetServiceDeploymentsFromServiceDeploymentsRouteQuery["deployments"]["edges"][number]["node"];

const statusColors = {
  FAILED: "red",
  PENDING: "slate",
  PROGRESSING: "amber",
  READY: "green",
  UNKNOWN: "gray",
} as const;

function ServiceDeploymentsComponent() {
  const { workspaceId, projectId, serviceId } = Route.useParams();
  const { data, error, loading } = useQuery(
    GET_SERVICE_DEPLOYMENTS_FROM_SERVICE_DEPLOYMENTS_ROUTE,
    {
      variables: {
        projectId,
        serviceId,
        first: 20,
        orderBy: {
          field: DeploymentOrderField.VERSION,
          direction: OrderDirection.DESC,
        },
      },
      fetchPolicy: "cache-and-network",
      pollInterval: 15_000,
    },
  );
  const deployments = useMemo(
    () => data?.deployments.edges.map((edge) => edge.node) ?? [],
    [data],
  );

  return (
    <Page
      title={t("service:tabs.deployments")}
      description={t("service:deployments.description")}
    >
      <div className="space-y-4" data-testid="service-deployments-page">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Layers3 className="size-4" />
          <span>
            {error
              ? t("service:deployments.error")
              : loading && !data
                ? t("service:deployments.loading")
                : t("service:deployments.summary", {
                    count: data?.deployments.totalCount ?? 0,
                  })}
          </span>
        </div>

        {deployments.length ? (
          <div className="space-y-3">
            {deployments.map((deployment) => (
              <DeploymentCard
                key={deployment.id}
                deployment={deployment}
                projectId={projectId}
                serviceId={serviceId}
                workspaceId={workspaceId}
              />
            ))}
          </div>
        ) : (
          <Card data-testid="service-deployments-empty">
            <CardHeader>
              <CardTitle>{t("service:deployments.empty.title")}</CardTitle>
              <CardDescription>
                {t("service:deployments.empty.description")}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </Page>
  );
}

function DeploymentCard({
  deployment,
  projectId,
  serviceId,
  workspaceId,
}: {
  deployment: DeploymentRow;
  projectId: string;
  serviceId: string;
  workspaceId: string;
}) {
  return (
    <Link
      className="focus-visible:ring-ring block rounded-xl outline-hidden focus-visible:ring-2"
      data-testid={`service-deployment-row-${deployment.id}`}
      params={{
        workspaceId,
        projectId,
        serviceId,
        deploymentId: deployment.id,
      }}
      to="/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments/$deploymentId"
    >
      <Card className="hover:bg-muted/30 transition-colors" size="sm">
        <CardHeader className="border-b">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
            <GitBranch className="size-4" />
            <span>
              {t("service:deployments.version", {
                version: deployment.version,
              })}
            </span>
            {deployment.active ? (
              <Badge
                color="green"
                data-testid={`service-deployment-active-${deployment.id}`}
              >
                {t("service:deployments.active")}
              </Badge>
            ) : null}
            {deployment.latest ? (
              <Badge
                color="blue"
                data-testid={`service-deployment-latest-${deployment.id}`}
              >
                {t("service:deployments.latest")}
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription className="break-all">
            {deployment.image}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid items-center gap-4 text-sm md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            <DeploymentField
              label={t("service:deployments.fields.status")}
              value={<DeploymentStatusBadge status={deployment.status} />}
            />
            <DeploymentField
              label={t("service:deployments.fields.replicas")}
              value={deployment.replicas ?? "-"}
            />
            <DeploymentField
              label={t("service:deployments.fields.created_at")}
              value={dayjs(deployment.createdAt).format("YYYY-MM-DD HH:mm")}
            />
            <DeploymentField
              label={t("service:deployments.fields.kubernetes_deployment")}
              value={deployment.kubernetesDeploymentName ?? deployment.id}
              valueClassName="break-all font-mono text-xs"
            />
            <ArrowRight className="text-muted-foreground hidden size-4 md:block" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DeploymentField({
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

function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  return (
    <Badge color={statusColors[status]}>{t(`service:status.${status}`)}</Badge>
  );
}
