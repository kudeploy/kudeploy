import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { t } from "i18next";
import { toast } from "sonner";

import { ProjectTabs } from "../../components/project-tabs";
import { StatusBadge } from "../../components/status-badge";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";

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
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/settings/",
)({
  component: ProjectSettingsComponent,
  beforeLoad: () => {
    return { title: null };
  },
});

function ProjectSettingsComponent() {
  const { workspaceId, projectId } = Route.useParams();
  const { project } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();
  const [name, setName] = useState(project.name);

  const [updateProject, { loading: updateLoading }] = useMutation(
    UPDATE_PROJECT_FROM_PROJECT_ROUTE,
  );
  const [deleteProject, { loading: deleteLoading }] = useMutation(
    DELETE_PROJECT_FROM_PROJECT_ROUTE,
  );

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

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
      setName(trimmedName);
      await router.invalidate();
      toast.success(t("project:toast.updated"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async () => {
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
    <>
      <ProjectTabs workspaceId={workspaceId} projectId={projectId} />
      <Page
        title={t("project:settings.title")}
        description={t("project:settings.description")}
      >
        <div className="space-y-6" data-testid="project-detail-page">
          <Card>
            <CardHeader>
              <CardTitle>{t("project:settings.update.title")}</CardTitle>
              <CardDescription>
                {t("project:settings.update.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <StatusBadge namespace="project" status={project.status} />

              <Input
                data-testid="project-detail-name-input"
                label={t("project:form.name.label")}
                placeholder={t("project:form.name.placeholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </CardContent>

            <CardFooter className="justify-end">
              <Button
                data-testid="project-save-action"
                disabled={updateLoading}
                onClick={handleSave}
              >
                {t("action.save")}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                {t("project:settings.danger_zone.title")}
              </CardTitle>
              <CardDescription>
                {t("project:settings.danger_zone.description")}
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <Button
                data-testid="project-delete-action"
                disabled={deleteLoading}
                loading={deleteLoading}
                variant="destructive"
                onClick={handleDelete}
              >
                {t("project:settings.danger_zone.delete_button")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Page>
    </>
  );
}
