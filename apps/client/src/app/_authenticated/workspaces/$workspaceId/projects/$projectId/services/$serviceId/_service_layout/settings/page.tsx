import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { t } from "i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/thread-ui/button";
import { Empty } from "@/components/thread-ui/empty";
import { Input } from "@/components/thread-ui/input";
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageSecondaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import { Select } from "@/components/thread-ui/select";
import { Textarea } from "@/components/thread-ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { graphql } from "@/gql";
import { ServiceHealthCheckType } from "@/gql/graphql";

type EnvValue = {
  key: string;
  value: string;
};

type HealthCheckValue = {
  enabled: boolean;
  type: ServiceHealthCheckType;
  port: number | "";
  path: string;
};

type PortValue = {
  port: number | "";
  targetPort: number | "";
};

type VolumeValue = {
  volumeId: string;
  mountPath: string;
  subPath: string;
  readOnly: boolean;
};

type ResourcesValue = {
  cpuRequest: string;
  cpuLimit: string;
  memoryRequest: string;
  memoryLimit: string;
};

const NONE_REGISTRY_CREDENTIAL_VALUE = "__none__";
const NONE_VOLUME_VALUE = "__none__";

const GET_REGISTRY_CREDENTIALS_FROM_SERVICE_SETTINGS_ROUTE = graphql(`
  query getRegistryCredentialsFromServiceSettingsRoute($projectId: ID!) {
    registryCredentials(projectId: $projectId, first: 20) {
      edges {
        node {
          id
          name
          registry
        }
      }
    }
  }
`);

const GET_VOLUMES_FROM_SERVICE_SETTINGS_ROUTE = graphql(`
  query getVolumesFromServiceSettingsRoute($projectId: ID!) {
    volumes(projectId: $projectId, first: 100) {
      edges {
        node {
          id
          name
          size
          status
        }
      }
    }
  }
`);

