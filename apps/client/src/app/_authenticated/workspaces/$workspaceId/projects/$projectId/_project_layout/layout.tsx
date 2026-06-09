import { Outlet, createFileRoute } from "@tanstack/react-router";

import { ProjectTabs } from "../../components/project-tabs";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/_project_layout",
)({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { workspaceId, projectId } = Route.useParams();

  return (
    <>
      <ProjectTabs workspaceId={workspaceId} projectId={projectId} />
      <Outlet />
    </>
  );
}
