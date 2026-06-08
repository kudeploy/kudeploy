import { useEffect, useMemo } from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  Outlet,
  createFileRoute,
  linkOptions,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { t } from "i18next";

import { NavTabs } from "@/components/nav-tabs";
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
  const { workspaceId, projectId, serviceId } = Route.useParams();
  const service = Route.useRouteContext({
    select: (context) => context.service,
  });

  useEffect(() => {
    const subscription = apolloClient
      .watchQuery({
        query: GET_SERVICE_FROM_SERVICE_LAYOUT,
        variables: { projectId, id: service.id },
        fetchPolicy: "cache-only",
      })
      .subscribe({
        next(result) {
          if (
            result.data?.service?.updatedAt &&
            result.data.service.updatedAt !== service.updatedAt
          ) {
            router.invalidate();
          }
        },
      });

    return () => subscription.unsubscribe();
  }, [apolloClient, projectId, router, service]);

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
