#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const { parse } = require("yaml");

const valuesPath = "helm-charts/kudeploy/values.yaml";
const values = parse(fs.readFileSync(valuesPath, "utf8"));

if (!values?.controller?.image?.tag) {
  throw new Error(`Missing controller.image.tag in ${valuesPath}`);
}

const version = String(values.controller.image.tag);
const dryRun =
  process.argv[2] === "true" ||
  process.env.NX_DRY_RUN === "true" ||
  process.env.DRY_RUN === "true";

const args = [
  "buildx",
  "build",
  "--platform",
  "linux/amd64,linux/arm64",
  "--push",
  "--tag",
  `ghcr.io/kudeploy/controller:${version}`,
  "--tag",
  "ghcr.io/kudeploy/controller:latest",
];

if (process.env.GITHUB_ACTIONS === "true") {
  args.push(
    "--cache-from",
    "type=gha,scope=kudeploy-controller",
    "--cache-to",
    "type=gha,mode=max,scope=kudeploy-controller,ignore-error=true",
  );
}

args.push("apps/controller");

if (dryRun) {
  console.log(`[dry-run] docker ${args.join(" ")}`);
} else {
  const result = spawnSync("docker", args, { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
