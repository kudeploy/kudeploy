import { useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { t } from "i18next";
import * as z from "zod";

import { WorkspaceMemberGroupMembersManager } from "../components/workspace-member-group-members-manager";
import { useCurrentWorkspaceMemberContext } from "../../contexts/current-workspace-member-context";
import type {
  UpdateWorkspaceMemberGroupInput,
  WorkspacePermission,
} from "@/gql/graphql";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { WorkspaceMemberRole } from "@/gql/graphql";
import { PermissionCheckboxGroup } from "@/components/permission-checkbox-group";

import { Page } from "@/components/fabric-ui/page";
import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Textarea } from "@/components/fabric-ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { graphql } from "@/gql";

const GET_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE = graphql(`
  query getWorkspaceMemberGroupFromMemberGroupRoute($id: ID!, $first: Int) {
    workspaceMemberGroup(id: $id) {
      id
      name
      description
      permissions
      members(first: $first) {
        edges {
          node {
            id
            name
            email
            user {
              id
              name
              email
            }
          }
        }
      }
    }
  }
`);

const UPDATE_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE = graphql(`
  mutation updateWorkspaceMemberGroupFromMemberGroupRoute(
    $id: ID!
    $input: UpdateWorkspaceMemberGroupInput!
  ) {
    updateWorkspaceMemberGroup(id: $id, input: $input) {
      id
      name
      description
      permissions
    }
  }
`);

const DELETE_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE = graphql(`
  mutation deleteWorkspaceMemberGroupFromMemberGroupRoute($id: ID!) {
    deleteWorkspaceMemberGroup(id: $id) {
      id
    }
  }
`);

const ADD_MEMBERS_TO_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE = graphql(`
  mutation addMembersToWorkspaceMemberGroupFromMemberGroupRoute(
    $id: ID!
    $memberIds: [ID!]!
  ) {
    addMembersToWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {
      id
    }
  }
`);

const REMOVE_MEMBERS_FROM_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE =
  graphql(`
    mutation removeMembersFromWorkspaceMemberGroupFromMemberGroupRoute(
      $id: ID!
      $memberIds: [ID!]!
    ) {
      removeMembersFromWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {
        id
      }
    }
  `);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/member-groups/$memberGroupId/",
)({
  component: MemberGroupComponent,
  beforeLoad: async ({
    context: { apolloClient },
    params: { memberGroupId },
  }) => {
    try {
      const { data } = await apolloClient.query({
        query: GET_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE,
        variables: { id: memberGroupId },
      });
      return {
        memberGroup: data?.workspaceMemberGroup,
        title:
          data?.workspaceMemberGroup?.name ||
          t("workspace-member-group:detail.page.title"),
      };
    } catch {
      // 跳至 workspaces
      throw redirect({
        to: "/workspaces",
      });
    }
  },
});

