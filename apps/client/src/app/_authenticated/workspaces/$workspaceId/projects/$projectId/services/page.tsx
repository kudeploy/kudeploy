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
import { ServerCog } from "lucide-react";
import { t } from "i18next";
import { toast } from "sonner";
import z from "zod";

import {
  ServiceForm,
  initialServiceFormValue,
  toServiceInput,
} from "../../components/service-form";
import { ProjectTabs } from "../../components/project-tabs";
import { StatusBadge } from "../../components/status-badge";
import type { DataFilterItemProps as FilterItemProps } from "@/components/fabric-ui/data-filter";
import type { GetServicesFromServicesRouteQuery } from "@/gql/graphql";
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
import { ServiceOrderField } from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";

const GET_SERVICES_FROM_SERVICES_ROUTE = graphql(`
  query getServicesFromServicesRoute(
    $projectId: ID!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: ServiceFilter
    $orderBy: ServiceOrder
    $query: String
  ) {
    project(id: $projectId) {
      id
      name
    }
    services(
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
          image
          replicas
          status
          createdAt
          ports {
            port
            targetPort
          }
          env {
            key
            value
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

const CREATE_SERVICE_FROM_SERVICES_ROUTE = graphql(`
  mutation createServiceFromServicesRoute($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      projectId
      name
      image
      replicas
      command
      args
      resources {
        cpuRequest
        cpuLimit
        memoryRequest
        memoryLimit
      }
      healthCheck {
        type
        port
        path
      }
      status
      createdAt
      ports {
        port
        targetPort
      }
      env {
        key
        value
      }
    }
  }
`);

const DELETE_SERVICE_FROM_SERVICES_ROUTE = graphql(`
  mutation deleteServiceFromServicesRoute($projectId: ID!, $id: ID!) {
    deleteService(projectId: $projectId, id: $id) {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/",
)({
  component: ServicesComponent,
  beforeLoad: () => {
    return { title: null };
  },
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
        })
        .optional(),
      pageSize: 20,
      orderField: ServiceOrderField,
      defaultOrderField: ServiceOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

type ServiceRow =
  GetServicesFromServicesRouteQuery["services"]["edges"][number]["node"];

function ServicesComponent() {
  const { workspaceId, projectId } = Route.useParams();
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState(initialServiceFormValue());

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const { data, refetch } = useQuery(GET_SERVICES_FROM_SERVICES_ROUTE, {
    variables: {
      projectId,
      ...pick(search, ["after", "before", "first", "last"]),
      query,
      filter: formatFilterValues(filterValues, (field, value) => {
        if (field === "name") {
          return { $fulltext: value };
        }
        return value;
      }),
      orderBy: {
        field: search?.orderBy?.field ?? ServiceOrderField.CREATED_AT,
        direction: search?.orderBy?.direction ?? OrderDirection.DESC,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [createService, { loading: createLoading }] = useMutation(
    CREATE_SERVICE_FROM_SERVICES_ROUTE,
  );
  const [deleteService, { loading: deleteLoading }] = useMutation(
    DELETE_SERVICE_FROM_SERVICES_ROUTE,
  );

  const services = data?.services.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.services.pageInfo;

  const filters: Array<FilterItemProps> = useMemo(
    () => [
      {
        label: t("service:filter.name.label"),
        field: "name",
        pinned: true,
        render: ({ field: { value, onChange } }) => (
          <Input
            defaultValue={value}
            placeholder={t("service:filter.name.placeholder")}
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

  const handleCreateService = async () => {
    const input = toServiceInput(serviceForm);

    if (!input.name) {
      toast.error(t("service:form.name.required"));
      return;
    }

    if (!input.image) {
      toast.error(t("service:form.image.required"));
      return;
    }

    if (input.ports.length === 0) {
      toast.error(t("service:form.ports"));
      return;
    }

    if (
      serviceForm.healthCheck.enabled &&
      serviceForm.healthCheck.port === ""
    ) {
      toast.error(t("service:form.health_check_port_required"));
      return;
    }

    try {
      const result = await createService({
        variables: {
          input: {
            projectId,
            ...input,
          },
        },
      });
      const service = result.data?.createService;

      if (service) {
        toast.success(t("service:toast.created"));
        setCreateDialogOpen(false);
        setServiceForm(initialServiceFormValue());
        await refetch();
        navigate({
          to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId",
          params: { workspaceId, projectId, serviceId: service.id },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteService = async (service: ServiceRow) => {
    const confirmed = await alertDialog({
      title: t("service:delete.title"),
      description: t("service:delete.description", { name: service.name }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteService({ variables: { projectId, id: service.id } });
      await refetch();
      toast.success(t("service:toast.deleted"));
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
        title={t("service:title")}
        description={t("service:description")}
        primaryAction={{
          icon: <ServerCog data-icon="inline-start" />,
          label: t("service:create.button"),
          onClick: () => setCreateDialogOpen(true),
          testId: "service-create-action",
        }}
      >
        <div className="mb-4" data-testid="services-page">
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
              placeholder: t("service:filter.search.placeholder"),
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
              header: t("service:table.name"),
              cell: ({ row }) => (
                <span
                  className="font-medium"
                  data-testid={`service-row-${row.original.id}`}
                >
                  {row.original.name}
                </span>
              ),
            },
            {
              accessorKey: "status",
              header: t("service:table.status"),
              size: 130,
              cell: ({ row }) => (
                <StatusBadge namespace="service" status={row.original.status} />
              ),
            },
            {
              accessorKey: "image",
              header: t("service:table.image"),
              cell: ({ row }) => (
                <span className="text-muted-foreground line-clamp-1 text-xs break-all">
                  {row.original.image}
                </span>
              ),
            },
            {
              accessorKey: "replicas",
              header: t("service:table.replicas"),
              size: 100,
              cell: ({ row }) => row.original.replicas ?? "-",
            },
            {
              accessorKey: "ports",
              header: t("service:table.ports"),
              cell: ({ row }) =>
                row.original.ports
                  .map((port) =>
                    port.targetPort
                      ? `${port.port}:${port.targetPort}`
                      : port.port,
                  )
                  .join(", "),
            },
            {
              accessorKey: "createdAt",
              header: t("service:table.created_at"),
              cell: ({ row }) =>
                dayjs(row.original.createdAt).format("YYYY-MM-DD HH:mm"),
            },
          ]}
          data={services}
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
                  to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId",
                  params: {
                    workspaceId,
                    projectId,
                    serviceId: row.original.id,
                  },
                }),
            },
            {
              disabled: deleteLoading,
              label: t("action.delete"),
              onClick: () => handleDeleteService(row.original),
            },
          ]}
          onRowClick={(row) =>
            navigate({
              to: "/workspaces/$workspaceId/projects/$projectId/services/$serviceId",
              params: { workspaceId, projectId, serviceId: row.original.id },
            })
          }
        />

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("service:create.title")}</DialogTitle>
              <DialogDescription>
                {t("service:create.description")}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateService();
              }}
            >
              <div className="py-4">
                <ServiceForm value={serviceForm} onChange={setServiceForm} />
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
                  data-testid="service-create-submit"
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
    </>
  );
}
