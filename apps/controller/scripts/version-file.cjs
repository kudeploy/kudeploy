const { VersionActions } = require("nx/src/command-line/release/version/version-actions");
const { parseDocument } = require("yaml");

const CONTROLLER_CHART = "helm-charts/kudeploy-controller/Chart.yaml";

function readText(tree, filePath) {
  const content = tree.read(filePath, "utf-8");
  if (content === null) {
    throw new Error(`Could not read ${filePath}`);
  }
  return content;
}

function scalarValueRange(node, source, description) {
  const range = node?.range;
  if (!range) {
    throw new Error(`Could not locate ${description} in ${CONTROLLER_CHART}`);
  }

  const [start, end] = range;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > source.length
  ) {
    throw new Error(`Invalid source range for ${description} in ${CONTROLLER_CHART}`);
  }

  return [start, end];
}

function replaceRange(source, start, end, value) {
  return `${source.slice(0, start)}${value}${source.slice(end)}`;
}

function readChart(tree) {
  const chartSource = readText(tree, CONTROLLER_CHART);
  return {
    chartSource,
    chart: parseDocument(chartSource),
  };
}

function readChartAppVersion(tree) {
  const { chartSource, chart } = readChart(tree);
  const appVersionNode = chart.get("appVersion", true);
  scalarValueRange(appVersionNode, chartSource, "controller chart appVersion");

  const currentVersion = String(appVersionNode.value ?? "").trim();
  if (!currentVersion) {
    throw new Error(`Missing appVersion in ${CONTROLLER_CHART}`);
  }

  return {
    currentVersion,
    manifestPath: CONTROLLER_CHART,
  };
}

class VersionFileActions extends VersionActions {
  validManifestFilenames = ["Chart.yaml"];

  async readCurrentVersionFromSourceManifest(tree) {
    return readChartAppVersion(tree);
  }

  async readCurrentVersionFromRegistry() {
    return null;
  }

  async readCurrentVersionOfDependency() {
    return {
      currentVersion: null,
      dependencyCollection: null,
    };
  }

  async updateProjectVersion(tree, newVersion) {
    const { chartSource, chart } = readChart(tree);
    const appVersionNode = chart.get("appVersion", true);
    const [start, end] = scalarValueRange(appVersionNode, chartSource, "controller chart appVersion");
    tree.write(CONTROLLER_CHART, replaceRange(chartSource, start, end, newVersion));

    return [`Updated ${CONTROLLER_CHART} appVersion to ${newVersion}`];
  }

  async updateProjectDependencies() {
    return [];
  }
}

module.exports = VersionFileActions;
