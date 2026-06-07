import { createFileRoute, redirect } from "@tanstack/react-router";
import { t } from "i18next";
import { CreateWorkspaceForm } from "./components/create-workspace-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card className="w-full max-w-md" data-testid="workspace-empty-state">
        <CardHeader>
          <CardTitle>{t("workspace:empty.title")}</CardTitle>

          <CardDescription>{t("workspace:empty.description")}</CardDescription>
        </CardHeader>

        <CardContent>
          <CreateWorkspaceForm />
        </CardContent>
      </Card>
    </div>
  );
}
