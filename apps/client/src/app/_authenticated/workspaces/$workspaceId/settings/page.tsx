import { useMutation } from "@apollo/client/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { t } from "i18next";
import { toast } from "sonner";

import { useCurrentWorkspaceContext } from "../contexts/current-workspace-context";
import { useCurrentWorkspaceMemberContext } from "../contexts/current-workspace-member-context";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Page } from "@/components/fabric-ui/page";
import { Button } from "@/components/fabric-ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/fabric-ui/input";
import { graphql } from "@/gql";
import { WorkspaceMemberRole } from "@/gql/graphql";

const UPDATE_WORKSPACE_FROM_SETTINGS_ROUTE = graphql(`
  mutation updateWorkspaceFromSettingsRoute($input: UpdateWorkspaceInput!) {
    updateWorkspace(input: $input) {
      id
      name
    }
  }
`);

const DELETE_WORKSPACE_FROM_SETTINGS_ROUTE = graphql(`
  mutation deleteWorkspaceFromSettingsRoute {
    deleteWorkspace {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/settings/",
)({
  component: SettingsComponent,
  beforeLoad: () => {
    return {
      title: t("workspace:title"),
    };
  },
});

function SettingsComponent() {
  const navigate = useNavigate();

  const workspace = useCurrentWorkspaceContext();
  const currentWorkspaceMember = useCurrentWorkspaceMemberContext();

  const [updateWorkspace] = useMutation(UPDATE_WORKSPACE_FROM_SETTINGS_ROUTE);
  const [deleteWorkspace, { loading: deleting, client }] = useMutation(
    DELETE_WORKSPACE_FROM_SETTINGS_ROUTE,
  );

  const form = useForm({
    defaultValues: {
      name: workspace.name,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateWorkspace({
          variables: {
            input: {
              name: value.name.trim(),
            },
          },
        });
        form.reset({ name: value.name.trim() });
        toast.success(t("workspace:settings.toast.updated_success"));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("workspace:settings.toast.update_failed"),
        );
      }
    },
  });

  const handleDelete = async () => {
    try {
      await deleteWorkspace();

      client.cache.evict({
        id: client.cache.identify({
          __typename: "Workspace",
          id: workspace.id,
        }),
      });

      navigate({
        to: "/workspaces",
        reloadDocument: true,
      });
      toast.success(t("workspace:settings.toast.deleted_success"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("workspace:settings.toast.delete_failed"),
      );
    }
  };

  return (
    <Page
      title={t("workspace:title")}
      description={t("workspace:settings.description")}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldSet>
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value.trim()
                    ? t("workspace:settings.form.name.required")
                    : undefined,
              }}
            >
              {(field) => (
                <Input
                  id="name"
                  data-testid="workspace-settings-name-input"
                  label={t("workspace:settings.form.name.label")}
                  placeholder={t("workspace:settings.form.name.placeholder")}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={
                    field.state.meta.errors.length > 0
                      ? field.state.meta.errors
                          .map((error: any) =>
                            typeof error === "string"
                              ? error
                              : error?.message || error,
                          )
                          .join(", ")
                      : undefined
                  }
                />
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [
                state.isDirty,
                state.isSubmitting,
                state.canSubmit,
              ]}
            >
              {([isDirty, isSubmitting, canSubmit]) => (
                <Field orientation="horizontal">
                  <Button
                    type="submit"
                    data-testid="workspace-settings-save"
                    disabled={!isDirty || !canSubmit}
                    loading={isSubmitting}
                  >
                    {t("action.save")}
                  </Button>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </FieldSet>
      </form>

      <Card className="border-destructive mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("workspace:settings.dangerZone.title")}
          </CardTitle>
          <CardDescription>
            {t("workspace:settings.dangerZone.description")}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            data-testid="workspace-settings-delete"
            disabled={currentWorkspaceMember.role !== WorkspaceMemberRole.OWNER}
            variant="destructive"
            loading={deleting}
            onClick={async () => {
              const confirmed = await alertDialog({
                title: t("workspace:settings.dangerZone.title"),
                description: t("workspace:settings.dangerZone.description"),
                variant: "destructive",
                confirmText: t("action.delete"),
                cancelText: t("action.cancel"),
              });
              if (confirmed) {
                handleDelete();
              }
            }}
          >
            {t("workspace:settings.dangerZone.deleteButton")}
          </Button>
        </CardFooter>
      </Card>
    </Page>
  );
}
