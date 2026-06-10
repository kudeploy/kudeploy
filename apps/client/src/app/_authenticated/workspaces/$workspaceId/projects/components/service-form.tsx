import { Plus, Trash2 } from "lucide-react";
import { t } from "i18next";

import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Select } from "@/components/fabric-ui/select";
import { Textarea } from "@/components/fabric-ui/textarea";
import { Switch } from "@/components/ui/switch";

export type ServicePortFormValue = {
  port: number | "";
  targetPort: number | "";
};

export type ServiceEnvFormValue = {
  key: string;
  value: string;
};

export type ServiceResourcesFormValue = {
  cpuRequest: string;
  cpuLimit: string;
  memoryRequest: string;
  memoryLimit: string;
};

export type ServiceHealthCheckFormValue = {
  enabled: boolean;
  type: "HTTP" | "TCP";
  port: number | "";
  path: string;
};

export type ServiceFormValue = {
  name: string;
  image: string;
  replicas: number | "";
  command: string;
  args: string;
  resources: ServiceResourcesFormValue;
  healthCheck: ServiceHealthCheckFormValue;
  ports: Array<ServicePortFormValue>;
  env: Array<ServiceEnvFormValue>;
};

export function ServiceForm({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: ServiceFormValue;
  onChange: (value: ServiceFormValue) => void;
}) {
  const updatePort = (index: number, patch: Partial<ServicePortFormValue>) => {
    onChange({
      ...value,
      ports: value.ports.map((port, currentIndex) =>
        currentIndex === index ? { ...port, ...patch } : port,
      ),
    });
  };

  const updateEnv = (index: number, patch: Partial<ServiceEnvFormValue>) => {
    onChange({
      ...value,
      env: value.env.map((env, currentIndex) =>
        currentIndex === index ? { ...env, ...patch } : env,
      ),
    });
  };

  const updateResources = (patch: Partial<ServiceResourcesFormValue>) => {
    onChange({
      ...value,
      resources: { ...value.resources, ...patch },
    });
  };

  const updateHealthCheck = (patch: Partial<ServiceHealthCheckFormValue>) => {
    onChange({
      ...value,
      healthCheck: { ...value.healthCheck, ...patch },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Input
        data-testid="service-name-input"
        disabled={disabled}
        label={t("service:form.name.label")}
        placeholder={t("service:form.name.placeholder")}
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />

      <Input
        data-testid="service-image-input"
        disabled={disabled}
        label={t("service:form.image.label")}
        placeholder={t("service:form.image.placeholder")}
        value={value.image}
        onChange={(event) => onChange({ ...value, image: event.target.value })}
      />

      <Input
        data-testid="service-replicas-input"
        disabled={disabled}
        label={t("service:form.replicas")}
        min={0}
        type="number"
        value={value.replicas}
        onChange={(event) =>
          onChange({
            ...value,
            replicas:
              event.target.value === "" ? "" : Number(event.target.value),
          })
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Textarea
          data-testid="service-command-input"
          disabled={disabled}
          label={t("service:form.command.label")}
          placeholder={t("service:form.command.placeholder")}
          value={value.command}
          onChange={(event) =>
            onChange({ ...value, command: event.target.value })
          }
        />
        <Textarea
          data-testid="service-args-input"
          disabled={disabled}
          label={t("service:form.args.label")}
          placeholder={t("service:form.args.placeholder")}
          value={value.args}
          onChange={(event) => onChange({ ...value, args: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">{t("service:form.resources")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            disabled={disabled}
            label={t("service:form.cpu_request")}
            placeholder="250m"
            value={value.resources.cpuRequest}
            onChange={(event) =>
              updateResources({ cpuRequest: event.target.value })
            }
          />
          <Input
            disabled={disabled}
            label={t("service:form.cpu_limit")}
            placeholder="500m"
            value={value.resources.cpuLimit}
            onChange={(event) =>
              updateResources({ cpuLimit: event.target.value })
            }
          />
          <Input
            disabled={disabled}
            label={t("service:form.memory_request")}
            placeholder="256Mi"
            value={value.resources.memoryRequest}
            onChange={(event) =>
              updateResources({ memoryRequest: event.target.value })
            }
          />
          <Input
            disabled={disabled}
            label={t("service:form.memory_limit")}
            placeholder="512Mi"
            value={value.resources.memoryLimit}
            onChange={(event) =>
              updateResources({ memoryLimit: event.target.value })
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">
            {t("service:form.health_check")}
          </h2>
          <Switch
            checked={value.healthCheck.enabled}
            disabled={disabled}
            onCheckedChange={(checked) =>
              updateHealthCheck({ enabled: checked })
            }
          />
        </div>

        {value.healthCheck.enabled && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Select<"HTTP" | "TCP">
              disabled={disabled}
              items={[
                { label: "HTTP", value: "HTTP" },
                { label: "TCP", value: "TCP" },
              ]}
              label={t("service:form.health_check_type")}
              value={value.healthCheck.type}
              onValueChange={(type) => updateHealthCheck({ type })}
            />
            <Input
              disabled={disabled}
              label={t("service:form.health_check_port")}
              min={1}
              type="number"
              value={value.healthCheck.port}
              onChange={(event) =>
                updateHealthCheck({
                  port:
                    event.target.value === "" ? "" : Number(event.target.value),
                })
              }
            />
            {value.healthCheck.type === "HTTP" && (
              <Input
                disabled={disabled}
                label={t("service:form.health_check_path")}
                placeholder="/healthz"
                value={value.healthCheck.path}
                onChange={(event) =>
                  updateHealthCheck({ path: event.target.value })
                }
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3" data-testid="service-ports-field">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">{t("service:form.ports")}</h2>
          <Button
            disabled={disabled}
            size="sm"
            type="button"
            variant="secondary"
            onClick={() =>
              onChange({
                ...value,
                ports: [...value.ports, { port: "", targetPort: "" }],
              })
            }
          >
            <Plus />
            {t("service:actions.add_port")}
          </Button>
        </div>

        {value.ports.map((port, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-end gap-2"
            key={index}
          >
            <Input
              disabled={disabled}
              label={t("service:form.port")}
              min={1}
              type="number"
              value={port.port}
              onChange={(event) =>
                updatePort(index, {
                  port:
                    event.target.value === "" ? "" : Number(event.target.value),
                })
              }
            />
            <Input
              disabled={disabled}
              label={t("service:form.target_port")}
              min={1}
              type="number"
              value={port.targetPort}
              onChange={(event) =>
                updatePort(index, {
                  targetPort:
                    event.target.value === "" ? "" : Number(event.target.value),
                })
              }
            />
            <Button
              disabled={disabled || value.ports.length === 1}
              size="icon"
              type="button"
              variant="ghost"
              onClick={() =>
                onChange({
                  ...value,
                  ports: value.ports.filter(
                    (_port, currentIndex) => currentIndex !== index,
                  ),
                })
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3" data-testid="service-env-field">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">{t("service:form.env")}</h2>
          <Button
            disabled={disabled}
            size="sm"
            type="button"
            variant="secondary"
            onClick={() =>
              onChange({
                ...value,
                env: [...value.env, { key: "", value: "" }],
              })
            }
          >
            <Plus />
            {t("service:actions.add_env")}
          </Button>
        </div>

        {value.env.map((env, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-end gap-2"
            key={index}
          >
            <Input
              disabled={disabled}
              label={t("service:form.key")}
              value={env.key}
              onChange={(event) =>
                updateEnv(index, { key: event.target.value })
              }
            />
            <Input
              disabled={disabled}
              label={t("service:form.value")}
              value={env.value}
              onChange={(event) =>
                updateEnv(index, { value: event.target.value })
              }
            />
            <Button
              disabled={disabled}
              size="icon"
              type="button"
              variant="ghost"
              onClick={() =>
                onChange({
                  ...value,
                  env: value.env.filter(
                    (_env, currentIndex) => currentIndex !== index,
                  ),
                })
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function toServiceInput(value: ServiceFormValue) {
  const command = toLines(value.command);
  const args = toLines(value.args);
  const resources = toResourcesInput(value.resources);

  return {
    name: value.name.trim(),
    image: value.image.trim(),
    ...(value.replicas === "" ? {} : { replicas: value.replicas }),
    command,
    args,
    resources,
    healthCheck:
      value.healthCheck.enabled && value.healthCheck.port !== ""
        ? {
            type: value.healthCheck.type,
            port: Number(value.healthCheck.port),
            ...(value.healthCheck.type === "HTTP" && value.healthCheck.path
              ? { path: value.healthCheck.path.trim() }
              : {}),
          }
        : null,
    ports: value.ports
      .filter((port) => port.port !== "")
      .map((port) => ({
        port: Number(port.port),
        ...(port.targetPort === ""
          ? {}
          : { targetPort: Number(port.targetPort) }),
      })),
    env: value.env
      .filter((env) => env.key.trim())
      .map((env) => ({
        key: env.key.trim(),
        value: env.value,
      })),
  };
}

export function initialServiceFormValue(): ServiceFormValue {
  return {
    name: "",
    image: "",
    replicas: 1,
    command: "",
    args: "",
    resources: {
      cpuRequest: "",
      cpuLimit: "",
      memoryRequest: "",
      memoryLimit: "",
    },
    healthCheck: {
      enabled: false,
      type: "HTTP",
      port: "",
      path: "/healthz",
    },
    ports: [{ port: 80, targetPort: "" }],
    env: [],
  };
}

export function linesToValue(value?: ReadonlyArray<string> | null) {
  return value?.join("\n") ?? "";
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toResourcesInput(value: ServiceResourcesFormValue) {
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