const UPDATE_SERVICE_SETTINGS_FROM_SERVICE_SETTINGS_ROUTE = graphql(`
  mutation updateServiceSettingsFromServiceSettingsRoute(
    $projectId: ID!
    $id: ID!
    $input: UpdateServiceInput!
  ) {
    updateService(projectId: $projectId, id: $id, input: $input) {
      id
      name
      image
      registryCredentialId
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
      ports {
        port
        targetPort
      }
      env {
        key
        value
      }
      volumes {
        volumeId
        mountPath
        subPath
        readOnly
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
  const [image, setImage] = useState(service.image);
  const [registryCredentialId, setRegistryCredentialId] = useState(
    service.registryCredentialId ?? NONE_REGISTRY_CREDENTIAL_VALUE,
  );
  const [command, setCommand] = useState(linesToValue(service.command));
  const [args, setArgs] = useState(linesToValue(service.args));
  const [replicas, setReplicas] = useState<number | "">(service.replicas ?? "");
  const [resources, setResources] = useState<ResourcesValue>(
    toResourcesValue(service.resources),
  );
  const [resourcesEnabled, setResourcesEnabled] = useState(
    hasResourcesValue(service.resources),
  );
  const [env, setEnv] = useState<Array<EnvValue>>(service.env.map(copyEnv));
  const [ports, setPorts] = useState<Array<PortValue>>(
    toPortValues(service.ports),
  );
  const [volumes, setVolumes] = useState<Array<VolumeValue>>(
    service.volumes.map(copyVolume),
  );
  const [healthCheck, setHealthCheck] = useState<HealthCheckValue>(
    toHealthCheckValue(service.healthCheck),
  );

  const { data: registryCredentialData } = useQuery(
    GET_REGISTRY_CREDENTIALS_FROM_SERVICE_SETTINGS_ROUTE,
    {
      variables: { projectId },
      fetchPolicy: "cache-and-network",
    },
  );
  const { data: volumeData } = useQuery(
    GET_VOLUMES_FROM_SERVICE_SETTINGS_ROUTE,
    {
      variables: { projectId },
      fetchPolicy: "cache-and-network",
    },
  );
  const [updateService, { loading: updateLoading }] = useMutation(
    UPDATE_SERVICE_SETTINGS_FROM_SERVICE_SETTINGS_ROUTE,
  );
  const [deleteService, { loading: deleteLoading }] = useMutation(
    DELETE_SERVICE_FROM_SERVICE_SETTINGS_ROUTE,
  );
  const registryCredentialItems = useMemo(
    () => [
      {
        label: t("service:form.registry_credential.none"),
        value: NONE_REGISTRY_CREDENTIAL_VALUE,
      },
      ...(registryCredentialData?.registryCredentials.edges.map((edge) => ({
        label: `${edge.node.name} (${edge.node.registry})`,
        value: edge.node.id,
      })) ?? []),
    ],
    [registryCredentialData],
  );
  const volumeItems = useMemo(
    () => [
      {
        label: t("service:form.volume.select_placeholder"),
        value: NONE_VOLUME_VALUE,
      },
      ...(volumeData?.volumes.edges.map((edge) => ({
        label: `${edge.node.name} (${edge.node.size}Gi)`,
        value: edge.node.id,
      })) ?? []),
      ...volumes
        .filter(
          (volume) =>
            volume.volumeId &&
            volume.volumeId !== NONE_VOLUME_VALUE &&
            !volumeData?.volumes.edges.some(
              (edge) => edge.node.id === volume.volumeId,
            ),
        )
        .map((volume) => ({
          label: volume.volumeId,
          value: volume.volumeId,
        })),
    ],
    [volumeData, volumes],
  );

  useEffect(() => {
    setName(service.name);
    setImage(service.image);
    setRegistryCredentialId(
      service.registryCredentialId ?? NONE_REGISTRY_CREDENTIAL_VALUE,
    );
    setCommand(linesToValue(service.command));
    setArgs(linesToValue(service.args));
    setReplicas(service.replicas ?? "");
    setResources(toResourcesValue(service.resources));
    setResourcesEnabled(hasResourcesValue(service.resources));
    setEnv(service.env.map(copyEnv));
    setPorts(toPortValues(service.ports));
    setVolumes(service.volumes.map(copyVolume));
    setHealthCheck(toHealthCheckValue(service.healthCheck));
  }, [service]);

  const updateEnv = (index: number, patch: Partial<EnvValue>) => {
    setEnv((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const updatePort = (index: number, patch: Partial<PortValue>) => {
    setPorts((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const updateVolume = (index: number, patch: Partial<VolumeValue>) => {
    setVolumes((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const updateResources = (patch: Partial<ResourcesValue>) => {
    setResources((current) => ({ ...current, ...patch }));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedImage = image.trim();
    const portInput = ports
      .filter((port) => port.port !== "")
      .map((port) => ({
        port: Number(port.port),
        ...(port.targetPort === ""
          ? {}
          : { targetPort: Number(port.targetPort) }),
      }));
    const volumeInput = volumes.map((volume) => {
      const subPath = toVolumeSubPathInput(volume.subPath);

      return {
        volumeId: volume.volumeId,
        mountPath: volume.mountPath.trim(),
        subPath,
        readOnly: volume.readOnly,
      };
    });
    const effectiveReplicas =
      replicas === "" ? (service.replicas ?? 1) : replicas;

    if (!trimmedName) {
      toast.error(t("service:form.name.required"));
      return;
    }

    if (!trimmedImage) {
      toast.error(t("service:form.image.required"));
      return;
    }

    if (portInput.length === 0) {
      toast.error(t("service:form.ports"));
      return;
    }

    if (healthCheck.enabled && healthCheck.port === "") {
      toast.error(t("service:form.health_check_port_required"));
      return;
    }

    if (
      volumeInput.some(
        (volume) => !volume.volumeId || volume.volumeId === NONE_VOLUME_VALUE,
      )
    ) {
      toast.error(t("service:form.volume.required"));
      return;
    }

    if (volumeInput.some((volume) => !volume.mountPath)) {
      toast.error(t("service:form.volume.mount_path_required"));
      return;
    }

    if (volumeInput.length > 0 && effectiveReplicas > 1) {
      toast.error(t("service:form.volume.replicas_limited"));
      return;
    }

    try {
      await updateService({
        variables: {
          projectId,
          id: serviceId,
          input: {
            name: trimmedName,
            image: trimmedImage,
            registryCredentialId:
              registryCredentialId === NONE_REGISTRY_CREDENTIAL_VALUE
                ? null
                : registryCredentialId,
            ...(replicas === "" ? {} : { replicas }),
            command: toLines(command),
            args: toLines(args),
            resources: resourcesEnabled ? toResourcesInput(resources) : null,
            ports: portInput,
            healthCheck:
              healthCheck.enabled && healthCheck.port !== ""
                ? {
                    type: healthCheck.type,
                    port: Number(healthCheck.port),
                    ...(healthCheck.type === ServiceHealthCheckType.HTTP &&
                    healthCheck.path
                      ? { path: healthCheck.path.trim() }
                      : {}),
                  }
                : null,
            env: env
              .filter((item) => item.key.trim())
              .map((item) => ({
                key: item.key.trim(),
                value: item.value,
              })),
            volumes: volumeInput,
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
    <Page>
      <PageHeader>
        <PageTitle>{t("service:tabs.settings")}</PageTitle>
        <PageDescription>{t("service:settings.description")}</PageDescription>
        <PageActions>
          <PageSecondaryAction
            destructive
            data-testid="service-delete-action"
            disabled={deleteLoading}
            onAction={handleDelete}
          >
            {t("action.delete")}
          </PageSecondaryAction>
          <Button
            data-slot="page-primary-action"
            data-testid="service-save-action"
            disabled={updateLoading}
            onClick={handleSave}
          >
            {t("action.save")}
          </Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="space-y-5" data-testid="service-settings-page">
          <Card>
            <CardHeader>
              <CardTitle>{t("service:settings.general.title")}</CardTitle>
              <CardDescription>
                {t("service:settings.general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <Input
                className="sm:col-span-2"
                data-testid="service-name-input"
                label={t("service:form.name.label")}
                placeholder={t("service:form.name.placeholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <Input
                className="sm:col-span-1"
                data-testid="service-replicas-input"
                label={t("service:form.replicas")}
                max={100}
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
              <CardTitle>{t("service:source.title")}</CardTitle>
              <CardDescription>
                {t("service:source.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Input
                  className="sm:col-span-2"
                  data-testid="service-image-input"
                  label={t("service:form.image.label")}
                  placeholder={t("service:form.image.placeholder")}
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                />

                <Select<string>
                  className="sm:col-span-1"
                  data-testid="service-registry-credential-select"
                  items={registryCredentialItems}
                  label={t("service:form.registry_credential.label")}
                  placeholder={t("service:form.registry_credential.none")}
                  value={registryCredentialId}
                  onValueChange={(value) =>
                    setRegistryCredentialId(
                      value ?? NONE_REGISTRY_CREDENTIAL_VALUE,
                    )
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Textarea
                  data-testid="service-command-input"
                  label={t("service:form.command.label")}
                  placeholder={t("service:form.command.placeholder")}
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                />
                <Textarea
                  data-testid="service-args-input"
                  label={t("service:form.args.label")}
                  placeholder={t("service:form.args.placeholder")}
                  value={args}
                  onChange={(event) => setArgs(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{t("service:environment.title")}</CardTitle>
                  <CardDescription>
                    {t("service:environment.description")}
                  </CardDescription>
                </div>
                <Button
                  data-testid="service-add-env-action"
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setEnv((current) => [...current, { key: "", value: "" }])
                  }
                >
                  <Plus />
                  {t("service:actions.add_env")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {env.length === 0 ? (
                <Empty
                  className="rounded-md border border-dashed p-4"
                  title={t("service:environment.empty")}
                />
              ) : (
                env.map((item, index) => (
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-end gap-2"
                    key={index}
                  >
                    <Input
                      data-testid={`service-env-key-input-${index}`}
                      label={t("service:form.key")}
                      value={item.key}
                      onChange={(event) =>
                        updateEnv(index, { key: event.target.value })
                      }
                    />
                    <Input
                      data-testid={`service-env-value-input-${index}`}
                      label={t("service:form.value")}
                      value={item.value}
                      onChange={(event) =>
                        updateEnv(index, { value: event.target.value })
                      }
                    />
                    <Button
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setEnv((current) =>
                          current.filter(
                            (_item, currentIndex) => currentIndex !== index,
                          ),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{t("service:volumes.title")}</CardTitle>
                  <CardDescription>
                    {t("service:volumes.description")}
                  </CardDescription>
                </div>
                <Button
                  data-testid="service-add-volume-action"
                  disabled={volumeItems.length <= 1}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setVolumes((current) => [
                      ...current,
                      {
                        volumeId: NONE_VOLUME_VALUE,
                        mountPath: "",
                        subPath: "",
                        readOnly: false,
                      },
                    ])
                  }
                >
                  <Plus />
                  {t("service:actions.add_volume")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {volumes.length === 0 ? (
                <Empty
                  className="rounded-md border border-dashed p-4"
                  title={
                    volumeItems.length <= 1
                      ? t("service:volumes.unavailable")
                      : t("service:volumes.empty")
                  }
                />
              ) : (
                volumes.map((volume, index) => (
                  <div className="rounded-md border p-3" key={index}>
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                      <div data-testid={`service-volume-select-${index}`}>
                        <Select<string>
                          items={volumeItems}
                          label={t("service:form.volume.label")}
                          placeholder={t(
                            "service:form.volume.select_placeholder",
                          )}
                          value={volume.volumeId || NONE_VOLUME_VALUE}
                          onValueChange={(volumeId) =>
                            updateVolume(index, {
                              volumeId: volumeId ?? NONE_VOLUME_VALUE,
                            })
                          }
                        />
                      </div>
                      <Input
                        data-testid={`service-volume-sub-path-input-${index}`}
                        label={t("service:form.volume.sub_path")}
                        placeholder="/"
                        value={volume.subPath}
                        onChange={(event) =>
                          updateVolume(index, { subPath: event.target.value })
                        }
                      />
                      <Input
                        data-testid={`service-volume-mount-path-input-${index}`}
                        label={t("service:form.volume.mount_path")}
                        placeholder="/data"
                        value={volume.mountPath}
                        onChange={(event) =>
                          updateVolume(index, { mountPath: event.target.value })
                        }
                      />
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            aria-label={t("service:form.volume.read_only")}
                            data-testid={`service-volume-read-only-input-${index}`}
                            checked={volume.readOnly}
                            onCheckedChange={(readOnly) =>
                              updateVolume(index, { readOnly })
                            }
                          />
                          {t("service:form.volume.read_only")}
                        </label>
                      </div>
                      <div className="flex items-end">
                        <Button
                          aria-label={t("service:actions.remove_volume")}
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setVolumes((current) =>
                              current.filter(
                                (_item, currentIndex) => currentIndex !== index,
                              ),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{t("service:network.ports")}</CardTitle>
                  <CardDescription>
                    {t("service:network.description")}
                  </CardDescription>
                </div>
                <Button
                  data-testid="service-add-port-action"
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
                    data-testid={`service-port-input-${index}`}
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
                    data-testid={`service-target-port-input-${index}`}
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
                  data-testid="service-health-check-enabled"
                  checked={healthCheck.enabled}
                  onCheckedChange={(enabled) =>
                    setHealthCheck((current) => ({ ...current, enabled }))
                  }
                />
              </div>
            </CardHeader>
            {healthCheck.enabled && (
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Select<ServiceHealthCheckType>
                  items={[
                    { label: "HTTP", value: ServiceHealthCheckType.HTTP },
                    { label: "TCP", value: ServiceHealthCheckType.TCP },
                  ]}
                  label={t("service:form.health_check_type")}
                  value={healthCheck.type}
                  onValueChange={(type) => {
                    if (type) {
                      setHealthCheck((current) => ({ ...current, type }));
                    }
                  }}
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
                {healthCheck.type === ServiceHealthCheckType.HTTP && (
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
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{t("service:form.resources")}</CardTitle>
                <Switch
                  aria-label={t("service:form.resources")}
                  data-testid="service-resources-enabled"
                  checked={resourcesEnabled}
                  onCheckedChange={setResourcesEnabled}
                />
              </div>
            </CardHeader>
            {resourcesEnabled && (
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Input
                  data-testid="service-cpu-request-input"
                  label={t("service:form.cpu_request")}
                  placeholder="250m"
                  value={resources.cpuRequest}
                  onChange={(event) =>
                    updateResources({ cpuRequest: event.target.value })
                  }
                />
                <Input
                  data-testid="service-cpu-limit-input"
                  label={t("service:form.cpu_limit")}
                  placeholder="500m"
                  value={resources.cpuLimit}
                  onChange={(event) =>
                    updateResources({ cpuLimit: event.target.value })
                  }
                />
                <Input
                  data-testid="service-memory-request-input"
                  label={t("service:form.memory_request")}
                  placeholder="256Mi"
                  value={resources.memoryRequest}
                  onChange={(event) =>
                    updateResources({ memoryRequest: event.target.value })
                  }
                />
                <Input
                  data-testid="service-memory-limit-input"
                  label={t("service:form.memory_limit")}
                  placeholder="512Mi"
                  value={resources.memoryLimit}
                  onChange={(event) =>
                    updateResources({ memoryLimit: event.target.value })
                  }
                />
              </CardContent>
            )}
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
      </PageContent>
    </Page>
  );
}

function copyEnv(env: EnvValue): EnvValue {
  return { key: env.key, value: env.value };
}

function copyVolume(volume: {
  volumeId: string;
  mountPath: string;
  subPath?: string | null;
  readOnly?: boolean | null;
}): VolumeValue {
  return {
    volumeId: volume.volumeId,
    mountPath: volume.mountPath,
    subPath: volume.subPath ?? "",
    readOnly: volume.readOnly ?? false,
  };
}

function linesToValue(value?: ReadonlyArray<string> | null) {
  return value?.join("\n") ?? "";
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toHealthCheckValue(
  healthCheck?: {
    type: ServiceHealthCheckType;
    port: number;
    path?: string | null;
  } | null,
): HealthCheckValue {
  return {
    enabled: !!healthCheck,
    type: healthCheck?.type ?? ServiceHealthCheckType.HTTP,
    port: healthCheck?.port ?? "",
    path: healthCheck?.path ?? "/healthz",
  };
}

function toVolumeSubPathInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "/") {
    return null;
  }

  return trimmed.replace(/^\/+/, "");
}

function toPortValues(
  ports: ReadonlyArray<{ port: number; targetPort?: number | null }>,
): Array<PortValue> {
  return ports.map((port) => ({
    port: port.port,
    targetPort: port.targetPort ?? "",
  }));
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

function hasResourcesValue(
  resources?: {
    cpuRequest?: string | null;
    cpuLimit?: string | null;
    memoryRequest?: string | null;
    memoryLimit?: string | null;
  } | null,
) {
  return [
    resources?.cpuRequest,
    resources?.cpuLimit,
    resources?.memoryRequest,
    resources?.memoryLimit,
  ].some((value) => value?.trim());
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
