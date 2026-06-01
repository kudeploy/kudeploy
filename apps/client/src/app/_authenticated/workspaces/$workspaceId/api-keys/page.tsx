import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-adapter";
import dayjs from "dayjs";
import { t } from "i18next";
import { isEmpty, pick } from "lodash";
import { AlertTriangle, Check, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import type { DataFilterItemProps as FilterItemProps } from "@/components/fabric-ui/data-filter";
import type { GetApiKeysFromApiKeysRouteQuery } from "@/gql/graphql";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Badge } from "@/components/fabric-ui/badge";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { graphql } from "@/gql";
import { ApiKeyOrderField } from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";
import { truncateEmail } from "@/utils/truncate-email";

const GET_API_KEYS_FROM_API_KEYS_ROUTE = graphql(`
  query getApiKeysFromApiKeysRoute(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: ApiKeyFilter
    $orderBy: ApiKeyOrder
    $query: String
  ) {
    apiKeys(
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
          keyPrefix
          createdAt
          lastUsedAt
          expiresAt
          member {
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

const CREATE_API_KEY_FROM_API_KEYS_ROUTE = graphql(`
  mutation createApiKeyFromApiKeysRoute($input: CreateApiKeyInput!) {
    createApiKey(input: $input) {
      apiKey
      entity {
        id
        name
        keyPrefix
        createdAt
        lastUsedAt
        expiresAt
        member {
          id
          name
          email
        }
      }
    }
  }
`);

const UPDATE_API_KEY_FROM_API_KEYS_ROUTE = graphql(`
  mutation updateApiKeyFromApiKeysRoute($id: ID!, $input: UpdateApiKeyInput!) {
    updateApiKey(id: $id, input: $input) {
      id
      name
      keyPrefix
      createdAt
      lastUsedAt
      expiresAt
      member {
        id
        name
        email
      }
    }
  }
`);

const DELETE_API_KEY_FROM_API_KEYS_ROUTE = graphql(`
  mutation deleteApiKeyFromApiKeysRoute($id: ID!) {
    deleteApiKey(id: $id) {
      id
      name
      keyPrefix
      createdAt
      lastUsedAt
      expiresAt
      member {
        id
        name
        email
      }
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/api-keys/",
)({
  component: ApiKeysComponent,
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
        })
        .optional(),
      pageSize: 20,
      orderField: ApiKeyOrderField,
      defaultOrderField: ApiKeyOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

function ApiKeysComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingApiKey, setRenamingApiKey] = useState<ApiKeyRow | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [createdDialogOpen, setCreatedDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, refetch } = useQuery(GET_API_KEYS_FROM_API_KEYS_ROUTE, {
    variables: {
      ...pick(search, ["after", "before", "first", "last"]),
      query,
      filter: formatFilterValues(filterValues, (field, value) => {
        switch (field) {
          case "name":
            return { $fulltext: value };
          default:
            return value;
        }
      }),
      orderBy: {
        field: search?.orderBy?.field ?? ApiKeyOrderField.CREATED_AT,
        direction: search?.orderBy?.direction ?? OrderDirection.DESC,
      },
    },
  });

  const apiKeys = data?.apiKeys.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.apiKeys.pageInfo;

  const createForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: z.object({
        name: z
          .string()
          .trim()
          .min(1, t("api-key:form.name.required"))
          .max(255, t("api-key:form.name.too_long")),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await createApiKey({
          variables: {
            input: {
              name: value.name.trim(),
            },
          },
        });

        const apiKey = result.data?.createApiKey.apiKey;

        if (apiKey) {
          setCreatedApiKey(apiKey);
          setCreatedDialogOpen(true);
          setCreateDialogOpen(false);
          createForm.reset();
          await refetch();
          toast.success(t("api-key:toast.created_success"));
        }
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      }
    },
  });

  const renameForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: z.object({
        name: z
          .string()
          .trim()
          .min(1, t("api-key:form.name.required"))
          .max(255, t("api-key:form.name.too_long")),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!renamingApiKey) return;

      try {
        await updateApiKey({
          variables: {
            id: renamingApiKey.id,
            input: {
              name: value.name.trim(),
            },
          },
        });

        setRenameDialogOpen(false);
        setRenamingApiKey(null);
        renameForm.reset();
        await refetch();
        toast.success(t("api-key:toast.renamed_success"));
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      }
    },
  });

  const filters: Array<FilterItemProps> = useMemo(() => {
    return [
      {
        label: t("api-key:filter.items.name.label"),
        field: "name",
        pinned: true,
        render: ({ field: { value, onChange } }) => (
          <Input
            placeholder={t("api-key:filter.items.name.placeholder")}
            defaultValue={value}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onChange?.((e.target as HTMLInputElement).value);
              }
            }}
          />
        ),
      },
    ];
  }, []);

  const [createApiKey, { loading: createLoading }] = useMutation(
    CREATE_API_KEY_FROM_API_KEYS_ROUTE,
  );
  const [updateApiKey, { loading: updateLoading }] = useMutation(
    UPDATE_API_KEY_FROM_API_KEYS_ROUTE,
  );
  const [deleteApiKey, { loading: deleteLoading }] = useMutation(
    DELETE_API_KEY_FROM_API_KEYS_ROUTE,
  );

  const handleCreateDialogOpenChange = (open: boolean) => {
    if (!open) {
      createForm.reset();
    }
    setCreateDialogOpen(open);
  };

  const handleRenameDialogOpenChange = (open: boolean) => {
    if (!open) {
      renameForm.reset();
      setRenamingApiKey(null);
    }
    setRenameDialogOpen(open);
  };

  const handleOpenRename = (apiKey: ApiKeyRow) => {
    setRenamingApiKey(apiKey);
    renameForm.setFieldValue("name", apiKey.name);
    setRenameDialogOpen(true);
  };

  const handleDeleteApiKey = async (apiKey: ApiKeyRow) => {
    const confirmed = await alertDialog({
      title: t("api-key:delete.title"),
      description: t("api-key:delete.description", {
        name: apiKey.name,
      }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteApiKey({
        variables: { id: apiKey.id },
      });

      await refetch();
      toast.success(t("api-key:toast.deleted_success"));
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Page
      title={t("api-key:title")}
      description={t("api-key:description")}
      primaryAction={{
        icon: <KeyRound data-icon="inline-start" />,
        label: t("api-key:create.button"),
        onClick: () => setCreateDialogOpen(true),
        testId: "api-key-create-action",
      }}
    >
      <div className="mb-4" data-testid="api-keys-page">
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
            placeholder: t("api-key:filter.search.placeholder"),
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
            header: t("api-key:table.name"),
            cell: ({ row }) => {
              const apiKey = row.original;

              return (
                <span
                  className="font-medium"
                  data-testid={`api-key-row-${apiKey.id}`}
                >
                  {apiKey.name}
                </span>
              );
            },
          },
          {
            accessorKey: "status",
            header: t("api-key:table.status"),
            size: 80,
            cell: ({ row }) => {
              const status = getApiKeyStatus(row.original);

              return (
                <Badge
                  color={status.color}
                  data-testid={`api-key-status-${row.original.id}`}
                >
                  {t(`api-key:status.${status.label}`)}
                </Badge>
              );
            },
          },
          {
            accessorKey: "member",
            header: t("api-key:table.owner"),
            size: 200,
            cell: ({ row }) => {
              const member = row.original.member;

              return (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{member.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {truncateEmail(member.email)}
                  </span>
                </div>
              );
            },
          },
          {
            accessorKey: "lastUsedAt",
            header: t("api-key:table.last_used"),
            cell: ({ row }) =>
              row.original.lastUsedAt
                ? dayjs(row.original.lastUsedAt).format("YYYY-MM-DD HH:mm")
                : t("api-key:never_used"),
          },
          {
            accessorKey: "expiresAt",
            header: t("api-key:table.expires_at"),
            cell: ({ row }) =>
              row.original.expiresAt
                ? dayjs(row.original.expiresAt).format("YYYY-MM-DD")
                : t("api-key:never_expires"),
          },
          {
            accessorKey: "createdAt",
            header: t("api-key:table.created_at"),
            cell: ({ row }) =>
              dayjs(row.original.createdAt).format("YYYY-MM-DD"),
          },
        ]}
        data={apiKeys}
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
            label: t("action.rename"),
            onClick: () => handleOpenRename(row.original),
          },
          {
            disabled: deleteLoading,
            label: t("action.delete"),
            onClick: () => handleDeleteApiKey(row.original),
          },
        ]}
      />

      <Dialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("api-key:create.title")}</DialogTitle>
            <DialogDescription>
              {t("api-key:create.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createForm.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-4 py-4">
              <createForm.Field name="name">
                {(field) => (
                  <Input
                    id="api-key-name"
                    data-testid="api-key-name-input"
                    label={t("api-key:form.name.label")}
                    placeholder={t("api-key:form.name.placeholder")}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors.map((error: any) => typeof error === "string" ? error : error?.message || error).join(", ")
                        : undefined
                    }
                  />
                )}
              </createForm.Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogOpenChange(false)}
              >
                {t("action.cancel")}
              </Button>
              <Button
                type="submit"
                data-testid="api-key-create-submit"
                loading={createLoading}
              >
                {t("action.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameDialogOpen}
        onOpenChange={handleRenameDialogOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("api-key:rename.title")}</DialogTitle>
            <DialogDescription>
              {t("api-key:rename.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              renameForm.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-4 py-4">
              <renameForm.Field name="name">
                {(field) => (
                  <Input
                    id="api-key-rename"
                    data-testid="api-key-rename-input"
                    label={t("api-key:form.name.label")}
                    placeholder={t("api-key:form.name.placeholder")}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors.map((error: any) => typeof error === "string" ? error : error?.message || error).join(", ")
                        : undefined
                    }
                  />
                )}
              </renameForm.Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRenameDialogOpenChange(false)}
              >
                {t("action.cancel")}
              </Button>
              <Button
                type="submit"
                data-testid="api-key-rename-submit"
                loading={updateLoading}
              >
                {t("action.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createdDialogOpen}
        onOpenChange={(open) => {
          setCreatedDialogOpen(open);
          if (!open) {
            setCopied(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("api-key:created.title")}</DialogTitle>
          </DialogHeader>
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="font-semibold">{t("api-key:created.warning")}</AlertTitle>
            <AlertDescription>
              {t("api-key:created.description")}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-4 py-4">
            <div className="bg-muted rounded-md p-4">
              <code
                className="text-sm break-all"
                data-testid="api-key-created-value"
              >
                {createdApiKey}
              </code>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (createdApiKey) {
                  copyToClipboard(createdApiKey);
                }
              }}
            >
              {copied ? (
                <>
                  <Check data-icon="inline-start" />
                  {t("api-key:created.copied")}
                </>
              ) : (
                <>
                  <Copy data-icon="inline-start" />
                  {t("api-key:created.copy")}
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button
              data-testid="api-key-created-close"
              onClick={() => setCreatedDialogOpen(false)}
            >
              {t("action.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

type ApiKeyRow =
  GetApiKeysFromApiKeysRouteQuery["apiKeys"]["edges"][number]["node"];

type ApiKeyStatus = {
  color: "green" | "yellow";
  label: "active" | "expired";
};

function getApiKeyStatus(apiKey: {
  expiresAt?: string | null;
}): ApiKeyStatus {
  if (apiKey.expiresAt && dayjs(apiKey.expiresAt).isBefore(dayjs())) {
    return { color: "yellow", label: "expired" };
  }

  return { color: "green", label: "active" };
}
