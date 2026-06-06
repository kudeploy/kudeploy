const {
  VersionActions,
} = require('nx/src/command-line/release/version/version-actions');
const { parseDocument } = require('yaml');

const CHART_VALUES = 'helm-charts/kudeploy/values.yaml';
const IMAGE_TAG_PATH = ['controller', 'image', 'tag'];

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

function readValues(tree) {
  const valuesSource = readText(tree, CHART_VALUES);
  return {
    valuesSource,
    values: parseDocument(valuesSource),
  };
}

function readControllerImageTag(tree) {
  const { valuesSource, values } = readValues(tree);
  const tagNode = values.getIn(IMAGE_TAG_PATH, true);
  scalarValueRange(tagNode, valuesSource, 'controller image tag');

  const currentVersion = String(tagNode.value ?? '').trim();
  if (!currentVersion) {
    throw new Error(`Missing controller.image.tag in ${CHART_VALUES}`);
  }

  return {
    currentVersion,
    manifestPath: CHART_VALUES,
  };
}

class VersionFileActions extends VersionActions {
  validManifestFilenames = ['values.yaml'];

  async readCurrentVersionFromSourceManifest(tree) {
    return readControllerImageTag(tree);
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
    const { valuesSource, values } = readValues(tree);
    const tagNode = values.getIn(IMAGE_TAG_PATH, true);
    const [start, end] = scalarValueRange(tagNode, valuesSource, 'controller image tag');
    tree.write(CHART_VALUES, replaceRange(valuesSource, start, end, quotedVersion(newVersion)));

    return [`Updated ${CHART_VALUES} controller.image.tag to ${newVersion}`];
  }

  async updateProjectDependencies() {
    return [];
  }
}

module.exports = VersionFileActions;
