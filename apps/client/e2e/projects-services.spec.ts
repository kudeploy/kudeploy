import { expect, test } from "@playwright/test";
import type {
  Page,
  Route as PlaywrightRoute,
  WebSocketRoute,
} from "@playwright/test";

import { registerUser } from "./utils/auth";
import { uniqueSeed } from "./utils/unique";
import { createFirstWorkspace } from "./utils/workspace";

type MockProject = {
  id: string;
  name: string;
  status: "PENDING" | "PROGRESSING" | "READY" | "FAILED" | "UNKNOWN";
  createdAt: string;
  updatedAt: string;
};

type MockService = {
  id: string;
  projectId: string;
  name: string;
  image: string;
  replicas: number | null;
  command: string[];
  args: string[];
  resources: {
    cpuRequest: string | null;
    cpuLimit: string | null;
    memoryRequest: string | null;
    memoryLimit: string | null;
  } | null;
  healthCheck: {
    type: "HTTP" | "TCP";
    port: number;
    path: string | null;
  } | null;
  status: "PENDING" | "PROGRESSING" | "READY" | "FAILED" | "UNKNOWN";
  createdAt: string;
  updatedAt: string;
  ports: Array<{
    port: number;
    targetPort: number | null;
  }>;
  env: Array<{
    key: string;
    value: string;
  }>;
};

type MockDeployment = {
  id: string;
  projectId: string;
  serviceId: string;
  version: number;
  image: string;
  replicas: number | null;
  ports: Array<{
    port: number;
    targetPort: number | null;
  }>;
  env: Array<{
    name: string;
    value: string | null;
  }>;
  envFrom: Array<{
    kind: "ConfigMap" | "Secret";
    name: string;
    prefix: string | null;
  }>;
  command: string[];
  args: string[];
  resources: {
    cpuRequest: string | null;
    cpuLimit: string | null;
    memoryRequest: string | null;
    memoryLimit: string | null;
  } | null;
  serviceAccountName: string | null;
  status: "PENDING" | "PROGRESSING" | "READY" | "FAILED" | "UNKNOWN";
  active: boolean;
  latest: boolean;
  kubernetesDeploymentName: string | null;
  createdAt: string;
  updatedAt: string;
};

const now = "2026-06-06T00:00:00.000Z";

