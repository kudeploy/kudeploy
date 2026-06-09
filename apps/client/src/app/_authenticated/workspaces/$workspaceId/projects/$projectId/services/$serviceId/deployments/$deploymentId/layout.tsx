import { useMemo } from "react";
import {
  Outlet,
  createFileRoute,
  linkOptions,
  redirect,
} from "@tanstack/react-router";
import { t } from "i18next";

import { NavTabs } from "@/components/nav-tabs";
import { graphql } from "@/gql";

const GET_DEPLOYMENT_FROM_DEPLOYMENT_LAYOUT = graphql(`
  query getDeploymentFromDeploymentLayout($projectId: ID!, $id: ID!) {
    deployment(projectId: $projectId, id: $id) {
      id
      projectId
      serviceId
      version
      image
      replicas
      ports {
        port
        targetPort
      }
      env {
        name
        value
      }
      envFrom {
        kind
        name
        prefix
      }
      command
      args
      resources {
        cpuRequest
        cpuLimit
        memoryRequest
        memoryLimit
      }
      serviceAccountName
      status
      active
      latest
      kubernetesDeploymentName
      createdAt
      updatedAt
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments/$deploymentId",
)({
  component: DeploymentLayout,
  beforeLoad: async ({
    context: { apolloClient },
    params: { workspaceId, projectId, serviceId, deploymentId },
  }) => {
    try {
      const { data } = await apolloClient.query({
        query: GET_DEPLOYMENT_FROM_DEPLOYMENT_LAYOUT,
        variables: { projectId, id: deploymentId },
      });

      if (data?.deployment && data.deployment.serviceId === serviceId) {
        return {
          title: t("service:deployments.version", {
            version: data.deployment.version,
          }),
          deployment: data.deployment,
        };
      }
    } catch {
      // Route fallback below keeps stale deployment links from stranding the user.
    }

    throw redirect({
      to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments",
      params: { workspaceId, projectId, serviceId },
    });
  },
});

function DeploymentLayout() {
  const { workspaceId, projectId, serviceId, deploymentId } = Route.useParams();
  const tabs = useMemo(
    () => [
      {
        title: t("service:deployment.tabs.overview"),
        testId: "deployment-overview-tab",
        link: linkOptions({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId/deployments/$deploymentId",
          params: {
            workspaceId,
            projectId,
            serviceId,
            deploymentId,
          },
          activeOptions: { exact: true },
        }),
      },
    ],
    [deploymentId, projectId, serviceId, workspaceId],
  );

  return (
    <>
      <NavTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
