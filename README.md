# Kudeploy

Kudeploy is a Kubernetes-native deployment platform. This repository is a pnpm
and Nx workspace that contains the web client, API server, Kubernetes
controller, CRDs, Helm charts, and release tooling.

Kudeploy currently defines the `kudeploy.com/v1alpha1` APIs for `Project`,
`Service`, `Deployment`, and `BuildRun`.

## Installation

### Prerequisites

- Kubernetes cluster
- `kubectl`
- Helm 3

If you need to build images from source or work on local development, you also
need Node.js 24, pnpm 11.5.0, Go 1.25.7 or newer, and Docker buildx.

### Install With Helm

The recommended installation path is the aggregate chart, which installs CRDs,
the controller, and the server together:

```bash
helm upgrade --install kudeploy oci://ghcr.io/kudeploy/helm-charts/kudeploy \
  --namespace kudeploy-system \
  --create-namespace
```

Verify that the components are running:

```bash
kubectl get pods -n kudeploy-system
```

Set image versions explicitly when needed:

```bash
helm upgrade --install kudeploy oci://ghcr.io/kudeploy/helm-charts/kudeploy \
  --namespace kudeploy-system \
  --create-namespace \
  --set controller.image.tag=0.1.0 \
  --set server.image.tag=1.0.14
```

If GHCR authentication is required in your environment:

```bash
helm registry login ghcr.io
```

### Available Helm Charts

- `ghcr.io/kudeploy/helm-charts/kudeploy`
- `ghcr.io/kudeploy/helm-charts/kudeploy-controller`
- `ghcr.io/kudeploy/helm-charts/kudeploy-crds`
- `ghcr.io/kudeploy/helm-charts/kudeploy-server`

Default values for the aggregate chart:

```yaml
crds:
  enabled: true

controller:
  enabled: true

server:
  enabled: true
```

The `kudeploy` chart aliases `kudeploy-controller` as `controller` and
`kudeploy-server` as `server`, so subchart values are passed with
`controller.*` and `server.*`.

## Development

### Repository Layout

```text
apps/client/                  React + TanStack Start client
apps/server/                  NestJS GraphQL API server
apps/controller/              Kubebuilder controller
helm-charts/kudeploy-crds/    CRD-only Helm chart
helm-charts/kudeploy/         Aggregate Helm chart
```

### Install Dependencies

```bash
nvm use
corepack enable
pnpm install
```

### Environment Variables

The server environment example is in `apps/server/.env.example`:

```bash
cp apps/server/.env.example apps/server/.env
```

Common local development values:

```text
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:secret@localhost:5432/kudeploy
PROMETHEUS_URL=http://vmsingle-vmks-victoria-metrics-k8s-stack.monitoring.svc.cluster.local:8428
VICTORIA_LOGS_URL=http://vlsingle-victoria-logs-single.logging.svc.cluster.local:9428
```

The client reads `apps/client/.env.development` by default. Its `API_URL`
points to the local API server.

### Start Development Services

Start all apps that provide a `dev` target from the repository root:

```bash
pnpm run dev
```

You can also start the client and server separately:

```bash
pnpm --filter @kudeploy/client dev
pnpm --filter @kudeploy/server dev
```

The client runs on `http://localhost:3000` by default, and the server runs on
`http://localhost:4000` by default.

### Controller Development

Controller code lives in `apps/controller`.

Run tests:

```bash
cd apps/controller
GOTOOLCHAIN=auto make test
```

Regenerate CRDs after changing API types:

```bash
cd apps/controller
GOTOOLCHAIN=auto make manifests
```

`make manifests` updates `apps/controller/config/crd/bases` and copies the
generated CRDs into `helm-charts/kudeploy-crds/templates`.

Build a local controller image:

```bash
cd apps/controller
make docker-build IMG=ghcr.io/kudeploy/controller:dev
```

### Useful Commands

```bash
pnpm nx show projects
pnpm run build
pnpm run lint
pnpm run check-types
pnpm run commitlint
pnpm --filter @kudeploy/server test
pnpm --filter @kudeploy/client test
pnpm --filter @kudeploy/client test:e2e
```

### Helm Chart Validation

```bash
pnpm nx run-many -t lint --projects=helm-chart,controller-helm-chart,crds-helm-chart,server-helm-chart
helm template kudeploy helm-charts/kudeploy
pnpm nx run helm-chart:package
```

During development, the aggregate chart uses local `file://` dependencies. When
packaging for release, `nx-helm` rewrites internal chart dependencies to
`oci://ghcr.io/kudeploy/helm-charts`.

### Release

Releases are managed by Nx Release and `nx-helm`. Commit messages must follow
conventional commits, for example:

```text
feat(controller): add queued rollout reconciliation
feat(server): add workspace usage endpoint
fix(crds-helm-chart): correct buildrun schema validation
```

Generate release commits and tags locally:

```bash
pnpm run release
```

Publish existing versions:

```bash
pnpm run release:publish
```

The GitHub Actions `Release` workflow publishes controller/server images and
Helm OCI charts from `main`.
