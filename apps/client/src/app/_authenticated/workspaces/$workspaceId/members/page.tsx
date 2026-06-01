import { useMemo, useState } from "react";
import { zhCN } from "react-day-picker/locale";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import dayjs from "dayjs";
import { t } from "i18next";
import { toast } from "sonner";
import z from "zod";
import { isEmpty, pick } from "lodash";
import { useCurrentWorkspaceMemberContext } from "../contexts/current-workspace-member-context";
import { InviteMemberDialog } from "./components/invite-member-dialog";
import type { DataFilterItemProps as FilterItemProps } from "@/components/fabric-ui/data-filter";
import { DataFilter as Filter } from "@/components/fabric-ui/data-filter";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Page } from "@/components/fabric-ui/page";
import { DataTable } from "@/components/fabric-ui/data-table";
import { graphql } from "@/gql";
import {
  WorkspaceMemberOrderField,
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";
import { truncateEmail } from "@/utils/truncate-email";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatFilterValues } from "@/components/fabric-ui/data-filter/format-filter-values";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/fabric-ui/badge";

const GET_WORKSPACE_MEMBERS_FROM_MEMBERS_ROUTE = graphql(`
  query getWorkspaceMembersFromMembersRoute(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: WorkspaceMemberFilter
    $orderBy: WorkspaceMemberOrder
    $query: String
  ) {
    workspaceMembers(
      after: $after
      before: $before
      first: $first
      last: $last
      orderBy: $orderBy
      filter: $filter
      query: $query
    ) {
      edges {
        node {
          id
          name
          email
          role
          status
          createdAt
          user {
            id
            name
            email
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`);

const REMOVE_WORKSPACE_MEMBER_FROM_MEMBERS_ROUTE = graphql(`
  mutation removeWorkspaceMemberFromMembersRoute($id: ID!) {
    removeWorkspaceMember(id: $id) {
      id
    }
  }
`);

const UPDATE_WORKSPACE_MEMBER_STATUS_FROM_MEMBERS_ROUTE = graphql(`
  mutation updateWorkspaceMemberStatusFromMembersRoute(
    $id: ID!
    $input: UpdateWorkspaceMemberInput!
  ) {
    updateWorkspaceMember(id: $id, input: $input) {
      id
      status
    }
  }
`);

const getRoleLabel = (role: WorkspaceMemberRole) => {
  switch (role) {
    case WorkspaceMemberRole.OWNER:
      return t("workspace-member:role.owner");
    case WorkspaceMemberRole.ADMIN:
      return t("workspace-member:role.admin");
    case WorkspaceMemberRole.MEMBER:
      return t("workspace-member:role.member");
    default:
      return role;
  }
};

const statusMap = {
  [WorkspaceMemberStatus.INVITING]: t("workspace-member:status.inviting"),
  [WorkspaceMemberStatus.ACTIVE]: t("workspace-member:status.active"),
  [WorkspaceMemberStatus.INVITE_EXPIRED]: t(
    "workspace-member:status.invite_expired",
  ),
  [WorkspaceMemberStatus.DISABLED]: t("workspace-member:status.disabled"),
};

const getStatusLabel = (status: WorkspaceMemberStatus | null | undefined) => {
  if (!status) return null;

  switch (status) {
    case WorkspaceMemberStatus.INVITING:
      return statusMap[status];
    case WorkspaceMemberStatus.ACTIVE:
      return statusMap[status];
    case WorkspaceMemberStatus.INVITE_EXPIRED:
      return statusMap[status];
    case WorkspaceMemberStatus.DISABLED:
      return statusMap[status];
    default:
      return status;
  }
};

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/members/",
)({
  component: MembersComponent,
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          role: z
            .array(z.nativeEnum(WorkspaceMemberRole))
            .max(Object.values(WorkspaceMemberRole).length)
            .optional(),
          name: z.string().max(255).optional().catch(undefined),
          email: z.string().email().optional().catch(undefined),
          status: z
            .array(
              z.union([
                z.nativeEnum(WorkspaceMemberStatus),
                z.literal("ACTIVE"),
              ]),
            )
            .max(Object.values(WorkspaceMemberStatus).length + 1)
            .optional(),
          created_at: z.array(z.string().datetime()).length(2).optional(),
        })
        .optional(),
      pageSize: 20,
      orderField: WorkspaceMemberOrderField,
      defaultOrderField: WorkspaceMemberOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

