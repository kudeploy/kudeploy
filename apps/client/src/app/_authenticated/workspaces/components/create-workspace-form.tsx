import { useForm } from "@tanstack/react-form";
import { t } from "i18next";
import { toast } from "sonner";
import { z } from "zod";

import { useMutation } from "@apollo/client/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { graphql } from "@/gql";

const CREATE_WORKSPACE_FROM_CREATE_WORKSPACE_FORM = graphql(`
  mutation createWorkspaceFromCreateWorkspaceForm(
    $input: CreateWorkspaceInput!
  ) {
    createWorkspace(input: $input) {
      id
    }
  }
`);

export function CreateWorkspaceForm() {
  const navigate = useNavigate();

  const [createWorkspaceMutation, { loading }] = useMutation(
    CREATE_WORKSPACE_FROM_CREATE_WORKSPACE_FORM,
  );

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("workspace:create.form.name.minLength"),
    }),
  });

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await createWorkspaceMutation({
          variables: {
            input: {
              name: value.name,
            },
          },
        });

        if (result.data?.createWorkspace) {
          toast.success(t("workspace:create.toast.success"));
          // 跳转到新创建的工作空间
          navigate({
            to: "/workspaces/$workspaceId",
            params: { workspaceId: result.data.createWorkspace.id },
            reloadDocument: true,
          });
        }
      } catch (error) {
        console.error("Failed to create workspace:", error);
        toast.error(t("workspace:create.toast.failed"));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      data-testid="workspace-create-form"
      className="space-y-6"
    >
      <form.Field name="name">
        {(field) => (
          <Input
            id="name"
            data-testid="workspace-create-name-input"
            label={t("workspace:create.form.name.label")}
            description={t("workspace:create.form.name.description")}
            placeholder={t("workspace:create.form.name.placeholder")}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={
              field.form.state.isSubmitted && field.state.meta.errors.length > 0
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

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            data-testid="workspace-create-submit"
            loading={isSubmitting || loading}
            className="w-full"
          >
            {t("workspace:create.submit")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
