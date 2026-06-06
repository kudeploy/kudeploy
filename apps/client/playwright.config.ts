import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const clientUrl = process.env.CLIENT_E2E_URL ?? "http://127.0.0.1:3100";
const serverUrl = process.env.SERVER_E2E_URL ?? "http://127.0.0.1:4100";
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL;
const workers = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : 1;
const clientDir = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = resolve(clientDir, "../..");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers,
  expect: {
    timeout: 15_000,
  },
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: clientUrl,
    locale: "zh-CN",
    screenshot: "only-on-failure",
    timezoneId: "Asia/Shanghai",
    trace: "on-first-retry",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(browserChannel ? { channel: browserChannel } : {}),
      },
    },
  ],
  webServer: [
    {
      command: `pnpm --filter @kudeploy/server build && PORT=4100 APP_URL=${clientUrl} AUTH_URL=${serverUrl} pnpm --filter @kudeploy/server start:e2e`,
      cwd: workspaceRoot,
      gracefulShutdown: {
        signal: "SIGTERM",
        timeout: 30_000,
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: `${serverUrl}/api/auth/ok`,
    },
    {
      command:
        "pnpm --filter @kudeploy/client codegen && pnpm --filter @kudeploy/client dev:e2e",
      cwd: workspaceRoot,
      gracefulShutdown: {
        signal: "SIGTERM",
        timeout: 30_000,
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: clientUrl,
    },
  ],
});
