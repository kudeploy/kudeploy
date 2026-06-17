import { createFileRoute, redirect } from "@tanstack/react-router";
import { t } from "i18next";
import { CreateWorkspaceForm } from "./components/create-workspace-form";
import { Empty } from "@/components/thread-ui/empty";
import { graphql } from "@/gql";

const GET_FIRST_WORKSPACE_FROM_WORKSPACES_ROUTE = graphql(`
  query getFirstWorkspaceFromWorkspacesRoute {
    workspaces(first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`);

export const Route = createFileRoute("/_authenticated/workspaces/")({
  beforeLoad: async ({ context: { apolloClient } }) => {
    const { data } = await apolloClient.query({
      query: GET_FIRST_WORKSPACE_FROM_WORKSPACES_ROUTE,
    });

    const workspace = data?.workspaces?.edges?.[0]?.node;

    if (workspace) {
      throw redirect({
        to: "/workspaces/$workspaceId/settings",
        params: { workspaceId: workspace.id },
      });
    } else {
      throw Error("No found workspace");
    }
  },
  errorComponent: ErrorComponent,
});

function ErrorComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div
        className="w-full max-w-md space-y-6"
        data-testid="workspace-empty-state"
      >
        <Empty
          className="p-0"
          description={t("workspace:empty.description")}
          title={t("workspace:empty.title")}
        />
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
