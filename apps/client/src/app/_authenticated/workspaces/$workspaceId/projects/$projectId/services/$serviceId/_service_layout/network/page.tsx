import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { t } from "i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import { Select } from "@/components/fabric-ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { graphql } from "@/gql";

type PortValue = {
  port: number | "";
  targetPort: number | "";
};

type HealthCheckValue = {
  enabled: boolean;
  type: "HTTP" | "TCP";
  port: number | "";
  path: string;
};

const UPDATE_SERVICE_NETWORK_FROM_SERVICE_NETWORK_ROUTE = graphql(`
  mutation updateServiceNetworkFromServiceNetworkRoute(
    $projectId: ID!
    $id: ID!
    $input: UpdateServiceInput!
  ) {
    updateService(projectId: $projectId, id: $id, input: $input) {
      id
      ports {
        port
        targetPort
      }
      healthCheck {
        type
        port
        path
      }
      updatedAt
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/network/",
)({
  component: ServiceNetworkComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceNetworkComponent() {
  const router = useRouter();
  const { projectId, serviceId } = Route.useParams();
  const { service } = Route.useRouteContext();
  const [ports, setPorts] = useState<Array<PortValue>>(
    toPortValues(service.ports),
  );
  const [healthCheck, setHealthCheck] = useState<HealthCheckValue>(
    toHealthCheckValue(service.healthCheck),
  );

  const [updateService, { loading }] = useMutation(
    UPDATE_SERVICE_NETWORK_FROM_SERVICE_NETWORK_ROUTE,
  );

  useEffect(() => {
    setPorts(toPortValues(service.ports));
    setHealthCheck(toHealthCheckValue(service.healthCheck));
  }, [service]);

  const updatePort = (index: number, patch: Partial<PortValue>) => {
    setPorts((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleSave = async () => {
    const portInput = ports
      .filter((port) => port.port !== "")
      .map((port) => ({
        port: Number(port.port),
        ...(port.targetPort === ""
          ? {}
          : { targetPort: Number(port.targetPort) }),
      }));

    if (portInput.length === 0) {
      toast.error(t("service:form.ports"));
      return;
    }

    if (healthCheck.enabled && healthCheck.port === "") {
      toast.error(t("service:form.health_check_port_required"));
      return;
    }

    try {
      await updateService({
        variables: {
          projectId,
          id: serviceId,
          input: {
            ports: portInput,
            healthCheck:
              healthCheck.enabled && healthCheck.port !== ""
                ? {
                    type: healthCheck.type,
                    port: Number(healthCheck.port),
                    ...(healthCheck.type === "HTTP" && healthCheck.path
                      ? { path: healthCheck.path.trim() }
                      : {}),
                  }
                : null,
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

  return (
    <Page
      title={t("service:tabs.network")}
      description={t("service:network.description")}
      primaryAction={{
        disabled: loading,
        label: t("action.save"),
        onClick: handleSave,
        testId: "service-save-action",
      }}
    >
      <div className="space-y-5" data-testid="service-network-page">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{t("service:network.ports")}</CardTitle>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() =>
                  setPorts((current) => [
                    ...current,
                    { port: "", targetPort: "" },
                  ])
                }
              >
                <Plus />
                {t("service:actions.add_port")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ports.map((port, index) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-end gap-2"
                key={index}
              >
                <Input
                  label={t("service:form.port")}
                  min={1}
                  type="number"
                  value={port.port}
                  onChange={(event) =>
                    updatePort(index, {
                      port:
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                    })
                  }
                />
                <Input
                  label={t("service:form.target_port")}
                  min={1}
                  type="number"
                  value={port.targetPort}
                  onChange={(event) =>
                    updatePort(index, {
                      targetPort:
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                    })
                  }
                />
                <Button
                  disabled={ports.length === 1}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setPorts((current) =>
                      current.filter(
                        (_item, currentIndex) => currentIndex !== index,
                      ),
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{t("service:form.health_check")}</CardTitle>
              <Switch
                checked={healthCheck.enabled}
                onCheckedChange={(enabled) =>
                  setHealthCheck((current) => ({ ...current, enabled }))
                }
              />
            </div>
          </CardHeader>
          {healthCheck.enabled && (
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Select<"HTTP" | "TCP">
                items={[
                  { label: "HTTP", value: "HTTP" },
                  { label: "TCP", value: "TCP" },
                ]}
                label={t("service:form.health_check_type")}
                value={healthCheck.type}
                onValueChange={(type) =>
                  setHealthCheck((current) => ({ ...current, type }))
                }
              />
              <Input
                label={t("service:form.health_check_port")}
                min={1}
                type="number"
                value={healthCheck.port}
                onChange={(event) =>
                  setHealthCheck((current) => ({
                    ...current,
                    port:
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                  }))
                }
              />
              {healthCheck.type === "HTTP" && (
                <Input
                  label={t("service:form.health_check_path")}
                  placeholder="/healthz"
                  value={healthCheck.path}
                  onChange={(event) =>
                    setHealthCheck((current) => ({
                      ...current,
                      path: event.target.value,
                    }))
                  }
                />
              )}
            </CardContent>
          )}
          <CardFooter className="justify-end @md/page:hidden">
            <Button disabled={loading} onClick={handleSave}>
              {t("action.save")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Page>
  );
}

function toPortValues(
  ports: ReadonlyArray<{ port: number; targetPort?: number | null }>,
): Array<PortValue> {
  return ports.map((port) => ({
    port: port.port,
    targetPort: port.targetPort ?? "",
  }));
}

function toHealthCheckValue(
  healthCheck?: {
    type: "HTTP" | "TCP";
    port: number;
    path?: string | null;
  } | null,
): HealthCheckValue {
  return {
    enabled: !!healthCheck,
    type: healthCheck?.type ?? "HTTP",
    port: healthCheck?.port ?? "",
    path: healthCheck?.path ?? "/healthz",
  };
}
