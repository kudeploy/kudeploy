import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import dayjs from "dayjs";
import { isEmpty, pick } from "lodash";
import { FolderPlus } from "lucide-react";
import { t } from "i18next";
import { toast } from "sonner";
import z from "zod";

import { StatusBadge } from "./components/status-badge";
import type { DataFilterItemProps as FilterItemProps } from "@/components/fabric-ui/data-filter";
import type { GetProjectsFromProjectsRouteQuery } from "@/gql/graphql";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Button } from "@/components/fabric-ui/button";
import { DataFilter as Filter } from "@/components/fabric-ui/data-filter";
import { formatFilterValues } from "@/components/fabric-ui/data-filter/format-filter-values";
import { DataTable } from "@/components/fabric-ui/data-table";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { graphql } from "@/gql";
import { ProjectOrderField } from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";

const GET_PROJECTS_FROM_PROJECTS_ROUTE = graphql(`
  query getProjectsFromProjectsRoute(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: ProjectFilter
    $orderBy: ProjectOrder
    $query: String
  ) {
    projects(
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
          status
          createdAt
          updatedAt
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

const CREATE_PROJECT_FROM_PROJECTS_ROUTE = graphql(`
  mutation createProjectFromProjectsRoute($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      status
      createdAt
      updatedAt
    }
  }
`);

const DELETE_PROJECT_FROM_PROJECTS_ROUTE = graphql(`
  mutation deleteProjectFromProjectsRoute($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/",
)({
  component: ProjectsComponent,
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
        })
        .optional(),
      pageSize: 20,
      orderField: ProjectOrderField,
      defaultOrderField: ProjectOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

type ProjectRow =
  GetProjectsFromProjectsRouteQuery["projects"]["edges"][number]["node"];

function ProjectsComponent() {
  const { workspaceId } = Route.useParams();
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const { data, refetch } = useQuery(GET_PROJECTS_FROM_PROJECTS_ROUTE, {
    variables: {
      ...pick(search, ["after", "before", "first", "last"]),
      query,
      filter: formatFilterValues(filterValues, (field, value) => {
        if (field === "name") {
          return { $fulltext: value };
        }
        return value;
      }),
      orderBy: {
        field: search?.orderBy?.field ?? ProjectOrderField.CREATED_AT,
        direction: search?.orderBy?.direction ?? OrderDirection.DESC,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [createProject, { loading: createLoading }] = useMutation(
    CREATE_PROJECT_FROM_PROJECTS_ROUTE,
  );
  const [deleteProject, { loading: deleteLoading }] = useMutation(
    DELETE_PROJECT_FROM_PROJECTS_ROUTE,
  );

  const projects = data?.projects.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.projects.pageInfo;

  const filters: Array<FilterItemProps> = useMemo(
    () => [
      {
        label: t("project:filter.name.label"),
        field: "name",
        pinned: true,
        render: ({ field: { value, onChange } }) => (
          <Input
            defaultValue={value}
            placeholder={t("project:filter.name.placeholder")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onChange?.((event.target as HTMLInputElement).value);
              }
            }}
          />
        ),
      },
    ],
    [],
  );

  const handleCreateProject = async () => {
    const name = newProjectName.trim();

    if (!name) {
      toast.error(t("project:form.name.required"));
      return;
    }

    try {
      const result = await createProject({
        variables: {
          input: { name },
        },
      });
      const project = result.data?.createProject;

      if (project) {
        toast.success(t("project:toast.created"));
        setCreateDialogOpen(false);
        setNewProjectName("");
        await refetch();
        navigate({
          to: "/workspaces/$workspaceId/projects/$projectId",
          params: { workspaceId, projectId: project.id },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteProject = async (project: ProjectRow) => {
    const confirmed = await alertDialog({
      title: t("project:delete.title"),
      description: t("project:delete.description", { name: project.name }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteProject({ variables: { id: project.id } });
      await refetch();
      toast.success(t("project:toast.deleted"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Page
      title={t("project:title")}
      description={t("project:description")}
      primaryAction={{
        icon: <FolderPlus data-icon="inline-start" />,
        label: t("project:create.button"),
        onClick: () => setCreateDialogOpen(true),
        testId: "project-create-action",
      }}
    >
      <div className="mb-4" data-testid="projects-page">
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
            placeholder: t("project:filter.search.placeholder"),
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
            header: t("project:table.name"),
            cell: ({ row }) => (
              <span
                className="font-medium"
                data-testid={`project-row-${row.original.id}`}
              >
                {row.original.name}
              </span>
            ),
          },
          {
            accessorKey: "status",
            header: t("project:table.status"),
            size: 130,
            cell: ({ row }) => (
              <StatusBadge namespace="project" status={row.original.status} />
            ),
          },
          {
            accessorKey: "createdAt",
            header: t("project:table.created_at"),
            cell: ({ row }) =>
              dayjs(row.original.createdAt).format("YYYY-MM-DD HH:mm"),
          },
        ]}
        data={projects}
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
        rowActions={(row) => [
          {
            label: t("action.edit"),
            onClick: () =>
              navigate({
                to: "/workspaces/$workspaceId/projects/$projectId",
                params: { workspaceId, projectId: row.original.id },
              }),
          },
          {
            disabled: deleteLoading,
            label: t("action.delete"),
            onClick: () => handleDeleteProject(row.original),
          },
        ]}
        onRowClick={(row) =>
          navigate({
            to: "/workspaces/$workspaceId/projects/$projectId",
            params: { workspaceId, projectId: row.original.id },
          })
        }
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("project:create.title")}</DialogTitle>
            <DialogDescription>
              {t("project:create.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateProject();
            }}
          >
            <div className="py-4">
              <Input
                autoFocus
                data-testid="project-name-input"
                label={t("project:form.name.label")}
                placeholder={t("project:form.name.placeholder")}
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {t("action.cancel")}
              </Button>
              <Button
                data-testid="project-create-submit"
                loading={createLoading}
                type="submit"
              >
                {t("action.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
