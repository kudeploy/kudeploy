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
import { Check, Copy, Globe } from "lucide-react";
import { isEmpty, pick } from "lodash";
import { toast } from "sonner";
import z from "zod";

import type { DataFilterItemProps as FilterItemProps } from "@/components/thread-ui/data-filter";
import type { GetDomainsFromDomainsRouteQuery } from "@/gql/graphql";
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
import { DomainOrderField, DomainStatus } from "@/gql/graphql";
import {
  OrderDirection,
  createConnectionSearchSchema,
  getNextPageSearch,
  getPreviousPageSearch,
} from "@/lib/connection-search";

const GET_DOMAINS_FROM_DOMAINS_ROUTE = graphql(`
  query getDomainsFromDomainsRoute(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: DomainFilter
    $orderBy: DomainOrder
    $query: String
  ) {
    domains(
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
          status
          verificationToken
          verifiedAt
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

const CREATE_DOMAIN_FROM_DOMAINS_ROUTE = graphql(`
  mutation createDomainFromDomainsRoute($input: CreateDomainInput!) {
    createDomain(input: $input) {
      id
      name
      status
      verificationToken
      verifiedAt
      createdAt
      updatedAt
    }
  }
`);

const VERIFY_DOMAIN_FROM_DOMAINS_ROUTE = graphql(`
  mutation verifyDomainFromDomainsRoute($id: ID!) {
    verifyDomain(id: $id) {
      id
      name
      status
      verificationToken
      verifiedAt
      createdAt
      updatedAt
    }
  }
`);

const DELETE_DOMAIN_FROM_DOMAINS_ROUTE = graphql(`
  mutation deleteDomainFromDomainsRoute($id: ID!) {
    deleteDomain(id: $id) {
      id
      name
      status
      verificationToken
      verifiedAt
      createdAt
      updatedAt
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/domains/",
)({
  component: DomainsComponent,
  validateSearch: zodValidator(
    createConnectionSearchSchema({
      filterSchema: z
        .object({
          name: z.string().max(255).optional().catch(undefined),
        })
        .optional(),
      pageSize: 20,
      orderField: DomainOrderField,
      defaultOrderField: DomainOrderField.CREATED_AT,
      defaultOrderDirection: OrderDirection.DESC,
    }),
  ),
});

function DomainsComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const query = search?.query ?? "";
  const filterValues = search?.filter ?? {};

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedDomainId, setCopiedDomainId] = useState<string | null>(null);

  const { data, refetch } = useQuery(GET_DOMAINS_FROM_DOMAINS_ROUTE, {
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
        field: search?.orderBy?.field ?? DomainOrderField.CREATED_AT,
        direction: search?.orderBy?.direction ?? OrderDirection.DESC,
      },
    },
  });

  const domains = data?.domains.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.domains.pageInfo;

  const [createDomain, { loading: createLoading }] = useMutation(
    CREATE_DOMAIN_FROM_DOMAINS_ROUTE,
  );
  const [verifyDomain, { loading: verifyLoading }] = useMutation(
    VERIFY_DOMAIN_FROM_DOMAINS_ROUTE,
  );
  const [deleteDomain, { loading: deleteLoading }] = useMutation(
    DELETE_DOMAIN_FROM_DOMAINS_ROUTE,
  );

  const createForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: z.object({
        name: z
          .string()
          .trim()
          .min(1, t("domain:form.name.required"))
          .max(255, t("domain:form.name.too_long"))
          .regex(
            /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\.?$/,
            t("domain:form.name.invalid"),
          ),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await createDomain({
          variables: {
            input: {
              name: value.name.trim(),
            },
          },
        });

        setCreateDialogOpen(false);
        createForm.reset();
        await refetch();
        toast.success(t("domain:toast.created_success"));
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
        label: t("domain:filter.items.name.label"),
        field: "name",
        type: "input",
        pinned: true,
        render: ({ field: { value, onChange } }) => (
          <Input
            placeholder={t("domain:filter.items.name.placeholder")}
            defaultValue={value ?? ""}
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

  const handleCreateDialogOpenChange = (open: boolean) => {
    if (!open) {
      createForm.reset();
    }

    setCreateDialogOpen(open);
  };

  const handleCopyVerificationValue = async (domain: DomainRow) => {
    await navigator.clipboard.writeText(getDomainVerificationTxtValue(domain));
    setCopiedDomainId(domain.id);
    setTimeout(() => setCopiedDomainId(null), 2000);
  };

  const handleVerifyDomain = async (domain: DomainRow) => {
    try {
      await verifyDomain({
        variables: { id: domain.id },
      });
      await refetch();
      toast.success(t("domain:toast.verified_success"));
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteDomain = async (domain: DomainRow) => {
    const confirmed = await alertDialog({
      title: t("domain:delete.title"),
      description: t("domain:delete.description", {
        name: domain.name,
      }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteDomain({
        variables: { id: domain.id },
      });
      await refetch();
      toast.success(t("domain:toast.deleted_success"));
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("domain:title")}</PageTitle>
        <PageDescription>{t("domain:description")}</PageDescription>
        <PageActions>
          <PagePrimaryAction
            data-testid="domain-create-action"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Globe data-icon="inline-start" />
            {t("domain:create.button")}
          </PagePrimaryAction>
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="mb-4" data-testid="domains-page">
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
              placeholder: t("domain:filter.search.placeholder"),
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
              header: t("domain:table.name"),
              cell: ({ row }) => (
                <span
                  className="font-medium"
                  data-testid={`domain-row-${row.original.id}`}
                >
                  {row.original.name}
                </span>
              ),
            },
            {
              accessorKey: "status",
              header: t("domain:table.status"),
              size: 100,
              cell: ({ row }) => {
                const status = getDomainStatus(row.original.status);

                return (
                  <Badge
                    color={status.color}
                    data-testid={`domain-status-${row.original.id}`}
                  >
                    {t(`domain:status.${status.label}`)}
                  </Badge>
                );
              },
            },
            {
              accessorKey: "verificationToken",
              header: t("domain:table.txt_record"),
              size: 360,
              cell: ({ row }) => {
                const domain = row.original;
                const copied = copiedDomainId === domain.id;
                const txtName = getDomainVerificationTxtName(domain);
                const txtValue = getDomainVerificationTxtValue(domain);

                return (
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="text-muted-foreground text-xs">
                      {t("domain:txt.name")}:{" "}
                      <code className="text-foreground break-all">
                        {txtName}
                      </code>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {t("domain:txt.value")}:
                      </span>
                      <code className="bg-muted text-foreground rounded px-2 py-1 break-all">
                        {txtValue}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyVerificationValue(domain)}
                      >
                        {copied ? (
                          <Check data-icon="inline-start" />
                        ) : (
                          <Copy data-icon="inline-start" />
                        )}
                        {copied ? t("domain:txt.copied") : t("domain:txt.copy")}
                      </Button>
                    </div>
                  </div>
                );
              },
            },
            {
              accessorKey: "verifiedAt",
              header: t("domain:table.verified_at"),
              cell: ({ row }) =>
                row.original.verifiedAt
                  ? dayjs(row.original.verifiedAt).format("YYYY-MM-DD HH:mm")
                  : t("domain:not_verified"),
            },
            {
              accessorKey: "createdAt",
              header: t("domain:table.created_at"),
              cell: ({ row }) =>
                dayjs(row.original.createdAt).format("YYYY-MM-DD"),
            },
          ]}
          data={domains}
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
              disabled:
                verifyLoading || row.original.status === DomainStatus.VERIFIED,
              label: t("domain:action.verify"),
              onClick: () => handleVerifyDomain(row.original),
            },
            {
              disabled: deleteLoading,
              label: t("action.delete"),
              onClick: () => handleDeleteDomain(row.original),
            },
          ]}
        />

        <Dialog
          open={createDialogOpen}
          onOpenChange={handleCreateDialogOpenChange}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("domain:create.title")}</DialogTitle>
              <DialogDescription>
                {t("domain:create.description")}
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
                      id="domain-name"
                      data-testid="domain-name-input"
                      label={t("domain:form.name.label")}
                      placeholder={t("domain:form.name.placeholder")}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={
                        field.state.meta.errors.length > 0
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
                  data-testid="domain-create-submit"
                  loading={createLoading}
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

type DomainRow =
  GetDomainsFromDomainsRouteQuery["domains"]["edges"][number]["node"];

type DomainStatusView = {
  color: "amber" | "green";
  label: "pending" | "verified";
};

function getDomainStatus(status: DomainStatus): DomainStatusView {
  if (status === DomainStatus.VERIFIED) {
    return { color: "green", label: "verified" };
  }

  return { color: "amber", label: "pending" };
}

function getDomainVerificationTxtName(domain: DomainRow) {
  return `_kudeploy.${domain.name}`;
}

function getDomainVerificationTxtValue(domain: DomainRow) {
  return `domain-verify=${domain.verificationToken}`;
}