test.describe("workspace Projects and Services", () => {
  test("creates a project, creates and edits a service, and deletes the project", async ({
    page,
  }) => {
    const seed = uniqueSeed("projects");
    const workspaceName = `Projects Workspace ${seed}`;
    const terminalSocket = await mockServiceTerminalSocket(page);

    await registerUser(page, {
      email: `${seed}@example.com`,
      name: "Project Owner",
    });

    const workspaceId = await createFirstWorkspace(page, workspaceName);
    await mockProjectsAndServicesGraphql(page);

    await page.getByTestId("workspace-sidebar-projects-link").click();
    await expect(page).toHaveURL(
      new RegExp(`/workspaces/${workspaceId}/projects(\\?.*)?$`),
    );
    await expect(page.getByTestId("projects-page")).toBeVisible();

    await page.getByTestId("project-create-action").click();
    await page.getByTestId("project-name-input").fill("Payments");
    await page.getByTestId("project-create-submit").click();

    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services(\\?.*)?$`,
      ),
    );
    await expect(page.getByTestId("services-page")).toBeVisible();
    await expect(page.getByTestId("project-services-tab")).toBeVisible();
    await expect(page.getByTestId("project-settings-tab")).toBeVisible();
    await expect(page.getByTestId("project-services-tab")).toHaveAttribute(
      "data-active",
      "true",
    );

    const breadcrumb = page.getByLabel("面包屑导航");
    await expect(breadcrumb).toContainText(/项目.*Payments/);
    await expect(breadcrumb).not.toContainText("服务");

    await page.getByTestId("project-settings-tab").click();
    await expect(page).toHaveURL(
      new RegExp(`/workspaces/${workspaceId}/projects/project-e2e/settings$`),
    );
    await expect(page.getByTestId("project-detail-page")).toBeVisible();
    await expect(page.getByTestId("project-status")).toContainText("处理中");
    await expect(page.getByTestId("project-settings-tab")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(breadcrumb).toContainText("项目");
    await expect(breadcrumb).toContainText("Payments");
    await expect(breadcrumb).not.toContainText("设置");

    await page.getByTestId("project-services-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services(\\?.*)?$`,
      ),
    );

    await page.getByTestId("service-create-action").click();
    await page.getByTestId("service-name-input").fill("API");
    await page
      .getByTestId("service-image-input")
      .fill("ghcr.io/kudeploy/api:latest");
    await page.getByTestId("service-command-input").fill("node");
    await page.getByTestId("service-args-input").fill("server.js");
    await page.getByPlaceholder("250m").fill("250m");
    await page.getByPlaceholder("500m").fill("500m");
    await page.getByPlaceholder("256Mi").fill("256Mi");
    await page.getByPlaceholder("512Mi").fill("512Mi");
    await page.getByTestId("service-create-submit").click();

    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e$`,
      ),
    );
    await expect(page.getByTestId("service-detail-page")).toBeVisible();
    await expect(page.getByTestId("project-services-tab")).not.toBeVisible();
    await expect(page.getByTestId("project-settings-tab")).not.toBeVisible();
    await expect(page.getByTestId("service-overview-tab")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.getByTestId("service-source-tab")).toBeVisible();
    await expect(page.getByTestId("service-environment-tab")).toBeVisible();
    await expect(page.getByTestId("service-network-tab")).toBeVisible();
    await expect(page.getByTestId("service-deployments-tab")).toBeVisible();
    await expect(page.getByTestId("service-settings-tab")).toBeVisible();
    await expect(page.getByTestId("service-status")).toContainText("就绪");
    await expect(breadcrumb).toContainText(/项目.*Payments.*服务.*API/);

    await page.getByTestId("service-source-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/source$`,
      ),
    );
    await expect(page.getByTestId("service-source-page")).toBeVisible();
    await page
      .getByTestId("service-image-input")
      .fill("ghcr.io/kudeploy/api:v2");
    await page.getByTestId("service-save-action").click();
    await expect(page.getByTestId("service-image-input")).toHaveValue(
      "ghcr.io/kudeploy/api:v2",
    );

    await page.getByTestId("service-environment-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/environment$`,
      ),
    );
    await expect(page.getByTestId("service-environment-page")).toBeVisible();
    await expect(breadcrumb).toContainText(/项目.*Payments.*服务.*API/);
    await expect(breadcrumb).not.toContainText("环境变量");

    await page.getByTestId("service-network-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/network$`,
      ),
    );
    await expect(page.getByTestId("service-network-page")).toBeVisible();

    await page.getByTestId("service-deployments-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/deployments$`,
      ),
    );
    await expect(page.getByTestId("service-deployments-page")).toBeVisible();
    await expect(
      page.getByTestId("service-deployment-row-deployment-v2"),
    ).toContainText("v2");
    await expect(
      page.getByTestId("service-deployment-row-deployment-v2"),
    ).toContainText("ghcr.io/kudeploy/api:v2");
    await expect(
      page.getByTestId("service-deployment-row-deployment-v2"),
    ).toContainText("当前");
    await expect(
      page.getByTestId("service-deployment-row-deployment-v2"),
    ).toContainText("最新");
    await expect(
      page.getByTestId("service-deployment-active-deployment-v2"),
    ).toBeVisible();
    await expect(
      page.getByTestId("service-deployment-latest-deployment-v2"),
    ).toBeVisible();
    await expect(
      page.getByTestId("service-deployments-page"),
    ).not.toContainText("配置详情");
    await expect(
      page.getByTestId("service-deployment-row-deployment-v1"),
    ).toContainText("ghcr.io/kudeploy/api:latest");

    await page.getByTestId("service-deployment-row-deployment-v2").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/deployments/deployment-v2$`,
      ),
    );
    await expect(page.getByTestId("deployment-detail-page")).toBeVisible();
    await expect(page.getByTestId("service-overview-tab")).not.toBeVisible();
    await expect(page.getByTestId("service-deployments-tab")).not.toBeVisible();
    await expect(breadcrumb).toContainText(
      /项目.*Payments.*服务.*API.*部署.*v2/,
    );
    await expect(page.getByTestId("deployment-overview-tab")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.getByTestId("deployment-configuration-tab")).toHaveCount(
      0,
    );
    await expect(page.getByTestId("deployment-active-badge")).toBeVisible();
    await expect(page.getByTestId("deployment-latest-badge")).toBeVisible();
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("配置详情");
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("node");
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("server.js");
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("80");
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("service-service-e2e");
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("250m");
    await expect(
      page.getByTestId("deployment-configuration-section"),
    ).toContainText("512Mi");

    await page.goto(
      `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/deployments`,
    );
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/deployments$`,
      ),
    );
    await expect(page.getByTestId("service-deployments-tab")).toBeVisible();

    await page.getByTestId("service-terminal-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/terminal$`,
      ),
    );
    await expect(page.getByTestId("service-terminal-page")).toBeVisible();
    await expect(page.getByTestId("service-terminal-status")).toBeVisible();
    await expect
      .poll(() => terminalSocket.events.filter((event) => event[0] === "start"))
      .toHaveLength(1);

    await page.locator(".xterm").click();
    await page.keyboard.type("echo before-start");
    await expect
      .poll(() => terminalSocket.events.filter((event) => event[0] === "data"))
      .toHaveLength(0);

    terminalSocket.start();
    await expect(page.getByTestId("service-terminal-status")).toContainText(
      "已连接",
    );
    await page.locator(".xterm").click();
    await page.keyboard.type("echo ready");
    await expect
      .poll(() => terminalSocket.events.filter((event) => event[0] === "data"))
      .not.toHaveLength(0);

    const dataEventCount = terminalSocket.events.filter(
      (event) => event[0] === "data",
    ).length;
    terminalSocket.end();
    await expect(page.getByTestId("service-terminal-status")).toContainText(
      "未连接",
    );
    await page.locator(".xterm").click();
    await page.keyboard.type("echo after-exit");
    await expect
      .poll(
        () =>
          terminalSocket.events.filter((event) => event[0] === "data").length,
      )
      .toBe(dataEventCount);

    await page.getByTestId("service-logs-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/logs$`,
      ),
    );
    await expect(page.getByTestId("service-logs-page")).toBeVisible();
    await expect(page.getByTestId("service-logs-page")).toContainText(
      "API booted",
    );
    await expect(page.getByTestId("service-logs-page")).toContainText(
      "deployment-v1",
    );

    await page.getByTestId("service-metrics-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/metrics$`,
      ),
    );
    await expect(page.getByTestId("service-metrics-page")).toBeVisible();
    await expect(page.getByTestId("service-cpu-metrics-card")).toContainText(
      "125m",
    );
    await expect(
      page.getByTestId("service-network-metrics-card"),
    ).toContainText("接收");
    await page.getByLabel("时间范围").click();
    for (const option of ["1h", "3h", "6h", "12h", "24h", "3d", "7d"]) {
      await expect(page.getByRole("option", { name: option })).toBeVisible();
    }
    await page.keyboard.press("Escape");

    await page.getByTestId("service-settings-tab").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e/settings$`,
      ),
    );
    await expect(page.getByTestId("service-settings-page")).toBeVisible();

    await page.getByTestId("service-name-input").fill("API Edited");
    await page.getByTestId("service-save-action").click();

    await expect(page.getByTestId("service-name-input")).toHaveValue(
      "API Edited",
    );

    await page.goto(`/workspaces/${workspaceId}/projects/project-e2e/settings`);
    await page.getByTestId("project-delete-action").click();
    await page.getByTestId("alert-dialog-confirm").click();

    await expect(page).toHaveURL(
      new RegExp(`/workspaces/${workspaceId}/projects(\\?.*)?$`),
    );
    await expect(page.getByTestId("project-row-project-e2e")).not.toBeVisible();
  });
});

async function mockProjectsAndServicesGraphql(page: Page) {
  const projects: MockProject[] = [];
  const services: MockService[] = [];
  const deployments: MockDeployment[] = [];

  await page.route("**/api/graphql", async (route) => {
    const request = route.request();
    const payload = request.postDataJSON() as
      | {
          operationName?: string;
          variables?: Record<string, any>;
        }
      | undefined;
    const operationName = payload?.operationName;
    const variables = payload?.variables ?? {};

    if (!operationName) {
      await route.continue();
      return;
    }

    switch (operationName) {
      case "getProjectsFromProjectsRoute": {
        await fulfill(route, {
          projects: connection(projects),
        });
        return;
      }
      case "createProjectFromProjectsRoute": {
        const project: MockProject = {
          id: "project-e2e",
          name: variables.input.name,
          status: "PROGRESSING",
          createdAt: now,
          updatedAt: now,
        };
        projects.push(project);
        await fulfill(route, {
          createProject: project,
        });
        return;
      }
      case "getProjectFromProjectRoute": {
        await fulfill(route, {
          project:
            projects.find((project) => project.id === variables.id) ?? null,
        });
        return;
      }
      case "getProjectFromProjectLayout": {
        await fulfill(route, {
          project:
            projects.find((project) => project.id === variables.id) ?? null,
        });
        return;
      }
      case "deleteProjectFromProjectRoute":
      case "deleteProjectFromProjectsRoute": {
        const index = projects.findIndex(
          (project) => project.id === variables.id,
        );
        const [project] = index >= 0 ? projects.splice(index, 1) : [];
        await fulfill(route, {
          deleteProject: project ?? { id: variables.id },
        });
        return;
      }
      case "getServicesFromServicesRoute": {
        await fulfill(route, {
          project:
            projects.find((project) => project.id === variables.projectId) ??
            null,
          services: connection(
            services.filter(
              (service) => service.projectId === variables.projectId,
            ),
          ),
        });
        return;
      }
      case "createServiceFromServicesRoute": {
        const input = variables.input;
        const service: MockService = {
          id: "service-e2e",
          projectId: input.projectId,
          name: input.name,
          image: input.image,
          replicas: input.replicas ?? null,
          command: input.command ?? [],
          args: input.args ?? [],
          resources: input.resources ?? null,
          healthCheck: input.healthCheck ?? null,
          status: "READY",
          createdAt: now,
          updatedAt: now,
          ports: input.ports.map(
            (port: { port: number; targetPort?: number | null }) => ({
              port: port.port,
              targetPort: port.targetPort ?? null,
            }),
          ),
          env: input.env ?? [],
        };
        services.push(service);
        deployments.push(createDeploymentSnapshot(service, 1, "deployment-v1"));
        await fulfill(route, {
          createService: service,
        });
        return;
      }
      case "getServiceFromServiceLayout":
      case "getServiceFromServiceRoute": {
        await fulfill(route, {
          service:
            services.find(
              (service) =>
                service.projectId === variables.projectId &&
                service.id === variables.id,
            ) ?? null,
        });
        return;
      }
      case "getServiceDeploymentsFromServiceDeploymentsRoute": {
        await fulfill(route, {
          deployments: connection(
            deployments.filter(
              (deployment) =>
                deployment.projectId === variables.projectId &&
                deployment.serviceId === variables.serviceId,
            ),
          ),
        });
        return;
      }
      case "getServiceLogsFromServiceLogsRoute": {
        await fulfill(route, {
          service: {
            id: variables.id,
            logs: {
              available: true,
              rangeSeconds: variables.rangeSeconds ?? 3600,
              limit: variables.limit ?? 200,
              entries: [
                {
                  timestamp: "2026-06-06T00:00:00.000Z",
                  message: "API booted",
                  namespace: variables.projectId,
                  podName: "api-75d4db5d87-lkxgh",
                  containerName: "api",
                  deploymentName: "deployment-v1",
                },
              ],
            },
          },
        });
        return;
      }
      case "getDeploymentFromDeploymentLayout": {
        await fulfill(route, {
          deployment:
            deployments.find(
              (deployment) =>
                deployment.projectId === variables.projectId &&
                deployment.id === variables.id,
            ) ?? null,
        });
        return;
      }
      case "getServiceMetricsFromServiceMetricsRoute": {
        await fulfill(route, {
          service: {
            id: variables.id,
            metrics: {
              available: true,
              rangeSeconds: variables.rangeSeconds ?? 3600,
              stepSeconds: variables.stepSeconds ?? 300,
              cpuLimitMillicores: 500,
              memoryLimitBytes: 536_870_912,
              cpuUsageMillicores: [
                {
                  timestamp: "2026-06-06T00:00:00.000Z",
                  value: 100,
                },
                {
                  timestamp: "2026-06-06T00:05:00.000Z",
                  value: 125,
                },
              ],
              memoryUsageBytes: [
                {
                  timestamp: "2026-06-06T00:00:00.000Z",
                  value: 201_326_592,
                },
                {
                  timestamp: "2026-06-06T00:05:00.000Z",
                  value: 268_435_456,
                },
              ],
              networkReceiveBytesPerSecond: [
                {
                  timestamp: "2026-06-06T00:00:00.000Z",
                  value: 1024,
                },
                {
                  timestamp: "2026-06-06T00:05:00.000Z",
                  value: 2048,
                },
              ],
              networkTransmitBytesPerSecond: [
                {
                  timestamp: "2026-06-06T00:00:00.000Z",
                  value: 512,
                },
                {
                  timestamp: "2026-06-06T00:05:00.000Z",
                  value: 1024,
                },
              ],
            },
          },
        });
        return;
      }
      case "deleteServiceFromServiceRoute":
      case "deleteServiceFromServiceSettingsRoute": {
        const index = services.findIndex(
          (service) =>
            service.projectId === variables.projectId &&
            service.id === variables.id,
        );
        const [service] = index >= 0 ? services.splice(index, 1) : [];
        await fulfill(route, {
          deleteService: service ?? { id: variables.id },
        });
        return;
      }
      case "updateServiceFromServiceRoute":
      case "updateServiceSourceFromServiceSourceRoute":
      case "updateServiceEnvironmentFromServiceEnvironmentRoute":
      case "updateServiceNetworkFromServiceNetworkRoute":
      case "updateServiceSettingsFromServiceSettingsRoute": {
        const service = services.find(
          (item) =>
            item.projectId === variables.projectId && item.id === variables.id,
        );
        if (service) {
          const input = variables.input;
          if ("name" in input) service.name = input.name;
          if ("image" in input) service.image = input.image;
          if ("replicas" in input) service.replicas = input.replicas ?? null;
          if ("command" in input) service.command = input.command ?? [];
          if ("args" in input) service.args = input.args ?? [];
          if ("resources" in input) service.resources = input.resources ?? null;
          if ("healthCheck" in input) {
            service.healthCheck = input.healthCheck ?? null;
          }
          if ("ports" in input) {
            service.ports = input.ports.map(
              (port: { port: number; targetPort?: number | null }) => ({
                port: port.port,
                targetPort: port.targetPort ?? null,
              }),
            );
          }
          if ("env" in input) service.env = input.env ?? [];
          service.updatedAt = now;

          if ("image" in input) {
            deployments.forEach((deployment) => {
              if (deployment.serviceId === service.id) {
                deployment.active = false;
                deployment.latest = false;
              }
            });
            deployments.unshift(
              createDeploymentSnapshot(service, 2, "deployment-v2"),
            );
          }
        }
        await fulfill(route, {
          updateService: service,
        });
        return;
      }
      default:
        await route.continue();
    }
  });
}

function createDeploymentSnapshot(
  service: MockService,
  version: number,
  id: string,
): MockDeployment {
  return {
    id,
    projectId: service.projectId,
    serviceId: service.id,
    version,
    image: service.image,
    replicas: service.replicas,
    ports: service.ports,
    env: service.env.map((env) => ({
      name: env.key,
      value: env.value,
    })),
    envFrom: [],
    command: service.command,
    args: service.args,
    resources: service.resources,
    serviceAccountName: `service-${service.id}`,
    status: "READY",
    active: true,
    latest: true,
    kubernetesDeploymentName: id,
    createdAt: now,
    updatedAt: now,
  };
}

function connection<T extends { id: string }>(nodes: T[]) {
  return {
    edges: nodes.map((node) => ({
      cursor: node.id,
      node,
    })),
    pageInfo: {
      endCursor: nodes.at(-1)?.id ?? null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: nodes[0]?.id ?? null,
    },
    totalCount: nodes.length,
  };
}

async function fulfill(route: PlaywrightRoute, data: unknown) {
  await route.fulfill({
    contentType: "application/json",
    status: 200,
    body: JSON.stringify({ data }),
  });
}

async function mockServiceTerminalSocket(page: Page) {
  const events: Array<[string, unknown]> = [];
  let socket: WebSocketRoute | null = null;

  await page.routeWebSocket(
    (url) => url.pathname === "/api/socket.io/",
    (ws) => {
      socket = ws;
      ws.send(
        '0{"sid":"service-terminal-e2e","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}',
      );
      ws.onMessage((message) => {
        const packet = message.toString();

        if (packet === "3") {
          return;
        }

        if (packet.startsWith("40/service-terminal")) {
          ws.send(
            '40/service-terminal,{"sid":"service-terminal-namespace-e2e"}',
          );
          return;
        }

        if (packet.startsWith("42/service-terminal,")) {
          const event = JSON.parse(
            packet.slice("42/service-terminal,".length),
          ) as [string, unknown];
          events.push(event);
        }
      });
    },
  );

  return {
    events,
    start: () => {
      socket?.send('42/service-terminal,["started"]');
    },
    end: () => {
      socket?.send('42/service-terminal,["ended"]');
    },
  };
}
