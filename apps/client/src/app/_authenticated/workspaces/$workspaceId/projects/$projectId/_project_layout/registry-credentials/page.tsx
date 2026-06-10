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
import { KeyRound } from "lucide-react";
import { t } from "i18next";
import { toast } from "sonner";
import z from "zod";

import type { DataFilterItemProps as FilterItemProps } from "@/components/fabric-ui/data-filter";
import type { GetRegistryCredentialsFromProjectRegistryCredentialsRouteQuery } from "@/gql/graphql";
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
import { RegistryCredentialOrderField } from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";

const GET_REGISTRY_CREDENTIALS_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE =
  graphql(`
    query getRegistryCredentialsFromProjectRegistryCredentialsRoute(
      $projectId: ID!
      $after: String
      $before: String
      $first: Int
      $last: Int
      $filter: RegistryCredentialFilter
      $orderBy: RegistryCredentialOrder
      $query: String
    ) {
      project(id: $projectId) {
        id
        name
      }
      registryCredentials(
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
            registry
            username
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

const CREATE_REGISTRY_CREDENTIAL_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE =
  graphql(`
    mutation createRegistryCredentialFromProjectRegistryCredentialsRoute(
      $input: CreateRegistryCredentialInput!
    ) {
      createRegistryCredential(input: $input) {
        id
        projectId
        name
        registry
        username
        createdAt
        updatedAt
      }
    }
  `);

const UPDATE_REGISTRY_CREDENTIAL_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE =
  graphql(`
    mutation updateRegistryCredentialFromProjectRegistryCredentialsRoute(
      $projectId: ID!
      $id: ID!
      $input: UpdateRegistryCredentialInput!
    ) {
      updateRegistryCredential(projectId: $projectId, id: $id, input: $input) {
        id
        projectId
        name
        registry
        username
        createdAt
        updatedAt
      }
    }
  `);

const DELETE_REGISTRY_CREDENTIAL_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE =
  graphql(`
    mutation deleteRegistryCredentialFromProjectRegistryCredentialsRoute(
      $projectId: ID!
      $id: ID!
    ) {
      deleteRegistryCredential(projectId: $projectId, id: $id) {
        id
      }
    }
  `);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/_project_layout/registry-credentials/",
)({
  component: ProjectRegistryCredentialsComponent,
  beforeLoad: () => ({ title: null }),
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
          registry: z.string().max(255).optional().catch(undefined),
        })
        .optional(),
      pageSize: 20,
      orderField: RegistryCredentialOrderField,
      defaultOrderField: RegistryCredentialOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

type RegistryCredentialRow =
  GetRegistryCredentialsFromProjectRegistryCredentialsRouteQuery["registryCredentials"]["edges"][number]["node"];

type RegistryCredentialFormValue = {
  name: string;
  registry: string;
  username: string;
  password: string;
};

function ProjectRegistryCredentialsComponent() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] =
    useState<RegistryCredentialRow | null>(null);
  const [registryCredentialForm, setRegistryCredentialForm] = useState(
    initialRegistryCredentialFormValue(),
  );

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const { data, refetch } = useQuery(
    GET_REGISTRY_CREDENTIALS_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE,
    {
      variables: {
        projectId,
        ...pick(search, ["after", "before", "first", "last"]),
        query,
        filter: formatFilterValues(
          filterValues,
          formatRegistryCredentialFilterValue,
        ),
        orderBy: {
          field:
            search?.orderBy?.field ?? RegistryCredentialOrderField.CREATED_AT,
          direction: search?.orderBy?.direction ?? OrderDirection.DESC,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const [createRegistryCredential, { loading: createLoading }] = useMutation(
    CREATE_REGISTRY_CREDENTIAL_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE,
  );
  const [updateRegistryCredential, { loading: updateLoading }] = useMutation(
    UPDATE_REGISTRY_CREDENTIAL_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE,
  );
  const [deleteRegistryCredential, { loading: deleteLoading }] = useMutation(
    DELETE_REGISTRY_CREDENTIAL_FROM_PROJECT_REGISTRY_CREDENTIALS_ROUTE,
  );

  const registryCredentials =
    data?.registryCredentials.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.registryCredentials.pageInfo;

  const filters: Array<FilterItemProps> = useMemo(
    () => [
      {
        label: t("project:registry_credentials.filter.name.label"),
        field: "name",
        pinned: true,
        render: ({ field: { value, onChange } }) => (
          <Input
            defaultValue={value}
            placeholder={t(
              "project:registry_credentials.filter.name.placeholder",
            )}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onChange?.((event.target as HTMLInputElement).value);
              }
            }}
          />
        ),
      },
      {
        label: t("project:registry_credentials.filter.registry.label"),
        field: "registry",
        render: ({ field: { value, onChange } }) => (
          <Input
            defaultValue={value}
            placeholder={t(
              "project:registry_credentials.filter.registry.placeholder",
            )}
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

  const handleCreateDialogOpenChange = (open: boolean) => {
    if (!open) {
      setRegistryCredentialForm(initialRegistryCredentialFormValue());
    }
    setCreateDialogOpen(open);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      setRegistryCredentialForm(initialRegistryCredentialFormValue());
      setEditingCredential(null);
    }
    setEditDialogOpen(open);
  };

  const handleOpenEdit = (registryCredential: RegistryCredentialRow) => {
    setEditingCredential(registryCredential);
    setRegistryCredentialForm({
      name: registryCredential.name,
      registry: registryCredential.registry,
      username: registryCredential.username,
      password: "",
    });
    setEditDialogOpen(true);
  };

  const handleCreateRegistryCredential = async () => {
    const input = toCreateRegistryCredentialInput(registryCredentialForm);

    if (!validateRegistryCredentialForm(registryCredentialForm, true)) {
      return;
    }

    try {
      await createRegistryCredential({
        variables: {
          input: {
            projectId,
            ...input,
          },
        },
      });
      toast.success(t("project:registry_credentials.toast.created"));
      handleCreateDialogOpenChange(false);
      await refetch();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleUpdateRegistryCredential = async () => {
    if (!editingCredential) return;

    const input = toUpdateRegistryCredentialInput(registryCredentialForm);

    if (!validateRegistryCredentialForm(registryCredentialForm, false)) {
      return;
    }

    try {
      await updateRegistryCredential({
        variables: {
          projectId,
          id: editingCredential.id,
          input,
        },
      });
      toast.success(t("project:registry_credentials.toast.updated"));
      handleEditDialogOpenChange(false);
      await refetch();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteRegistryCredential = async (
    registryCredential: RegistryCredentialRow,
  ) => {
    const confirmed = await alertDialog({
      title: t("project:registry_credentials.delete.title"),
      description: t("project:registry_credentials.delete.description", {
        name: registryCredential.name,
      }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteRegistryCredential({
        variables: { projectId, id: registryCredential.id },
      });
      await refetch();
      toast.success(t("project:registry_credentials.toast.deleted"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Page
      title={t("project:registry_credentials.title")}
      description={t("project:registry_credentials.description")}
      primaryAction={{
        icon: <KeyRound data-icon="inline-start" />,
        label: t("project:registry_credentials.create.button"),
        onClick: () => setCreateDialogOpen(true),
        testId: "registry-credential-create-action",
      }}
    >
      <div className="mb-4" data-testid="project-registry-credentials-page">
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
            placeholder: t(
              "project:registry_credentials.filter.search.placeholder",
            ),
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
            header: t("project:registry_credentials.table.name"),
            cell: ({ row }) => (
              <span
                className="font-medium"
                data-testid={`registry-credential-row-${row.original.id}`}
              >
                {row.original.name}
              </span>
            ),
          },
          {
            accessorKey: "registry",
            header: t("project:registry_credentials.table.registry"),
            cell: ({ row }) => (
              <span className="text-muted-foreground line-clamp-1 text-xs break-all">
                {row.original.registry}
              </span>
            ),
          },
          {
            accessorKey: "username",
            header: t("project:registry_credentials.table.username"),
          },
          {
            accessorKey: "createdAt",
            header: t("project:registry_credentials.table.created_at"),
            cell: ({ row }) =>
              dayjs(row.original.createdAt).format("YYYY-MM-DD HH:mm"),
          },
        ]}
        data={registryCredentials}
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
            disabled: updateLoading,
            label: t("action.edit"),
            onClick: () => handleOpenEdit(row.original),
          },
          {
            disabled: deleteLoading,
            label: t("action.delete"),
            onClick: () => handleDeleteRegistryCredential(row.original),
          },
        ]}
      />

      <Dialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("project:registry_credentials.create.title")}
            </DialogTitle>
            <DialogDescription>
              {t("project:registry_credentials.create.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateRegistryCredential();
            }}
          >
            <RegistryCredentialFormFields
              mode="create"
              value={registryCredentialForm}
              onChange={setRegistryCredentialForm}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogOpenChange(false)}
              >
                {t("action.cancel")}
              </Button>
              <Button
                data-testid="registry-credential-create-submit"
                loading={createLoading}
                type="submit"
              >
                {t("action.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("project:registry_credentials.edit.title")}
            </DialogTitle>
            <DialogDescription>
              {t("project:registry_credentials.edit.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleUpdateRegistryCredential();
            }}
          >
            <RegistryCredentialFormFields
              mode="edit"
              value={registryCredentialForm}
              onChange={setRegistryCredentialForm}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditDialogOpenChange(false)}
              >
                {t("action.cancel")}
              </Button>
              <Button
                data-testid="registry-credential-edit-submit"
                loading={updateLoading}
                type="submit"
              >
                {t("action.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

function RegistryCredentialFormFields({
  mode,
  value,
  onChange,
}: {
  mode: "create" | "edit";
  value: RegistryCredentialFormValue;
  onChange: (value: RegistryCredentialFormValue) => void;
}) {
  return (
    <div className="grid gap-4 py-4">
      <Input
        data-testid="registry-credential-name-input"
        label={t("project:registry_credentials.form.name.label")}
        placeholder={t("project:registry_credentials.form.name.placeholder")}
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />
      <Input
        data-testid="registry-credential-registry-input"
        label={t("project:registry_credentials.form.registry.label")}
        placeholder={t(
          "project:registry_credentials.form.registry.placeholder",
        )}
        value={value.registry}
        onChange={(event) =>
          onChange({ ...value, registry: event.target.value })
        }
      />
      <Input
        data-testid="registry-credential-username-input"
        label={t("project:registry_credentials.form.username.label")}
        placeholder={t(
          "project:registry_credentials.form.username.placeholder",
        )}
        value={value.username}
        onChange={(event) =>
          onChange({ ...value, username: event.target.value })
        }
      />
      <Input
        data-testid="registry-credential-password-input"
        description={
          mode === "edit"
            ? t("project:registry_credentials.form.password.description")
            : undefined
        }
        label={t("project:registry_credentials.form.password.label")}
        placeholder={t(
          `project:registry_credentials.form.password.${mode}_placeholder`,
        )}
        type="password"
        value={value.password}
        onChange={(event) =>
          onChange({ ...value, password: event.target.value })
        }
      />
    </div>
  );
}

function initialRegistryCredentialFormValue(): RegistryCredentialFormValue {
  return {
    name: "",
    registry: "",
    username: "",
    password: "",
  };
}

function validateRegistryCredentialForm(
  value: RegistryCredentialFormValue,
  requirePassword: boolean,
) {
  if (!value.name.trim()) {
    toast.error(t("project:registry_credentials.form.name.required"));
    return false;
  }

  if (!value.registry.trim()) {
    toast.error(t("project:registry_credentials.form.registry.required"));
    return false;
  }

  if (!value.username.trim()) {
    toast.error(t("project:registry_credentials.form.username.required"));
    return false;
  }

  if (requirePassword && !value.password) {
    toast.error(t("project:registry_credentials.form.password.required"));
    return false;
  }

  return true;
}

function toCreateRegistryCredentialInput(value: RegistryCredentialFormValue) {
  return {
    name: value.name.trim(),
    registry: value.registry.trim(),
    username: value.username.trim(),
    password: value.password,
  };
}

function toUpdateRegistryCredentialInput(value: RegistryCredentialFormValue) {
  return {
    name: value.name.trim(),
    registry: value.registry.trim(),
    username: value.username.trim(),
    ...(value.password ? { password: value.password } : {}),
  };
}

function formatRegistryCredentialFilterValue(field: string, value: unknown) {
  if (field === "name" || field === "registry") {
    return { $fulltext: value };
  }

  return value;
}
