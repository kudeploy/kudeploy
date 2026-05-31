import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chartsDir = path.join(rootDir, "charts");

function replaceYamlField(yaml, field, value, filePath) {
  const nextYaml = yaml.replace(
    new RegExp(`^${field}:\\s*.+$`, "m"),
    `${field}: ${value}`,
  );

  if (nextYaml === yaml && yaml.includes(`${field}: ${value}`)) {
    return yaml;
  }

  if (nextYaml === yaml) {
    throw new Error(`Could not find a ${field} field in ${filePath}`);
  }

  return nextYaml;
}

const chartNames = await readdir(chartsDir);

for (const chartName of chartNames.sort()) {
  const chartDir = path.join(chartsDir, chartName);
  const packagePath = path.join(chartDir, "package.json");
  const chartPath = path.join(chartDir, "Chart.yaml");
  const chartYamlPath = path.relative(rootDir, chartPath);

  let packageJson;
  let chartYaml;

  try {
    packageJson = JSON.parse(await readFile(packagePath, "utf8"));
    chartYaml = await readFile(chartPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      continue;
    }

    throw error;
  }

  const nextChartYaml = replaceYamlField(
    chartYaml,
    "version",
    packageJson.version,
    chartYamlPath,
  );

  if (nextChartYaml !== chartYaml) {
    await writeFile(chartPath, nextChartYaml);
    console.log(`Synced ${chartYamlPath} version to ${packageJson.version}`);
  }
}

const controllerPackagePath = path.join(rootDir, "apps/controller/package.json");
const controllerChartPath = path.join(rootDir, "charts/kudeploy-controller/Chart.yaml");
const controllerChartYamlPath = path.relative(rootDir, controllerChartPath);
const controllerPackageJson = JSON.parse(await readFile(controllerPackagePath, "utf8"));
const controllerChartYaml = await readFile(controllerChartPath, "utf8");
const nextControllerChartYaml = replaceYamlField(
  controllerChartYaml,
  "appVersion",
  controllerPackageJson.version,
  controllerChartYamlPath,
);

if (nextControllerChartYaml !== controllerChartYaml) {
  await writeFile(controllerChartPath, nextControllerChartYaml);
  console.log(
    `Synced ${controllerChartYamlPath} appVersion to ${controllerPackageJson.version}`,
  );
}
