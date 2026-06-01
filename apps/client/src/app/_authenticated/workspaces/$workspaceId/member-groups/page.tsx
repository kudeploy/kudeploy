import { useQuery } from "@apollo/client/react";
import {
  Link,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import dayjs from "dayjs";
import { t } from "i18next";

import z from "zod";
import { isEmpty, pick } from "lodash";
import { useMemo } from "react";
import { zhCN } from "react-day-picker/locale";
import { useCurrentWorkspaceMemberContext } from "../contexts/current-workspace-member-context";
import type { DataFilterItemProps as FilterItemProps } from "@/components/fabric-ui/data-filter";
import { DataFilter as Filter } from "@/components/fabric-ui/data-filter";
import { Page } from "@/components/fabric-ui/page";
import { DataTable } from "@/components/fabric-ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { graphql } from "@/gql";
import {
  WorkspaceMemberGroupOrderField,
  WorkspaceMemberRole,
} from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";
import { formatFilterValues } from "@/components/fabric-ui/data-filter/format-filter-values";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

export const GET_WORKSPACE_MEMBER_GROUPS_FROM_MEMBER_GROUPS_ROUTE = graphql(`
  query getWorkspaceMemberGroupsFromMemberGroupsRoute(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: WorkspaceMemberGroupFilter
    $orderBy: WorkspaceMemberGroupOrder
    $query: String
  ) {
    workspaceMemberGroups(
      after: $after
      before: $before
      first: $first
      last: $last
      filter: $filter
      orderBy: $orderBy
      query: $query
    ) {
      edges {
        node {
          id
          name
          description
          createdAt
        }
        cursor
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

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/member-groups/",
)({
  component: MemberGroupsComponent,
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
          created_at: z.array(z.string().datetime()).length(2).optional(),
        })
        .optional(),
      pageSize: 20,
      orderField: WorkspaceMemberGroupOrderField,
      defaultOrderField: WorkspaceMemberGroupOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

function MemberGroupsComponent() {
  const search = Route.useSearch();
  const { workspaceId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentWorkspaceMember = useCurrentWorkspaceMemberContext();

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const { data } = useQuery(
    GET_WORKSPACE_MEMBER_GROUPS_FROM_MEMBER_GROUPS_ROUTE,
    {
      variables: {
        ...pick(search, ["after", "before", "first", "last"]),
        query,
        filter: formatFilterValues(filterValues, (field, value) => {
          switch (field) {
            case "name":
              return { $fulltext: value };
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
          field:
            search?.orderBy?.field ?? WorkspaceMemberGroupOrderField.CREATED_AT,
          direction: search?.orderBy?.direction ?? OrderDirection.DESC,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const memberGroups =
    data?.workspaceMemberGroups.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.workspaceMemberGroups.pageInfo;

  const canCreateAndViewDetail = [
    WorkspaceMemberRole.OWNER,
    WorkspaceMemberRole.ADMIN,
  ].includes(currentWorkspaceMember.role);

  const filters: Array<FilterItemProps> = useMemo(() => {
    return [
      {
        label: t("workspace-member-group:filter.items.name.label"),
        field: "name",
        pinned: true,
        render: ({ field: { value, onChange } }) => {
          return (
            <Input
              placeholder={t(
                "workspace-member-group:filter.items.name.placeholder",
              )}
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
        label: t("workspace-member-group:filter.items.created_at.label"),
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

  return (
    <Page
      title={t("workspace-member-group:title")}
      primaryAction={
        canCreateAndViewDetail
          ? {
              label: t("action.create"),
              testId: "member-group-create-action",
              render: (
                <Link
                  to="/workspaces/$workspaceId/member-groups/create"
                  params={{ workspaceId }}
                />
              ),
            }
          : undefined
      }
    >
      <div className="mb-4" data-testid="member-groups-page">
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
            placeholder: t("workspace-member-group:filter.search.placeholder"),
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
            header: t("workspace-member-group:table.name"),
            cell: ({ row }) => {
              const memberGroup = row.original;
              return (
                <span data-testid={`member-group-row-${memberGroup.name}`}>
                  {memberGroup.name}
                </span>
              );
            },
          },
          {
            accessorKey: "description",
            header: t("workspace-member-group:table.description"),
            cell: ({ row }) => {
              const description = row.original.description;

              if (!description) {
                return (
                  <span className="text-muted-foreground">{description}</span>
                );
              }

              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div className="line-clamp-1 max-w-[200px] truncate">
                          {description}
                        </div>
                      }
                    />
                    <TooltipContent>
                      <p className="max-w-md wrap-break-word">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            },
          },
          {
            accessorKey: "createdAt",
            header: t("workspace-member-group:table.createdAt"),
            cell: ({ row }) => {
              return row.original.createdAt
                ? dayjs(row.original.createdAt).format("YYYY-MM-DD")
                : "-";
            },
          },
        ]}
        onRowClick={
          canCreateAndViewDetail
            ? (row) => {
                navigate({
                  to: "/workspaces/$workspaceId/member-groups/$memberGroupId",
                  params: {
                    workspaceId,
                    memberGroupId: row.original.id,
                  },
                });
              }
            : undefined
        }
        rowActions={
          canCreateAndViewDetail
            ? (row) => [
                {
                  label: t("action.edit"),
                  onClick: () => {
                    navigate({
                      to: "/workspaces/$workspaceId/member-groups/$memberGroupId",
                      params: {
                        workspaceId,
                        memberGroupId: row.original.id,
                      },
                    });
                  },
                },
              ]
            : undefined
        }
        data={memberGroups}
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
    </Page>
  );
}
