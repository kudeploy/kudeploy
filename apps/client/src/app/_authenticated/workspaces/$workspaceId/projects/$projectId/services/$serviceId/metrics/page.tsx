import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

import { ServicePlaceholderPage } from "../components/service-placeholder-page";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/metrics/",
)({
  component: ServiceMetricsComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceMetricsComponent() {
  return (
    <ServicePlaceholderPage
      title={t("service:tabs.metrics")}
      testId="service-metrics-page"
    />
  );
}
