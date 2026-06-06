import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { t } from "i18next";
import { toast } from "sonner";

import {
  ServiceForm,
  initialServiceFormValue,
  toServiceInput,
  type ServiceFormValue,
} from "../../../components/service-form";
import { StatusBadge } from "../../../components/status-badge";
import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Button } from "@/components/fabric-ui/button";
import { Page } from "@/components/fabric-ui/page";
import { graphql } from "@/gql";

const GET_SERVICE_FROM_SERVICE_ROUTE = graphql(`
  query getServiceFromServiceRoute($projectId: ID!, $id: ID!) {
    service(projectId: $projectId, id: $id) {
      id
      projectId
      name
      image
      replicas
      status
      createdAt
      updatedAt
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

const UPDATE_SERVICE_FROM_SERVICE_ROUTE = graphql(`
  mutation updateServiceFromServiceRoute(
    $projectId: ID!
    $id: ID!
    $input: UpdateServiceInput!
  ) {
    updateService(projectId: $projectId, id: $id, input: $input) {
      id
      projectId
      name
      image
      replicas
      status
      updatedAt
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

const DELETE_SERVICE_FROM_SERVICE_ROUTE = graphql(`
  mutation deleteServiceFromServiceRoute($projectId: ID!, $id: ID!) {
    deleteService(projectId: $projectId, id: $id) {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/",
)({
  component: ServiceComponent,
});

function ServiceComponent() {
  const { workspaceId, projectId, serviceId } = Route.useParams();
  const navigate = useNavigate();
  const [formValue, setFormValue] = useState<ServiceFormValue>(
    initialServiceFormValue(),
  );

  const { data, refetch } = useQuery(GET_SERVICE_FROM_SERVICE_ROUTE, {
    variables: { projectId, id: serviceId },
    fetchPolicy: "cache-and-network",
  });

  const service = data?.service;

  const [updateService, { loading: updateLoading }] = useMutation(
    UPDATE_SERVICE_FROM_SERVICE_ROUTE,
  );
  const [deleteService, { loading: deleteLoading }] = useMutation(
    DELETE_SERVICE_FROM_SERVICE_ROUTE,
  );

  useEffect(() => {
    if (!service) return;

    setFormValue({
      name: service.name,
      image: service.image,
      replicas: service.replicas ?? "",
      ports: service.ports.map((port) => ({
        port: port.port,
        targetPort: port.targetPort ?? "",
      })),
      env: service.env.map((env) => ({
        key: env.key,
        value: env.value,
      })),
    });
  }, [service]);

  const handleSave = async () => {
    const input = toServiceInput(formValue);

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

    try {
      await updateService({
        variables: {
          projectId,
          id: serviceId,
          input,
        },
      });
      await refetch();
      toast.success(t("service:toast.updated"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!service) return;

    const confirmed = await alertDialog({
      title: t("service:delete.title"),
      description: t("service:delete.description", { name: service.name }),
      cancelText: t("action.cancel"),
      confirmText: t("action.delete"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteService({ variables: { projectId, id: serviceId } });
      toast.success(t("service:toast.deleted"));
      navigate({
        to: "/workspaces/$workspaceId/projects/$projectId/services",
        params: { workspaceId, projectId },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Page
      title={service?.name ?? t("service:detail.title")}
      description={t("service:detail.description")}
      primaryAction={{
        disabled: updateLoading || !service,
        label: t("action.save"),
        onClick: handleSave,
        testId: "service-save-action",
      }}
      secondaryActions={[
        {
          disabled: deleteLoading || !service,
          label: t("action.delete"),
          onClick: handleDelete,
          testId: "service-delete-action",
        },
      ]}
    >
      <div className="max-w-2xl space-y-5" data-testid="service-detail-page">
        {service && (
          <div>
            <StatusBadge namespace="service" status={service.status} />
          </div>
        )}

        <ServiceForm
          disabled={!service}
          value={formValue}
          onChange={setFormValue}
        />

        <div className="flex gap-2 @md/page:hidden">
          <Button disabled={updateLoading || !service} onClick={handleSave}>
            {t("action.save")}
          </Button>
          <Button
            disabled={deleteLoading || !service}
            variant="outline"
            onClick={handleDelete}
          >
            {t("action.delete")}
          </Button>
        </div>
      </div>
    </Page>
  );
}
