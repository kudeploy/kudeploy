const { updateJson } = require('@nx/devkit');
const {
  VersionActions,
} = require('nx/src/command-line/release/version/version-actions');
const { parseDocument } = require('yaml');

const SERVER_PACKAGE = 'apps/server/package.json';
const CHART_VALUES = 'helm-charts/kudeploy/values.yaml';
const IMAGE_TAG_PATH = ['server', 'image', 'tag'];

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
    throw new Error(`Could not locate ${description} in ${CHART_VALUES}`);
  }

  const [start, end] = range;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > source.length
  ) {
    throw new Error(`Invalid source range for ${description} in ${CHART_VALUES}`);
  }

  return [start, end];
}

function replaceRange(source, start, end, value) {
  return `${source.slice(0, start)}${value}${source.slice(end)}`;
}

function quotedVersion(version) {
  return `'${version}'`;
}

function readPackageVersion(tree) {
  const packageJson = JSON.parse(readText(tree, SERVER_PACKAGE));
  const version = String(packageJson.version ?? '').trim();
  if (!version) {
    throw new Error(`Missing version in ${SERVER_PACKAGE}`);
  }
  return version;
}

function readValues(tree) {
  const valuesSource = readText(tree, CHART_VALUES);
  return {
    valuesSource,
    values: parseDocument(valuesSource),
  };
}

function readServerImageTag(tree) {
  const { valuesSource, values } = readValues(tree);
  const tagNode = values.getIn(IMAGE_TAG_PATH, true);
  scalarValueRange(tagNode, valuesSource, 'server image tag');

  const imageTag = String(tagNode.value ?? '').trim();
  if (!imageTag) {
    throw new Error(`Missing server.image.tag in ${CHART_VALUES}`);
  }

  return imageTag;
}

class VersionFileActions extends VersionActions {
  validManifestFilenames = ['package.json', 'values.yaml'];

  async readCurrentVersionFromSourceManifest(tree) {
    const currentVersion = readPackageVersion(tree);
    const imageTag = readServerImageTag(tree);

    if (imageTag !== currentVersion) {
      throw new Error(
        `${CHART_VALUES} server.image.tag (${imageTag}) must match ${SERVER_PACKAGE} version (${currentVersion})`,
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

    const { valuesSource, values } = readValues(tree);
    const tagNode = values.getIn(IMAGE_TAG_PATH, true);
    const [start, end] = scalarValueRange(tagNode, valuesSource, 'server image tag');
    tree.write(CHART_VALUES, replaceRange(valuesSource, start, end, quotedVersion(newVersion)));

    return [
      `Updated ${SERVER_PACKAGE} version to ${newVersion}`,
      `Updated ${CHART_VALUES} server.image.tag to ${newVersion}`,
    ];
  }

  async updateProjectDependencies() {
    return [];
  }
}

module.exports = VersionFileActions;
