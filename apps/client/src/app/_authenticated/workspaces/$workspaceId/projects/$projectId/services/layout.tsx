import { Outlet, createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services",
)({
  component: ServicesLayout,
  beforeLoad: ({ location, params: { workspaceId, projectId } }) => {
    const servicesPath =
      `/workspaces/${workspaceId}/projects/${projectId}/services`;
    const pathname = location.pathname.replace(/\/+$/, "");

    return {
      title: pathname === servicesPath ? null : t("service:title"),
    };
  },
});

function ServicesLayout() {
  return <Outlet />;
}
