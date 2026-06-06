import { expect, test } from "@playwright/test";
import type { Page, Route as PlaywrightRoute } from "@playwright/test";

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

const now = "2026-06-06T00:00:00.000Z";

test.describe("workspace Projects and Services", () => {
  test("creates a project, creates and edits a service, and deletes the project", async ({
    page,
  }) => {
    const seed = uniqueSeed("projects");
    const workspaceName = `Projects Workspace ${seed}`;

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
      new RegExp(`/workspaces/${workspaceId}/projects/project-e2e$`),
    );
    await expect(page.getByTestId("project-detail-page")).toBeVisible();
    await expect(page.getByTestId("project-status")).toContainText("处理中");

    await page.goto(
      `/workspaces/${workspaceId}/projects/project-e2e/services`,
    );
    await expect(page.getByTestId("services-page")).toBeVisible();

    await page.getByTestId("service-create-action").click();
    await page.getByTestId("service-name-input").fill("API");
    await page
      .getByTestId("service-image-input")
      .fill("ghcr.io/kudeploy/api:latest");
    await page.getByTestId("service-create-submit").click();

    await expect(page).toHaveURL(
      new RegExp(
        `/workspaces/${workspaceId}/projects/project-e2e/services/service-e2e$`,
      ),
    );
    await expect(page.getByTestId("service-detail-page")).toBeVisible();
    await expect(page.getByTestId("service-status")).toContainText("就绪");

    await page.getByTestId("service-name-input").fill("API Edited");
    await page
      .getByTestId("service-image-input")
      .fill("ghcr.io/kudeploy/api:v2");
    await page.getByTestId("service-save-action").click();

    await expect(page.getByTestId("service-name-input")).toHaveValue(
      "API Edited",
    );
    await expect(page.getByTestId("service-image-input")).toHaveValue(
      "ghcr.io/kudeploy/api:v2",
    );

    await page.goto(`/workspaces/${workspaceId}/projects/project-e2e`);
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
        await fulfill(route, {
          createService: service,
        });
        return;
      }
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
      case "updateServiceFromServiceRoute": {
        const service = services.find(
          (item) =>
            item.projectId === variables.projectId && item.id === variables.id,
        );
        if (service) {
          Object.assign(service, {
            ...variables.input,
            updatedAt: now,
            ports: variables.input.ports.map(
              (port: { port: number; targetPort?: number | null }) => ({
                port: port.port,
                targetPort: port.targetPort ?? null,
              }),
            ),
            env: variables.input.env ?? [],
          });
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
  };
}

async function fulfill(route: PlaywrightRoute, data: unknown) {
  await route.fulfill({
    contentType: "application/json",
    status: 200,
    body: JSON.stringify({ data }),
  });
}
