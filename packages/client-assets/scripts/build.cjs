#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
const sourceDir = path.join(workspaceRoot, "apps/client/dist/client");
const distDir = path.join(workspaceRoot, "packages/client-assets/dist");
const targetDir = path.join(distDir, "client");
const shellHtmlPath = path.join(targetDir, "_shell.html");
const indexHtmlPath = path.join(targetDir, "index.html");

if (!fs.existsSync(sourceDir)) {
  throw new Error(
    `Missing ${sourceDir}. Run client:build before packaging client assets.`,
  );
}

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

if (fs.existsSync(shellHtmlPath)) {
  fs.rmSync(indexHtmlPath, { force: true });
  fs.renameSync(shellHtmlPath, indexHtmlPath);
}

console.log(`Copied client assets to ${targetDir}`);
