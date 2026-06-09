import { Outlet, createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments",
)({
  component: DeploymentBreadcrumbLayout,
  beforeLoad: () => ({ title: t("service:tabs.deployments") }),
});

function DeploymentBreadcrumbLayout() {
  return <Outlet />;
}
