import { spawnSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distChartsDir = path.join(rootDir, "dist/charts");
const controllerImage = process.env.CONTROLLER_IMAGE || "ghcr.io/kudeploy/controller";
const helmRegistry = process.env.HELM_OCI_REGISTRY || "oci://ghcr.io/kudeploy/helm-charts";
const dockerPlatforms = process.env.DOCKER_PLATFORMS || "linux/amd64,linux/arm64";
const args = new Set(process.argv.slice(2));
const publishAll = process.env.FORCE_PUBLISH === "true" || args.has("--all");
const overwriteExisting = process.env.OVERWRITE_EXISTING === "true" || args.has("--overwrite");

const charts = [
  { name: "kudeploy-crds", env: "PUBLISH_KUDEPLOY_CRDS" },
  { name: "kudeploy-controller", env: "PUBLISH_KUDEPLOY_CONTROLLER" },
  { name: "kudeploy", env: "PUBLISH_KUDEPLOY" },
];

function envFlag(name) {
  return process.env[name] === "true";
}

function run(command, commandArgs, options = {}) {
  console.log(`$ ${[command, ...commandArgs].join(" ")}`);

  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    encoding: "utf8",
    input: options.input,
    stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function succeeds(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    stdio: "ignore",
  });

  return result.status === 0;
}

async function readVersion(packagePath) {
  const packageJson = JSON.parse(await readFile(path.join(rootDir, packagePath), "utf8"));
  return packageJson.version;
}

function loginHelmRegistry() {
  const actor = process.env.GITHUB_ACTOR;
  const token = process.env.GITHUB_TOKEN;

  if (!actor || !token) {
    return;
  }

  run("helm", ["registry", "login", "ghcr.io", "--username", actor, "--password-stdin"], {
    input: token,
  });
}

async function publishController() {
  const version = await readVersion("apps/controller/package.json");
  const versionedImage = `${controllerImage}:${version}`;

  if (!overwriteExisting && succeeds("docker", ["buildx", "imagetools", "inspect", versionedImage])) {
    console.log(`${versionedImage} already exists; skipping Docker image publish.`);
    return;
  }

  run("docker", [
    "buildx",
    "build",
    "--platform",
    dockerPlatforms,
    "--push",
    "--tag",
    versionedImage,
    "--tag",
    `${controllerImage}:latest`,
    "--file",
    "apps/controller/Dockerfile",
    "apps/controller",
  ]);
}

async function publishChart(chartName) {
  const version = await readVersion(`charts/${chartName}/package.json`);
  const chartRef = `${helmRegistry}/${chartName}`;

  if (!overwriteExisting && succeeds("helm", ["show", "chart", chartRef, "--version", version])) {
    console.log(`${chartRef}:${version} already exists; skipping Helm chart publish.`);
    return;
  }

  run("helm", ["package", `charts/${chartName}`, "--destination", distChartsDir]);
  run("helm", ["push", `${distChartsDir}/${chartName}-${version}.tgz`, helmRegistry]);
}

const publishControllerImage = publishAll || envFlag("PUBLISH_CONTROLLER");
const chartsToPublish = charts.filter((chart) => publishAll || envFlag(chart.env));

if (!publishControllerImage && chartsToPublish.length === 0) {
  console.log("No publish targets selected.");
  process.exit(0);
}

run("node", ["scripts/sync-chart-versions.mjs"]);

if (publishControllerImage) {
  await publishController();
}

if (chartsToPublish.length > 0) {
  loginHelmRegistry();
  await mkdir(distChartsDir, { recursive: true });
  run("helm", ["dependency", "update", "charts/kudeploy-controller"]);
  run("helm", ["dependency", "update", "charts/kudeploy"]);

  for (const chart of chartsToPublish) {
    await publishChart(chart.name);
  }
}
