import { Plus, Trash2 } from "lucide-react";
import { t } from "i18next";

import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";

export type ServicePortFormValue = {
  port: number | "";
  targetPort: number | "";
};

export type ServiceEnvFormValue = {
  key: string;
  value: string;
};

export type ServiceFormValue = {
  name: string;
  image: string;
  replicas: number | "";
  ports: ServicePortFormValue[];
  env: ServiceEnvFormValue[];
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
  return {
    name: value.name.trim(),
    image: value.image.trim(),
    ...(value.replicas === "" ? {} : { replicas: value.replicas }),
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
    ports: [{ port: 80, targetPort: "" }],
    env: [],
  };
}