function MembersComponent() {
  const search = Route.useSearch();
  const { workspaceId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentWorkspaceMember = useCurrentWorkspaceMemberContext();

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const [inviteOpen, setInviteOpen] = useState(false);

  const { data, refetch } = useQuery(GET_WORKSPACE_MEMBERS_FROM_MEMBERS_ROUTE, {
    variables: {
      ...pick(search, ["after", "before", "first", "last"]),
      query,
      filter: formatFilterValues(filterValues, (field, value) => {
        switch (field) {
          case "role":
            return { $in: value };
          case "name": {
            return { $fulltext: value };
          }
          case "status":
            return {
              $in: value,
            };
          case "created_at":
            return {
              $gte: value[0],
              $lte: dayjs(value[1]).endOf("day").toISOString(),
            };
          default:
            return value;
        }
      }),
      orderBy: {
        field: search?.orderBy?.field ?? WorkspaceMemberOrderField.CREATED_AT,
        direction: search?.orderBy?.direction ?? OrderDirection.DESC,
      },
    },
  });

  const members = data?.workspaceMembers.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.workspaceMembers.pageInfo;

  const filters: Array<FilterItemProps> = useMemo(() => {
    return [
      {
        label: t("workspace-member:filter.items.name.label"),
        field: "name",
        pinned: true,
        render: ({ field: { value, onChange } }) => {
          return (
            <Input
              placeholder={t("workspace-member:filter.items.name.placeholder")}
              defaultValue={value}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  onChange?.((e.target as HTMLInputElement).value);
                }
              }}
            />
          );
        },
      },
      {
        label: t("workspace-member:filter.items.email.label"),
        field: "email",
        pinned: true,
        render: ({ field: { value, onChange } }) => {
          return (
            <Input
              placeholder={t("workspace-member:filter.items.email.placeholder")}
              defaultValue={value}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  onChange?.((e.target as HTMLInputElement).value);
                }
              }}
            />
          );
        },
      },
      {
        label: t("workspace-member:filter.items.status.label"),
        field: "status",
        pinned: true,
        render: ({ field: { value = [], onChange } }) => {
          return (
            <div className="space-y-2">
              {[...Object.values(WorkspaceMemberStatus)].map((status) => (
                <div key={status} className="flex gap-2">
                  <Checkbox
                    id={`filter-${status.toLowerCase()}-checkbox`}
                    checked={value.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange(value?.length ? [...value, status] : [status]);
                      } else {
                        onChange(
                          value.filter(
                            (t: WorkspaceMemberStatus) => t !== status,
                          ),
                        );
                      }
                    }}
                  />

                  <Label htmlFor={`filter-${status.toLowerCase()}-checkbox`}>
                    {statusMap[status]}
                  </Label>
                </div>
              ))}
            </div>
          );
        },
        renderValue: ({ value }: { value: Array<string> }) => {
          return value
            .map((status) => {
              return statusMap[status as WorkspaceMemberStatus];
            })
            .join(",");
        },
      },
      {
        label: t("workspace-member:filter.items.role.label"),
        field: "role",
        pinned: true,
        render: ({ field: { value = [], onChange } }) => {
          return (
            <div className="space-y-2">
              {Object.values(WorkspaceMemberRole).map((role) => (
                <div key={role} className="flex gap-2">
                  <Checkbox
                    id={`filter-${role.toLowerCase()}-checkbox`}
                    checked={value.includes(role)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange(value?.length ? [...value, role] : [role]);
                      } else {
                        onChange(
                          value.filter((t: WorkspaceMemberRole) => t !== role),
                        );
                      }
                    }}
                  />

                  <Label htmlFor={`filter-${role.toLowerCase()}-checkbox`}>
                    {getRoleLabel(role)}
                  </Label>
                </div>
              ))}
            </div>
          );
        },
        renderValue: ({ value }) => {
          return value.map(getRoleLabel).join(",");
        },
      },
      {
        label: t("workspace-member:filter.items.created_at.label"),
        field: "created_at",
        pinned: true,
        render: ({ field }) => (
          <Calendar
            className="p-0"
            mode="range"
            locale={zhCN}
            selected={{ from: field.value?.[0], to: field.value?.[1] }}
            onSelect={(dateRange) => {
              if (dateRange) {
                field.onChange([dateRange.from, dateRange.to]);
              }
            }}
            disabled={(date) => dayjs(date).isAfter(dayjs())}
            numberOfMonths={2}
          />
        ),
        renderValue: ({ value }: { value: Array<string> }) => {
          return value
            .map((date) => dayjs(date).format("YYYY-MM-DD"))
            .join(",");
        },
      },
    ];
  }, []);

  const [removeWorkspaceMember, { loading: removeMemberLoading }] = useMutation(
    REMOVE_WORKSPACE_MEMBER_FROM_MEMBERS_ROUTE,
  );

  const [updateWorkspaceMemberStatus, { loading: updateStatusLoading }] =
    useMutation(UPDATE_WORKSPACE_MEMBER_STATUS_FROM_MEMBERS_ROUTE);

  const handleRemoveMemberClick = async (memberId: string) => {
    const confirmed = await alertDialog({
      title: t("workspace-member:delete.title"),
      description: t("workspace-member:delete.description"),
      cancelText: t("action.cancel"),
      confirmText: t("action.confirm"),
    });

    if (!confirmed) return;

    try {
      await removeWorkspaceMember({
        variables: { id: memberId },
        update(cache, result) {
          if (result.data?.removeWorkspaceMember) {
            cache.evict({
              id: cache.identify(result.data.removeWorkspaceMember),
            });
            cache.gc();
          }
        },
      });

      toast.success(t("workspace-member:toast.deleted_success"));
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleToggleMemberStatus = async (
    memberId: string,
    currentStatus: WorkspaceMemberStatus | null | undefined,
  ) => {
    try {
      // 只处理 ACTIVE 和 DISABLED 状态的切换
      if (
        currentStatus !== WorkspaceMemberStatus.ACTIVE &&
        currentStatus !== WorkspaceMemberStatus.DISABLED
      ) {
        return;
      }

      const newStatus =
        currentStatus === WorkspaceMemberStatus.DISABLED
          ? WorkspaceMemberStatus.ACTIVE
          : WorkspaceMemberStatus.DISABLED;

      await updateWorkspaceMemberStatus({
        variables: {
          id: memberId,
          input: {
            status: newStatus,
          },
        },
      });

      toast.success(
        newStatus === WorkspaceMemberStatus.DISABLED
          ? t("workspace-member:toast.disabled_success")
          : t("workspace-member:toast.enabled_success"),
      );
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <Page
      title={t("workspace-member:title")}
      description={t("workspace-member:description")}
      primaryAction={{
        label: t("workspace-member:invite.button"),
        onClick: () => setInviteOpen(true),
        testId: "workspace-members-invite-action",
      }}
    >
      <div className="mb-4" data-testid="workspace-members-page">
        <Filter
          filters={filters}
          values={filterValues}
          onChange={(values) => {
            navigate({
              to: location.pathname,
              search: {
                ...(query ? { query } : {}),
                ...(!isEmpty(values) ? { filter: values } : {}),
              },
            });
          }}
          search={{
            placeholder: t("workspace-member:filter.search.placeholder"),
            value: query,
            onChange: (value) => {
              navigate({
                to: location.pathname,
                search: {
                  ...(value ? { query: value } : {}),
                  ...(!isEmpty(filterValues) ? { filter: filterValues } : {}),
                },
              });
            },
          }}
        />
      </div>

      <DataTable
        columns={[
          {
            accessorKey: "name",
            header: t("workspace-member:table.name"),
            cell: ({ row }) => {
              const member = row.original;
              return (
                <div
                  data-testid={`workspace-member-row-${
                    member.email ?? member.user?.email ?? member.id
                  }`}
                  className={cn(
                    "flex flex-col",
                    currentWorkspaceMember.role ===
                      WorkspaceMemberRole.MEMBER &&
                      "pointer-events-none opacity-50",
                  )}
                >
                  <span className="font-medium">{member.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {truncateEmail(member.email ?? "") ?? "-"}
                  </span>
                </div>
              );
            },
          },
          {
            accessorKey: "role",
            header: t("workspace-member:table.role"),
            cell: ({ row }) => {
              return (
                <Badge variant="outline">
                  {getRoleLabel(row.original.role)}
                </Badge>
              );
            },
          },
          {
            accessorKey: "status",
            header: t("workspace-member:table.status"),
            cell: ({ row }) => {
              const status = row.original.status;

              const statusColorMap: Record<
                WorkspaceMemberStatus,
                "green" | "yellow" | "red" | "gray"
              > = {
                [WorkspaceMemberStatus.ACTIVE]: "green",
                [WorkspaceMemberStatus.INVITING]: "yellow",
                [WorkspaceMemberStatus.INVITE_EXPIRED]: "red",
                [WorkspaceMemberStatus.DISABLED]: "gray",
              };

              const color = status ? statusColorMap[status] : "green";

              return (
                <Badge
                  color={color}
                  data-testid={
                    status
                      ? `workspace-member-status-${status.toLowerCase()}`
                      : undefined
                  }
                >
                  {getStatusLabel(status)}
                </Badge>
              );
            },
          },
          {
            accessorKey: "createdAt",
            header: t("workspace-member:table.joined"),
            cell: ({ row }) => {
              return dayjs(row.original.createdAt).format("YYYY-MM-DD");
            },
          },
        ]}
        onRowClick={(row) => {
          navigate({
            to: "/workspaces/$workspaceId/members/$memberId",
            params: {
              workspaceId,
              memberId: row.original.id,
            },
          });
        }}
        rowActions={(row) => [
          ...(row.original.status === WorkspaceMemberStatus.ACTIVE ||
          row.original.status === WorkspaceMemberStatus.DISABLED
            ? [
                {
                  disabled: updateStatusLoading,
                  label:
                    row.original.status === WorkspaceMemberStatus.DISABLED
                      ? t("action.enable")
                      : t("action.disable"),
                  onClick: () =>
                    handleToggleMemberStatus(
                      row.original.id,
                      row.original.status,
                    ),
                },
              ]
            : []),
          {
            disabled: removeMemberLoading,
            label: t("action.delete"),
            onClick: () => handleRemoveMemberClick(row.original.id),
          },
        ]}
        data={members}
        pagination={{
          hasPreviousPage: pageInfo?.hasPreviousPage,
          hasNextPage: pageInfo?.hasNextPage,
          onPreviousPage: () => {
            navigate({
              to: location.pathname,
              search: getPreviousPageSearch(search, pageInfo),
            });
          },
          onNextPage: () => {
            navigate({
              to: location.pathname,
              search: getNextPageSearch(search, pageInfo),
            });
          },
        }}
      />

      <InviteMemberDialog
        inviteOpen={inviteOpen}
        onInviteOpenChange={setInviteOpen}
        onSuccess={() => {
          refetch();
        }}
      />
    </Page>
  );
}