function MemberGroupComponent() {
  const navigate = useNavigate();
  const { workspaceId, memberGroupId } = Route.useParams();
  const currentWorkspaceMember = useCurrentWorkspaceMemberContext();

  // 重新查询以获取完整的成员列表数据
  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE, {
    variables: {
      id: memberGroupId,
      first: 500,
    },
    skip: !memberGroupId,
    fetchPolicy: "cache-and-network",
  });

  const group = data?.workspaceMemberGroup;

  const [updateWorkspaceMemberGroup, { loading: updateLoading }] = useMutation(
    UPDATE_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE,
  );

  const [deleteWorkspaceMemberGroup, { loading: deleteLoading }] = useMutation(
    DELETE_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE,
  );

  const [addMembersToGroup, { loading: addMemberLoading }] = useMutation(
    ADD_MEMBERS_TO_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE,
  );

  const [removeMembersFromGroup, { loading: removeMemberLoading }] =
    useMutation(
      REMOVE_MEMBERS_FROM_WORKSPACE_MEMBER_GROUP_FROM_MEMBER_GROUP_ROUTE,
    );

  // 获取已添加的成员
  const addedMembers = useMemo(() => {
    if (!group?.members?.edges) {
      return [];
    }

    return group.members.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      email: edge.node.email,
      user: edge.node.user,
    }));
  }, [group]);

  const formSchema = z.object({
    name: z
      .string()
      .min(1, t("workspace-member-group:detail.form.name_field.rules.min"))
      .max(255, t("workspace-member-group:detail.form.name_field.rules.max")),
    description: z.string(),
    permissions: z.array(z.any()),
  });

  const form = useForm({
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
      permissions: (group?.permissions as Array<WorkspacePermission>) || [],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!memberGroupId || !group) return;

      try {
        const input: UpdateWorkspaceMemberGroupInput = {};

        if (value.name !== group.name) {
          input.name = value.name;
        }
        if (value.description !== (group.description || "")) {
          input.description = value.description || undefined;
        }
        if (
          JSON.stringify([...value.permissions].sort()) !==
          JSON.stringify([...(group.permissions || [])].sort())
        ) {
          input.permissions = value.permissions;
        }

        await updateWorkspaceMemberGroup({
          variables: {
            id: memberGroupId,
            input,
          },
        });

        toast.success(
          t(
            "workspace-member-group:detail.page.actions.save_btn.success_toast",
          ),
        );
        refetch();
      } catch (error) {
        toast.error(
          t("workspace-member-group:detail.page.actions.save_btn.error_toast"),
          {
            description:
              error instanceof Error ? error.message : "Unknown error",
          },
        );
      }
    },
  });

  const handleAddMember = async (memberId: string) => {
    try {
      await addMembersToGroup({
        variables: {
          id: memberGroupId,
          memberIds: [memberId],
        },
      });
      toast.success(
        t(
          "workspace-member-group:detail.members.management.add_member.success_toast",
        ),
      );
      refetch();
    } catch (error) {
      toast.error(
        t(
          "workspace-member-group:detail.members.management.add_member.error_toast",
        ),
        {
          description: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  };

  // 处理删除成员
  const handleDeleteMember = async (memberId: string) => {
    try {
      await removeMembersFromGroup({
        variables: {
          id: memberGroupId,
          memberIds: [memberId],
        },
      });
      toast.success(
        t(
          "workspace-member-group:detail.members.management.delete_member.success_toast",
        ),
      );
      refetch();
    } catch (error) {
      toast.error(
        t(
          "workspace-member-group:detail.members.management.delete_member.error_toast",
        ),
        {
          description: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  };

  const handleDelete = async () => {
    if (!memberGroupId || !workspaceId) return;

    try {
      await deleteWorkspaceMemberGroup({
        variables: { id: memberGroupId },
      });

      toast.success(
        t(
          "workspace-member-group:detail.page.actions.delete_btn.success_toast",
        ),
      );
      navigate({
        to: "/workspaces/$workspaceId/member-groups",
        params: { workspaceId },
      });
    } catch (error) {
      toast.error(
        t("workspace-member-group:detail.page.actions.delete_btn.error_toast"),
        {
          description: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  };

  const canEdit = useMemo(() => {
    return (
      currentWorkspaceMember &&
      "role" in currentWorkspaceMember &&
      [WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.OWNER].includes(
        currentWorkspaceMember.role,
      )
    );
  }, [currentWorkspaceMember]);

  if (!canEdit) {
    if (workspaceId) {
      toast.error(t("workspace-member-group:detail.permission_denied"));
      navigate({
        to: "/workspaces/$workspaceId/member-groups",
        params: { workspaceId },
        replace: true,
      });
    }
    return null;
  }

  if (queryLoading) {
    return (
      <Page
        variant="compact"
        title={t("workspace-member-group:detail.page.title")}
      >
        <Tabs defaultValue="settings">
          <TabsList variant="default">
            <TabsTrigger value="settings">
              {t("workspace-member-group:detail.page.tabs.settings")}
            </TabsTrigger>
            <TabsTrigger value="members">
              {t("workspace-member-group:detail.page.tabs.members")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <FieldSet>
              <FieldGroup>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </FieldGroup>
            </FieldSet>
          </TabsContent>
        </Tabs>
      </Page>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <Page
      variant="compact"
      title={group.name}
      secondaryActions={
        canEdit
          ? [
              {
                disabled: deleteLoading,
                label: t(
                  "workspace-member-group:detail.page.actions.delete_btn.content",
                ),
                testId: "member-group-delete-action",
                onClick: async () => {
                  const confirmed = await alertDialog({
                    title: t(
                      "workspace-member-group:detail.page.actions.delete_btn.dialog.title",
                    ),
                    description: t(
                      "workspace-member-group:detail.page.actions.delete_btn.dialog.description",
                    ),
                    cancelText: t("action.cancel"),
                    confirmText: t("action.confirm"),
                  });
                  if (confirmed) {
                    handleDelete();
                  }
                },
              },
            ]
          : undefined
      }
    >
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">
            {t("workspace-member-group:detail.page.tabs.settings")}
          </TabsTrigger>
          <TabsTrigger value="members" data-testid="member-group-members-tab">
            {t("workspace-member-group:detail.page.tabs.members")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <form
            id="workspace-member-group-form"
            data-testid="member-group-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldGroup>
                <form.Field name="name">
                  {(field) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      data-testid="member-group-name-input"
                      label={t(
                        "workspace-member-group:detail.form.name_field.label",
                      )}
                      description={t(
                        "workspace-member-group:detail.form.name_field.description",
                      )}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={
                        field.form.state.isSubmitted &&
                        field.state.meta.errors.length > 0
                          ? field.state.meta.errors.map((error: any) => typeof error === "string" ? error : error?.message || error).join(", ")
                          : undefined
                      }
                      aria-required="true"
                      required
                      autoComplete="off"
                      disabled={updateLoading}
                    />
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      data-testid="member-group-description-input"
                      label={t(
                        "workspace-member-group:detail.form.description_field.label",
                      )}
                      description={t(
                        "workspace-member-group:detail.form.description_field.description",
                      )}
                      placeholder={t(
                        "workspace-member-group:detail.form.description_field.placeholder",
                      )}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={4}
                      disabled={updateLoading}
                    />
                  )}
                </form.Field>

                <form.Field name="permissions">
                  {(field) => (
                    <PermissionCheckboxGroup
                      value={field.state.value}
                      onChange={field.handleChange}
                      disabled={updateLoading}
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
                        data-testid="member-group-save"
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
        </TabsContent>

        <TabsContent value="members">
          <WorkspaceMemberGroupMembersManager
            addedMembers={addedMembers}
            isCreate={false}
            loading={false}
            addLoading={addMemberLoading}
            removeLoading={removeMemberLoading}
            onAdd={handleAddMember}
            onDelete={handleDeleteMember}
          />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
