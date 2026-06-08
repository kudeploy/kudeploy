import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

import { ServicePlaceholderPage } from "../components/service-placeholder-page";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/terminal/",
)({
  component: ServiceTerminalComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceTerminalComponent() {
  return (
    <ServicePlaceholderPage
      title={t("service:tabs.terminal")}
      testId="service-terminal-page"
    />
  );
}
