const { updateJson } = require('@nx/devkit');
const {
  VersionActions,
} = require('nx/src/command-line/release/version/version-actions');
const { parseDocument } = require('yaml');

const SERVER_PACKAGE = 'apps/server/package.json';
const SERVER_CHART = 'helm-charts/kudeploy-server/Chart.yaml';

function readText(tree, filePath) {
  const content = tree.read(filePath, 'utf-8');
  if (content === null) {
    throw new Error(`Could not read ${filePath}`);
  }
  return content;
}

function scalarValueRange(node, source, description) {
  const range = node?.range;
  if (!range) {
    throw new Error(`Could not locate ${description} in ${SERVER_CHART}`);
  }

  const [start, end] = range;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > source.length
  ) {
    throw new Error(
      `Invalid source range for ${description} in ${SERVER_CHART}`,
    );
  }

  return [start, end];
}

function replaceRange(source, start, end, value) {
  return `${source.slice(0, start)}${value}${source.slice(end)}`;
}

function readPackageVersion(tree) {
  const packageJson = JSON.parse(readText(tree, SERVER_PACKAGE));
  const version = String(packageJson.version ?? '').trim();
  if (!version) {
    throw new Error(`Missing version in ${SERVER_PACKAGE}`);
  }
  return version;
}

function readChart(tree) {
  const chartSource = readText(tree, SERVER_CHART);
  return {
    chartSource,
    chart: parseDocument(chartSource),
  };
}

function readChartAppVersion(tree) {
  const { chartSource, chart } = readChart(tree);
  const appVersionNode = chart.get('appVersion', true);
  scalarValueRange(appVersionNode, chartSource, 'server chart appVersion');

  const appVersion = String(appVersionNode.value ?? '').trim();
  if (!appVersion) {
    throw new Error(`Missing appVersion in ${SERVER_CHART}`);
  }

  return appVersion;
}

class VersionFileActions extends VersionActions {
  validManifestFilenames = ['package.json', 'Chart.yaml'];

  async readCurrentVersionFromSourceManifest(tree) {
    const currentVersion = readPackageVersion(tree);
    const chartAppVersion = readChartAppVersion(tree);

    if (chartAppVersion !== currentVersion) {
      throw new Error(
        `${SERVER_CHART} appVersion (${chartAppVersion}) must match ${SERVER_PACKAGE} version (${currentVersion})`,
      );
    }

    return {
      currentVersion,
      manifestPath: SERVER_PACKAGE,
    };
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
    updateJson(tree, SERVER_PACKAGE, (json) => {
      json.version = newVersion;
      return json;
    });

    const { chartSource, chart } = readChart(tree);
    const appVersionNode = chart.get('appVersion', true);
    const [start, end] = scalarValueRange(
      appVersionNode,
      chartSource,
      'server chart appVersion',
    );
    tree.write(SERVER_CHART, replaceRange(chartSource, start, end, newVersion));

    return [
      `Updated ${SERVER_PACKAGE} version to ${newVersion}`,
      `Updated ${SERVER_CHART} appVersion to ${newVersion}`,
    ];
  }

  async updateProjectDependencies() {
    return [];
  }
}

module.exports = VersionFileActions;
