import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

import { ServicePlaceholderPage } from "../../components/service-placeholder-page";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/logs/",
)({
  component: ServiceLogsComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceLogsComponent() {
  return (
    <ServicePlaceholderPage
      title={t("service:tabs.logs")}
      testId="service-logs-page"
    />
  );
}
