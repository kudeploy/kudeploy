import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

import { StatusBadge } from "../../../../components/status-badge";
import { Page } from "@/components/fabric-ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/",
)({
  component: ServiceOverviewComponent,
});

function ServiceOverviewComponent() {
  const { service } = Route.useRouteContext();

  return (
    <Page
      title={t("service:tabs.overview")}
      description={t("service:overview.description")}
    >
      <div
        className="grid gap-4 lg:grid-cols-3"
        data-testid="service-detail-page"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("service:overview.status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge namespace="service" status={service.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("service:overview.image")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm break-all">
            {service.image}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("service:overview.replicas")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {service.replicas ?? "-"}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
