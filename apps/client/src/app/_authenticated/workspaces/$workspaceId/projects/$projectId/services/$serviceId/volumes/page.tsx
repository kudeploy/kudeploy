import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";

import { ServicePlaceholderPage } from "../components/service-placeholder-page";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/volumes/",
)({
  component: ServiceVolumesComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceVolumesComponent() {
  return (
    <ServicePlaceholderPage
      title={t("service:tabs.volumes")}
      testId="service-volumes-page"
    />
  );
}
