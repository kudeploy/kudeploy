import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { t } from "i18next";
import { toast } from "sonner";

import { Button } from "@/components/fabric-ui/button";
import { Input } from "@/components/fabric-ui/input";
import { Page } from "@/components/fabric-ui/page";
import { Textarea } from "@/components/fabric-ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";

const UPDATE_SERVICE_SOURCE_FROM_SERVICE_SOURCE_ROUTE = graphql(`
  mutation updateServiceSourceFromServiceSourceRoute(
    $projectId: ID!
    $id: ID!
    $input: UpdateServiceInput!
  ) {
    updateService(projectId: $projectId, id: $id, input: $input) {
      id
      image
      command
      args
      updatedAt
    }
  }
`);

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/_service_layout/source/",
)({
  component: ServiceSourceComponent,
  beforeLoad: () => ({ title: null }),
});

function ServiceSourceComponent() {
  const router = useRouter();
  const { projectId, serviceId } = Route.useParams();
  const { service } = Route.useRouteContext();
  const [image, setImage] = useState(service.image);
  const [command, setCommand] = useState(linesToValue(service.command));
  const [args, setArgs] = useState(linesToValue(service.args));

  const [updateService, { loading }] = useMutation(
    UPDATE_SERVICE_SOURCE_FROM_SERVICE_SOURCE_ROUTE,
  );

  useEffect(() => {
    setImage(service.image);
    setCommand(linesToValue(service.command));
    setArgs(linesToValue(service.args));
  }, [service]);

  const handleSave = async () => {
    const trimmedImage = image.trim();

    if (!trimmedImage) {
      toast.error(t("service:form.image.required"));
      return;
    }

    try {
      await updateService({
        variables: {
          projectId,
          id: serviceId,
          input: {
            image: trimmedImage,
            command: toLines(command),
            args: toLines(args),
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
      title={t("service:tabs.source")}
      description={t("service:source.description")}
      primaryAction={{
        disabled: loading,
        label: t("action.save"),
        onClick: handleSave,
        testId: "service-save-action",
      }}
    >
      <div data-testid="service-source-page">
        <Card>
          <CardHeader>
            <CardTitle>{t("service:source.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              data-testid="service-image-input"
              label={t("service:form.image.label")}
              placeholder={t("service:form.image.placeholder")}
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />

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

function linesToValue(value?: ReadonlyArray<string> | null) {
  return value?.join("\n") ?? "";
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
