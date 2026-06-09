import { useMemo } from "react";
import {
  Outlet,
  createFileRoute,
  linkOptions,
} from "@tanstack/react-router";
import { t } from "i18next";

import { NavTabs } from "@/components/nav-tabs";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout",
)({
  component: ServiceTabsLayout,
});

function ServiceTabsLayout() {
  const { workspaceId, projectId, serviceId } = Route.useParams();

  const tabs = useMemo(
    () => [
      {
        title: t("service:tabs.overview"),
        testId: "service-overview-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId",
          params: { workspaceId, projectId, serviceId },
          activeOptions: { exact: true },
        }),
      },
      {
        title: t("service:tabs.source"),
        testId: "service-source-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/source",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.environment"),
        testId: "service-environment-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/environment",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.network"),
        testId: "service-network-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/network",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.volumes"),
        testId: "service-volumes-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/volumes",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.deployments"),
        testId: "service-deployments-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.terminal"),
        testId: "service-terminal-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/terminal",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.logs"),
        testId: "service-logs-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/logs",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.metrics"),
        testId: "service-metrics-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/metrics",
          params: { workspaceId, projectId, serviceId },
        }),
      },
      {
        title: t("service:tabs.settings"),
        testId: "service-settings-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/settings",
          params: { workspaceId, projectId, serviceId },
        }),
      },
    ],
    [projectId, serviceId, workspaceId],
  );

  return (
    <>
      <NavTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
