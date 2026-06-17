import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { t } from "i18next";

import {
  DeploymentField,
  DeploymentSection,
  DeploymentStatusBadge,
  DeploymentValueList,
  formatCommand,
  formatEnv,
  formatEnvFrom,
  formatPorts,
  formatResource,
} from "./components/deployment-detail-fields";
import { Badge } from "@/components/thread-ui/badge";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments/$deploymentId/",
)({
  component: DeploymentOverviewComponent,
});

function DeploymentOverviewComponent() {
  const { deployment } = Route.useRouteContext();

  return (
    <Page>
      <PageHeader>
        <PageTitle>
          {t("service:deployments.version", {
            version: deployment.version,
          })}
        </PageTitle>
        <PageDescription>
          {t("service:deployment.overview.description")}
        </PageDescription>
      </PageHeader>
      <PageContent>
        <div
          className="grid gap-4 lg:grid-cols-3"
          data-testid="deployment-detail-page"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("service:deployments.fields.status")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <DeploymentStatusBadge status={deployment.status} />
              {deployment.active ? (
                <Badge color="green" data-testid="deployment-active-badge">
                  {t("service:deployments.active")}
                </Badge>
              ) : null}
              {deployment.latest ? (
                <Badge color="blue" data-testid="deployment-latest-badge">
                  {t("service:deployments.latest")}
                </Badge>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("service:deployments.fields.image")}</CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-xs break-all">
              {deployment.image}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("service:deployments.fields.replicas")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {deployment.replicas ?? "-"}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("service:deployment.overview.metadata")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm md:grid-cols-3">
                <DeploymentField
                  label={t("service:deployments.fields.kubernetes_deployment")}
                  value={deployment.kubernetesDeploymentName ?? deployment.id}
                  valueClassName="break-all font-mono text-xs"
                />
                <DeploymentField
                  label={t("service:deployments.fields.created_at")}
                  value={dayjs(deployment.createdAt).format("YYYY-MM-DD HH:mm")}
                />
                <DeploymentField
                  label={t("service:deployment.fields.updated_at")}
                  value={dayjs(deployment.updatedAt).format("YYYY-MM-DD HH:mm")}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className="lg:col-span-3"
            data-testid="deployment-configuration-section"
          >
            <CardContent className="space-y-5">
              <div className="text-sm font-medium">
                {t("service:deployments.configuration")}
              </div>
              <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
                <DeploymentSection
                  title={t("service:deployments.sections.runtime")}
                >
                  <DeploymentField
                    label={t("service:deployments.fields.image")}
                    value={deployment.image}
                    valueClassName="break-all font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.command")}
                    value={formatCommand(deployment.command)}
                    valueClassName="break-all font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.args")}
                    value={formatCommand(deployment.args)}
                    valueClassName="break-all font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.service_account")}
                    value={
                      deployment.serviceAccountName ??
                      t("service:deployments.not_configured")
                    }
                    valueClassName="break-all font-mono text-xs"
                  />
                </DeploymentSection>

                <DeploymentSection
                  title={t("service:deployments.sections.network")}
                >
                  <DeploymentField
                    label={t("service:deployments.fields.ports")}
                    value={
                      <DeploymentValueList values={formatPorts(deployment)} />
                    }
                    valueClassName="font-mono text-xs"
                  />
                </DeploymentSection>

                <DeploymentSection
                  title={t("service:deployments.sections.resources")}
                >
                  <DeploymentField
                    label={t("service:deployments.fields.cpu_request")}
                    value={formatResource(deployment.resources?.cpuRequest)}
                    valueClassName="font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.cpu_limit")}
                    value={formatResource(deployment.resources?.cpuLimit)}
                    valueClassName="font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.memory_request")}
                    value={formatResource(deployment.resources?.memoryRequest)}
                    valueClassName="font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.memory_limit")}
                    value={formatResource(deployment.resources?.memoryLimit)}
                    valueClassName="font-mono text-xs"
                  />
                </DeploymentSection>

                <DeploymentSection
                  title={t("service:deployments.sections.environment")}
                >
                  <DeploymentField
                    label={t("service:deployments.fields.env")}
                    value={
                      <DeploymentValueList values={formatEnv(deployment)} />
                    }
                    valueClassName="font-mono text-xs"
                  />
                  <DeploymentField
                    label={t("service:deployments.fields.env_from")}
                    value={
                      <DeploymentValueList values={formatEnvFrom(deployment)} />
                    }
                    valueClassName="font-mono text-xs"
                  />
                </DeploymentSection>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </Page>
  );
}
