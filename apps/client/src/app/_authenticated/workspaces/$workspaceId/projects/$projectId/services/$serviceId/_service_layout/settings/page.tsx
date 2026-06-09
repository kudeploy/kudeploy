import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { t } from "i18next";
import { toast } from "sonner";

import { alertDialog } from "@/components/fabric-ui/alert-dialog";
import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";

type ResourcesValue = {
  cpuRequest: string;
  cpuLimit: string;
  memoryRequest: string;
  memoryLimit: string;
};

const UPDATE_SERVICE_SETTINGS_FROM_SERVICE_SETTINGS_ROUTE = graphql(`
  mutation updateServiceSettingsFromServiceSettingsRoute(
    $projectId: ID!
    $id: ID!
    $input: UpdateServiceInput!
  ) {
    updateService(projectId: $projectId, id: $id, input: $input) {
      id
      name
      replicas
      resources {
        cpuRequest
        cpuLimit
        memoryRequest
        memoryLimit
      }
      updatedAt
    }
  }
`);

const DELETE_SERVICE_FROM_SERVICE_SETTINGS_ROUTE = graphql(`
  mutation deleteServiceFromServiceSettingsRoute($projectId: ID!, $id: ID!) {
    deleteService(projectId: $projectId, id: $id) {
      id
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/settings/",
)({
  component: ServiceSettingsComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceSettingsComponent() {
  const { workspaceId, projectId, serviceId } = Route.useParams();
  const { service } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();
  const [name, setName] = useState(service.name);
  const [replicas, setReplicas] = useState<number | "">(service.replicas ?? "");
  const [resources, setResources] = useState<ResourcesValue>(
    toResourcesValue(service.resources),
  );

  const [updateService, { loading: updateLoading }] = useMutation(
    UPDATE_SERVICE_SETTINGS_FROM_SERVICE_SETTINGS_ROUTE,
  );
  const [deleteService, { loading: deleteLoading }] = useMutation(
    DELETE_SERVICE_FROM_SERVICE_SETTINGS_ROUTE,
  );

  useEffect(() => {
    setName(service.name);
    setReplicas(service.replicas ?? "");
    setResources(toResourcesValue(service.resources));
  }, [service]);

  const updateResources = (patch: Partial<ResourcesValue>) => {
    setResources((current) => ({ ...current, ...patch }));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error(t("service:form.name.required"));
      return;
    }

    try {
      await updateService({
        variables: {
          projectId,
          id: serviceId,
          input: {
            name: trimmedName,
            ...(replicas === "" ? {} : { replicas }),
            resources: toResourcesInput(resources),
          },
        },
      });
      await router.invalidate();
      toast.success(t("service:toast.updated"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async () => {
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
      title={t("service:tabs.settings")}
      description={t("service:settings.description")}
      primaryAction={{
        disabled: updateLoading,
        label: t("action.save"),
        onClick: handleSave,
        testId: "service-save-action",
      }}
      secondaryActions={[
        {
          disabled: deleteLoading,
          label: t("action.delete"),
          onClick: handleDelete,
          testId: "service-delete-action",
        },
      ]}
    >
      <div className="space-y-5" data-testid="service-settings-page">
        <Card>
          <CardHeader>
            <CardTitle>{t("service:settings.general.title")}</CardTitle>
            <CardDescription>
              {t("service:settings.general.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              data-testid="service-name-input"
              label={t("service:form.name.label")}
              placeholder={t("service:form.name.placeholder")}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              data-testid="service-replicas-input"
              label={t("service:form.replicas")}
              min={0}
              type="number"
              value={replicas}
              onChange={(event) =>
                setReplicas(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("service:form.resources")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t("service:form.cpu_request")}
              placeholder="250m"
              value={resources.cpuRequest}
              onChange={(event) =>
                updateResources({ cpuRequest: event.target.value })
              }
            />
            <Input
              label={t("service:form.cpu_limit")}
              placeholder="500m"
              value={resources.cpuLimit}
              onChange={(event) =>
                updateResources({ cpuLimit: event.target.value })
              }
            />
            <Input
              label={t("service:form.memory_request")}
              placeholder="256Mi"
              value={resources.memoryRequest}
              onChange={(event) =>
                updateResources({ memoryRequest: event.target.value })
              }
            />
            <Input
              label={t("service:form.memory_limit")}
              placeholder="512Mi"
              value={resources.memoryLimit}
              onChange={(event) =>
                updateResources({ memoryLimit: event.target.value })
              }
            />
          </CardContent>
          <CardFooter className="justify-end @md/page:hidden">
            <Button disabled={updateLoading} onClick={handleSave}>
              {t("action.save")}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("service:settings.danger_zone.title")}
            </CardTitle>
            <CardDescription>
              {t("service:settings.danger_zone.description")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              data-testid="service-delete-action-mobile"
              disabled={deleteLoading}
              variant="destructive"
              onClick={handleDelete}
            >
              {t("service:settings.danger_zone.delete_button")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Page>
  );
}

function toResourcesValue(
  resources?: {
    cpuRequest?: string | null;
    cpuLimit?: string | null;
    memoryRequest?: string | null;
    memoryLimit?: string | null;
  } | null,
): ResourcesValue {
  return {
    cpuRequest: resources?.cpuRequest ?? "",
    cpuLimit: resources?.cpuLimit ?? "",
    memoryRequest: resources?.memoryRequest ?? "",
    memoryLimit: resources?.memoryLimit ?? "",
  };
}

function toResourcesInput(value: ResourcesValue) {
  const resources = {
    ...(value.cpuRequest.trim() ? { cpuRequest: value.cpuRequest.trim() } : {}),
    ...(value.cpuLimit.trim() ? { cpuLimit: value.cpuLimit.trim() } : {}),
    ...(value.memoryRequest.trim()
      ? { memoryRequest: value.memoryRequest.trim() }
      : {}),
    ...(value.memoryLimit.trim()
      ? { memoryLimit: value.memoryLimit.trim() }
      : {}),
  };

  return Object.keys(resources).length ? resources : null;
}
