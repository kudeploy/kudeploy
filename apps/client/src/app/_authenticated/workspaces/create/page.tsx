import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@apollo/client/react";
import { t } from "i18next";
import { Button } from "@/components/fabric-ui/button";

import { Input } from "@/components/fabric-ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { graphql } from "@/gql";

const CREATE_WORKSPACE_FROM_CREATE_WORKSPACE_ROUTE = graphql(`
  mutation createWorkspaceFromCreateWorkspaceRoute(
    $input: CreateWorkspaceInput!
  ) {
    createWorkspace(input: $input) {
      id
    }
  }
`);

export const Route = createFileRoute("/_authenticated/workspaces/create/")({
  component: CreateWorkspaceComponent,
  beforeLoad: () => {
    return {
      title: t("workspace:create.title"),
    };
  },
});

function CreateWorkspaceComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const [createWorkspace, { loading }] = useMutation(
    CREATE_WORKSPACE_FROM_CREATE_WORKSPACE_ROUTE,
  );

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      const { data } = await createWorkspace({
        variables: {
          input: {
            name: value.name,
          },
        },
      });

      if (data?.createWorkspace.id) {
        navigate({
          to: `/workspaces/$workspaceId/settings`,
          params: { workspaceId: data.createWorkspace.id },
          reloadDocument: true,
        });
      }
    },
  });

  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FieldSet>
              <FieldLegend>{t("workspace:create.title")}</FieldLegend>
              <FieldDescription>
                {t("workspace:create.description")}
              </FieldDescription>
              <FieldGroup>
                <form.Field name="name">
                  {(field) => (
                    <Input
                      id="name"
                      data-testid="workspace-create-name-input"
                      label={t("workspace:create.form.name.label")}
                      placeholder={t("workspace:create.form.name.placeholder")}
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <Field orientation="horizontal">
              <Button
                type="submit"
                data-testid="workspace-create-submit"
                loading={loading}
              >
                {t("action.create")}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => router.history.back()}
              >
                {t("action.back")}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
