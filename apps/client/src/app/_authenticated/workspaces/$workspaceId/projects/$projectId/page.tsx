import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/",
)({
  beforeLoad: ({ params: { workspaceId, projectId } }) => {
    throw redirect({
      to: "/workspaces/$workspaceId/projects/$projectId/services",
      params: { workspaceId, projectId },
    });
  },
});
