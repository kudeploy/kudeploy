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
import { Database } from "lucide-react";
import { t } from "i18next";
import { toast } from "sonner";
import z from "zod";

import { formatVolumeFilterValue } from "./volume-filter";
import type { DataFilterItemProps as FilterItemProps } from "@/components/thread-ui/data-filter";
import type { GetVolumesFromProjectVolumesRouteQuery } from "@/gql/graphql";
import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Badge } from "@/components/thread-ui/badge";
import { Button } from "@/components/thread-ui/button";
import { DataFilter as Filter } from "@/components/thread-ui/data-filter";
import { formatFilterValues } from "@/lib/format-filter-values";
import { DataTable } from "@/components/thread-ui/data-table";
import { Input } from "@/components/thread-ui/input";
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PagePrimaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { graphql } from "@/gql";
import { VolumeOrderField, VolumeStatus } from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";

const GET_VOLUMES_FROM_PROJECT_VOLUMES_ROUTE = graphql(`
  query getVolumesFromProjectVolumesRoute(
    $projectId: ID!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: VolumeFilter
    $orderBy: VolumeOrder
    $query: String
  ) {
    project(id: $projectId) {
      id
      name
    }
    volumes(
      projectId: $projectId
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
          projectId
          name
          size
          status
          createdAt
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

const CREATE_VOLUME_FROM_PROJECT_VOLUMES_ROUTE = graphql(`
  mutation createVolumeFromProjectVolumesRoute($input: CreateVolumeInput!) {
    createVolume(input: $input) {
      id
      projectId
      name
      size
      status
      createdAt
    }
  }
`);

const DELETE_VOLUME_FROM_PROJECT_VOLUMES_ROUTE = graphql(`
  mutation deleteVolumeFromProjectVolumesRoute($projectId: ID!, $id: ID!) {
    deleteVolume(projectId: $projectId, id: $id) {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/_project_layout/volumes/",
)({
  component: ProjectVolumesComponent,
  beforeLoad: () => ({ title: null }),
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
        })
        .optional(),
      pageSize: 20,
      orderField: VolumeOrderField,
      defaultOrderField: VolumeOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

type VolumeRow =
  GetVolumesFromProjectVolumesRouteQuery["volumes"]["edges"][number]["node"];

type VolumeFormValue = {
  name: string;
  size: string;
};

const volumeStatusColors = {
  [VolumeStatus.BOUND]: "green",
  [VolumeStatus.LOST]: "red",
  [VolumeStatus.PENDING]: "slate",
  [VolumeStatus.UNKNOWN]: "gray",
} as const;

function ProjectVolumesComponent() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [volumeForm, setVolumeForm] = useState(initialVolumeFormValue());

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const { data, refetch } = useQuery(GET_VOLUMES_FROM_PROJECT_VOLUMES_ROUTE, {
    variables: {
      projectId,
      ...pick(search, ["after", "before", "first", "last"]),
      query,
      filter: formatFilterValues(filterValues, formatVolumeFilterValue),
      orderBy: {
        field: search?.orderBy?.field ?? VolumeOrderField.CREATED_AT,
        direction: search?.orderBy?.direction ?? OrderDirection.DESC,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [createVolume, { loading: createLoading }] = useMutation(
    CREATE_VOLUME_FROM_PROJECT_VOLUMES_ROUTE,
  );
  const [deleteVolume, { loading: deleteLoading }] = useMutation(
    DELETE_VOLUME_FROM_PROJECT_VOLUMES_ROUTE,
  );

  const volumes = data?.volumes.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.volumes.pageInfo;

  const filters: Array<FilterItemProps> = useMemo(
    () => [
      {
        label: t("project:volumes.filter.name.label"),
        field: "name",
        type: "input",
        pinned: true,
        render: ({ field: { value, onChange } }) => (
          <Input
            defaultValue={value ?? ""}
            placeholder={t("project:volumes.filter.name.placeholder")}
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

  const handleCreateVolume = async () => {
    const input = toVolumeInput(volumeForm);

    if (!input.name) {
      toast.error(t("project:volumes.form.name.required"));
      return;
    }

    if (!Number.isInteger(input.size) || input.size < 1) {
      toast.error(t("project:volumes.form.size.required"));
      return;
    }

    try {
      await createVolume({
        variables: {
          input: {
            projectId,
            ...input,
          },
        },
      });
      toast.success(t("project:volumes.toast.created"));
      setCreateDialogOpen(false);
      setVolumeForm(initialVolumeFormValue());
      await refetch();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteVolume = async (volume: VolumeRow) => {
    const confirmed = await alertDialog({
      title: t("project:volumes.delete.title"),
      description: t("project:volumes.delete.description", {
        name: volume.name,
      }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteVolume({ variables: { projectId, id: volume.id } });
      await refetch();
      toast.success(t("project:volumes.toast.deleted"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("project:volumes.title")}</PageTitle>
        <PageDescription>{t("project:volumes.description")}</PageDescription>
        <PageActions>
          <PagePrimaryAction
            data-testid="volume-create-action"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Database data-icon="inline-start" />
            {t("project:volumes.create.button")}
          </PagePrimaryAction>
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="mb-4" data-testid="project-volumes-page">
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
              placeholder: t("project:volumes.filter.search.placeholder"),
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
              header: t("project:volumes.table.name"),
              cell: ({ row }) => (
                <span
                  className="font-medium"
                  data-testid={`volume-row-${row.original.id}`}
                >
                  {row.original.name}
                </span>
              ),
            },
            {
              accessorKey: "status",
              header: t("project:volumes.table.status"),
              size: 130,
              cell: ({ row }) => (
                <Badge
                  color={volumeStatusColors[row.original.status]}
                  data-testid="volume-status"
                >
                  {t(`project:volumes.status.${row.original.status}`)}
                </Badge>
              ),
            },
            {
              accessorKey: "size",
              header: t("project:volumes.table.size"),
              size: 120,
              cell: ({ row }) => `${row.original.size}Gi`,
            },
            {
              accessorKey: "createdAt",
              header: t("project:volumes.table.created_at"),
              cell: ({ row }) =>
                dayjs(row.original.createdAt).format("YYYY-MM-DD HH:mm"),
            },
          ]}
          data={volumes}
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
              disabled: deleteLoading,
              label: t("action.delete"),
              onClick: () => handleDeleteVolume(row.original),
            },
          ]}
        />

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("project:volumes.create.title")}</DialogTitle>
              <DialogDescription>
                {t("project:volumes.create.description")}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateVolume();
              }}
            >
              <div className="grid gap-4 py-4">
                <Input
                  data-testid="volume-name-input"
                  label={t("project:volumes.form.name.label")}
                  placeholder={t("project:volumes.form.name.placeholder")}
                  value={volumeForm.name}
                  onChange={(event) =>
                    setVolumeForm({ ...volumeForm, name: event.target.value })
                  }
                />
                <Input
                  data-testid="volume-size-input"
                  label={t("project:volumes.form.size.label")}
                  min={1}
                  placeholder={t("project:volumes.form.size.placeholder")}
                  type="number"
                  value={volumeForm.size}
                  onChange={(event) =>
                    setVolumeForm({ ...volumeForm, size: event.target.value })
                  }
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
                  data-testid="volume-create-submit"
                  loading={createLoading}
                  type="submit"
                >
                  {t("action.create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageContent>
    </Page>
  );
}

function initialVolumeFormValue(): VolumeFormValue {
  return {
    name: "",
    size: "",
  };
}

function toVolumeInput(value: VolumeFormValue) {
  return {
    name: value.name.trim(),
    size: Number(value.size),
  };
}
