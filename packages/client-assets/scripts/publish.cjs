#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const dryRun =
  process.argv[2] === "true" ||
  process.env.NX_DRY_RUN === "true" ||
  process.env.DRY_RUN === "true";

const buildResult = spawnSync("pnpm", ["nx", "run", "client-assets:build"], {
  stdio: "inherit",
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const args = [
  "publish",
  "./packages/client-assets",
  "--registry",
  "https://npm.pkg.github.com",
  "--access",
  "public",
];

if (dryRun) {
  args.push("--dry-run");
}

const result = spawnSync("npm", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
