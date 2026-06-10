import { linkOptions } from "@tanstack/react-router";
import { t } from "i18next";
import { useMemo } from "react";

import { NavTabs } from "@/components/nav-tabs";

export function ProjectTabs({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const tabs = useMemo(
    () => [
      {
        title: t("project:tabs.services"),
        testId: "project-services-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services",
          params: { workspaceId, projectId },
        }),
      },
      {
        title: t("project:tabs.volumes"),
        testId: "project-volumes-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/volumes",
          params: { workspaceId, projectId },
        }),
      },
      {
        title: t("project:tabs.registry_credentials"),
        testId: "project-registry-credentials-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/registry-credentials",
          params: { workspaceId, projectId },
        }),
      },
      {
        title: t("project:tabs.settings"),
        testId: "project-settings-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/settings",
          params: { workspaceId, projectId },
        }),
      },
    ],
    [projectId, workspaceId],
  );

  return <NavTabs tabs={tabs} />;
}
