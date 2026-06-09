import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { t } from "i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";

type EnvValue = {
  key: string;
  value: string;
};

const UPDATE_SERVICE_ENVIRONMENT_FROM_SERVICE_ENVIRONMENT_ROUTE = graphql(`
  mutation updateServiceEnvironmentFromServiceEnvironmentRoute(
    $projectId: ID!
    $id: ID!
    $input: UpdateServiceInput!
  ) {
    updateService(projectId: $projectId, id: $id, input: $input) {
      id
      env {
        key
        value
      }
      updatedAt
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/environment/",
)({
  component: ServiceEnvironmentComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceEnvironmentComponent() {
  const router = useRouter();
  const { projectId, serviceId } = Route.useParams();
  const { service } = Route.useRouteContext();
  const [env, setEnv] = useState<EnvValue[]>(service.env.map(copyEnv));

  const [updateService, { loading }] = useMutation(
    UPDATE_SERVICE_ENVIRONMENT_FROM_SERVICE_ENVIRONMENT_ROUTE,
  );

  useEffect(() => {
    setEnv(service.env.map(copyEnv));
  }, [service]);

  const updateEnv = (index: number, patch: Partial<EnvValue>) => {
    setEnv((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleSave = async () => {
    try {
      await updateService({
        variables: {
          projectId,
          id: serviceId,
          input: {
            env: env
              .filter((item) => item.key.trim())
              .map((item) => ({
                key: item.key.trim(),
                value: item.value,
              })),
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
      title={t("service:tabs.environment")}
      description={t("service:environment.description")}
      primaryAction={{
        disabled: loading,
        label: t("action.save"),
        onClick: handleSave,
        testId: "service-save-action",
      }}
    >
      <div data-testid="service-environment-page">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{t("service:environment.title")}</CardTitle>
              <Button
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
              <p className="text-muted-foreground text-sm">
                {t("service:environment.empty")}
              </p>
            ) : (
              env.map((item, index) => (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-end gap-2"
                  key={index}
                >
                  <Input
                    label={t("service:form.key")}
                    value={item.key}
                    onChange={(event) =>
                      updateEnv(index, { key: event.target.value })
                    }
                  />
                  <Input
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

function copyEnv(env: EnvValue): EnvValue {
  return { key: env.key, value: env.value };
}
