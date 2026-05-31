import { execFileSync } from "node:child_process";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const artifacts = [
  {
    key: "controller",
    packagePath: "apps/controller/package.json",
    markerPaths: ["apps/controller/package.json"],
  },
  {
    key: "kudeploy",
    packagePath: "charts/kudeploy/package.json",
    markerPaths: ["charts/kudeploy/package.json", "charts/kudeploy/Chart.yaml"],
  },
  {
    key: "kudeploy_controller",
    packagePath: "charts/kudeploy-controller/package.json",
    markerPaths: [
      "charts/kudeploy-controller/package.json",
      "charts/kudeploy-controller/Chart.yaml",
    ],
  },
  {
    key: "kudeploy_crds",
    packagePath: "charts/kudeploy-crds/package.json",
    markerPaths: ["charts/kudeploy-crds/package.json", "charts/kudeploy-crds/Chart.yaml"],
  },
];

function git(args) {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function commitExists(sha) {
  if (!sha || /^0+$/.test(sha)) {
    return false;
  }

  try {
    git(["cat-file", "-e", `${sha}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function getChangedFiles() {
  const baseSha = process.env.BASE_SHA;

  if (commitExists(baseSha)) {
    return git(["diff", "--name-only", baseSha, "HEAD"])
      .split(/\r?\n/)
      .filter(Boolean);
  }

  if (commitExists("HEAD^")) {
    return git(["diff", "--name-only", "HEAD^", "HEAD"])
      .split(/\r?\n/)
      .filter(Boolean);
  }

  return git(["show", "--name-only", "--pretty=format:", "HEAD"])
    .split(/\r?\n/)
    .filter(Boolean);
}

async function readVersion(packagePath) {
  const packageJson = JSON.parse(await readFile(path.join(rootDir, packagePath), "utf8"));
  return packageJson.version;
}

async function writeOutputs(outputs) {
  const lines = Object.entries(outputs).map(([name, value]) => `${name}=${value}`);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
  }

  for (const line of lines) {
    console.log(line);
  }
}

const forcePublish = process.env.FORCE_PUBLISH === "true";
const changedFiles = new Set(forcePublish ? [] : getChangedFiles());
const outputs = {};
let anyChanged = false;

for (const artifact of artifacts) {
  const changed =
    forcePublish || artifact.markerPaths.some((markerPath) => changedFiles.has(markerPath));
  const version = await readVersion(artifact.packagePath);

  outputs[`${artifact.key}_changed`] = String(changed);
  outputs[`${artifact.key}_version`] = version;
  anyChanged ||= changed;
}

outputs.any_changed = String(anyChanged);

await writeOutputs(outputs);
