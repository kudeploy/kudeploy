import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ServerCog } from "lucide-react";
import { t } from "i18next";
import { toast } from "sonner";

import { StatusBadge } from "../components/status-badge";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import { graphql } from "@/gql";

const GET_PROJECT_FROM_PROJECT_ROUTE = graphql(`
  query getProjectFromProjectRoute($id: ID!) {
    project(id: $id) {
      id
      name
      status
      createdAt
      updatedAt
    }
  }
`);

const UPDATE_PROJECT_FROM_PROJECT_ROUTE = graphql(`
  mutation updateProjectFromProjectRoute(
    $id: ID!
    $input: UpdateProjectInput!
  ) {
    updateProject(id: $id, input: $input) {
      id
      name
      status
      updatedAt
    }
  }
`);

const DELETE_PROJECT_FROM_PROJECT_ROUTE = graphql(`
  mutation deleteProjectFromProjectRoute($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/",
)({
  component: ProjectComponent,
});

function ProjectComponent() {
  const { workspaceId, projectId } = Route.useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const { data, refetch } = useQuery(GET_PROJECT_FROM_PROJECT_ROUTE, {
    variables: { id: projectId },
    fetchPolicy: "cache-and-network",
  });

  const project = data?.project;

  const [updateProject, { loading: updateLoading }] = useMutation(
    UPDATE_PROJECT_FROM_PROJECT_ROUTE,
  );
  const [deleteProject, { loading: deleteLoading }] = useMutation(
    DELETE_PROJECT_FROM_PROJECT_ROUTE,
  );

  useEffect(() => {
    if (project) {
      setName(project.name);
    }
  }, [project]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error(t("project:form.name.required"));
      return;
    }

    try {
      await updateProject({
        variables: {
          id: projectId,
          input: { name: trimmedName },
        },
      });
      await refetch();
      toast.success(t("project:toast.updated"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    const confirmed = await alertDialog({
      title: t("project:delete.title"),
      description: t("project:delete.description", { name: project.name }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteProject({ variables: { id: projectId } });
      toast.success(t("project:toast.deleted"));
      navigate({
        to: "/workspaces/$workspaceId/projects",
        params: { workspaceId },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Page
      title={project?.name ?? t("project:detail.title")}
      description={t("project:detail.description")}
      primaryAction={{
        label: t("project:detail.services_action"),
        icon: <ServerCog data-icon="inline-start" />,
        render: (
          <Link
            to="/workspaces/$workspaceId/projects/$projectId/services"
            params={{ workspaceId, projectId }}
          />
        ),
      }}
      secondaryActions={[
        {
          disabled: updateLoading || !project,
          label: t("action.save"),
          onClick: handleSave,
          testId: "project-save-action",
        },
        {
          disabled: deleteLoading || !project,
          label: t("action.delete"),
          onClick: handleDelete,
          testId: "project-delete-action",
        },
      ]}
    >
      <div className="max-w-2xl space-y-5" data-testid="project-detail-page">
        {project && (
          <div>
            <StatusBadge namespace="project" status={project.status} />
          </div>
        )}

        <Input
          data-testid="project-detail-name-input"
          label={t("project:form.name.label")}
          placeholder={t("project:form.name.placeholder")}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div className="flex gap-2 @md/page:hidden">
          <Button disabled={updateLoading || !project} onClick={handleSave}>
            {t("action.save")}
          </Button>
          <Button
            disabled={deleteLoading || !project}
            variant="outline"
            onClick={handleDelete}
          >
            {t("action.delete")}
          </Button>
        </div>
      </div>
    </Page>
  );
}
