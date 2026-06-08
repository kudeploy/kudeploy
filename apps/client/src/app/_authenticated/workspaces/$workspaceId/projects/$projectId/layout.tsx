import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";

import { graphql } from "@/gql";

const GET_PROJECT_FROM_PROJECT_LAYOUT = graphql(`
  query getProjectFromProjectLayout($id: ID!) {
    project(id: $id) {
      id
      name
      status
      createdAt
      updatedAt
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId",
)({
  component: ProjectLayout,
  beforeLoad: async ({
    context: { apolloClient },
    params: { workspaceId, projectId },
  }) => {
    try {
      const { data } = await apolloClient.query({
        query: GET_PROJECT_FROM_PROJECT_LAYOUT,
        variables: { id: projectId },
      });

      if (data?.project) {
        return {
          title: data.project.name,
          project: data.project,
        };
      }
    } catch {
      // Route fallback below keeps broken project links from stranding the user.
    }

    throw redirect({
      to: "/workspaces/$workspaceId/projects",
      params: { workspaceId },
    });
  },
});

function ProjectLayout() {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const project = Route.useRouteContext({
    select: (context) => context.project,
  });

  useEffect(() => {
    const subscription = apolloClient
      .watchQuery({
        query: GET_PROJECT_FROM_PROJECT_LAYOUT,
        variables: { id: project.id },
        fetchPolicy: "cache-only",
      })
      .subscribe({
        next(result) {
          if (
            result.data?.project?.updatedAt &&
            result.data.project.updatedAt !== project.updatedAt
          ) {
            router.invalidate();
          }
        },
      });

    return () => subscription.unsubscribe();
  }, [apolloClient, project, router]);

  return <Outlet />;
}
