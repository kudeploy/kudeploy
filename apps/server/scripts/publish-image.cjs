#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { parse } = require('yaml');

const chartPath = 'helm-charts/kudeploy-server/Chart.yaml';
const chart = parse(fs.readFileSync(chartPath, 'utf8'));

if (!chart.appVersion) {
  throw new Error(`Missing ${chartPath} appVersion`);
}

const version = String(chart.appVersion);
const dryRun =
  process.argv[2] === 'true' ||
  process.env.NX_DRY_RUN === 'true' ||
  process.env.DRY_RUN === 'true';

const args = [
  'buildx',
  'build',
  '--progress',
  'plain',
  '--platform',
  'linux/amd64,linux/arm64',
  '--push',
  '--tag',
  `ghcr.io/kudeploy/server:${version}`,
  '--tag',
  'ghcr.io/kudeploy/server:latest',
];

if (process.env.GITHUB_ACTIONS === 'true') {
  args.push(
    '--cache-from',
    'type=gha,scope=kudeploy-server',
    '--cache-to',
    'type=gha,mode=max,scope=kudeploy-server,ignore-error=true',
  );
}

args.push('--file', 'apps/server/Dockerfile', '.');

if (dryRun) {
  console.log(`[dry-run] docker ${args.join(' ')}`);
} else {
  const result = spawnSync('docker', args, { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
