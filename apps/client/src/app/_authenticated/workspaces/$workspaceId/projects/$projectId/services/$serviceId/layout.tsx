import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";

import { graphql } from "@/gql";

const GET_SERVICE_FROM_SERVICE_LAYOUT = graphql(`
  query getServiceFromServiceLayout($projectId: ID!, $id: ID!) {
    service(projectId: $projectId, id: $id) {
      id
      projectId
      name
      image
      replicas
      command
      args
      resources {
        cpuRequest
        cpuLimit
        memoryRequest
        memoryLimit
      }
      healthCheck {
        type
        port
        path
      }
      status
      createdAt
      updatedAt
      ports {
        port
        targetPort
      }
      env {
        key
        value
      }
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId",
)({
  component: ServiceLayout,
  beforeLoad: async ({
    context: { apolloClient },
    params: { workspaceId, projectId, serviceId },
  }) => {
    try {
      const { data } = await apolloClient.query({
        query: GET_SERVICE_FROM_SERVICE_LAYOUT,
        variables: { projectId, id: serviceId },
      });

      if (data?.service) {
        return {
          title: data.service.name,
          service: data.service,
        };
      }
    } catch {
      // Route fallback below keeps broken service links from stranding the user.
    }

    throw redirect({
      to: "/workspaces/$workspaceId/projects/$projectId/services",
      params: { workspaceId, projectId },
    });
  },
});

function ServiceLayout() {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const { projectId } = Route.useParams();
  const service = Route.useRouteContext({
    select: (context) => context.service,
  });

  useEffect(() => {
    const subscription = apolloClient
      .watchQuery({
        query: GET_SERVICE_FROM_SERVICE_LAYOUT,
        variables: { projectId, id: service.id },
        fetchPolicy: "cache-and-network",
        pollInterval: 5000,
      })
      .subscribe({
        next(result) {
          if (
            result.data?.service &&
            (result.data.service.updatedAt !== service.updatedAt ||
              result.data.service.status !== service.status)
          ) {
            router.invalidate();
          }
        },
      });

    return () => subscription.unsubscribe();
  }, [apolloClient, projectId, router, service]);

  return <Outlet />;
}
