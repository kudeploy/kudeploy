# Kudeploy

Kudeploy is a Kubernetes controller project distributed as container images and
Helm OCI charts. This repository is a pnpm workspace that keeps the controller,
CRDs, Helm charts, and release tooling together.

## Repository Layout

```text
apps/controller/              Kubebuilder controller
charts/kudeploy-crds/         CRD-only Helm chart
charts/kudeploy-controller/   Controller Helm chart
charts/kudeploy/              Aggregate chart for CRDs + controller
```

The controller currently defines the `kudeploy.com/v1alpha1` APIs for
`Project`, `Service`, `Deployment`, and `BuildRun`.

## Prerequisites

- Node.js 24
- pnpm 11.5.0
- Go 1.25.7 or newer for controller development
- Helm 3
- Docker with buildx for image builds
- kubectl and a Kubernetes cluster for deployment testing

Install workspace dependencies from the repository root:

```bash
nvm use
corepack enable
pnpm install
```

## Controller Development

Controller code lives in `apps/controller`.

```bash
cd apps/controller
GOTOOLCHAIN=auto make test
```

Regenerate CRDs after changing API types:

```bash
cd apps/controller
GOTOOLCHAIN=auto make manifests
```

`make manifests` writes controller-gen output to
`apps/controller/config/crd/bases` and copies those files into
`charts/kudeploy-crds/templates`.

Build a local controller image:

```bash
cd apps/controller
make docker-build IMG=ghcr.io/kudeploy/controller:dev
```

## Helm Charts

Kudeploy publishes three Helm OCI charts:

- `ghcr.io/kudeploy/helm-charts/kudeploy`
- `ghcr.io/kudeploy/helm-charts/kudeploy-controller`
- `ghcr.io/kudeploy/helm-charts/kudeploy-crds`

Install or upgrade the aggregate chart from GHCR:

```bash
helm upgrade --install kudeploy oci://ghcr.io/kudeploy/helm-charts/kudeploy \
  --namespace kudeploy-system \
  --create-namespace
```

Verify the controller is running:

```bash
kubectl get pods -n kudeploy-system
```

Use a specific controller image tag when needed:

```bash
helm upgrade --install kudeploy oci://ghcr.io/kudeploy/helm-charts/kudeploy \
  --namespace kudeploy-system \
  --create-namespace \
  --set controller.image.tag=0.1.0
```

If GHCR requires authentication in your environment:

```bash
helm registry login ghcr.io
```

For local chart validation:

```bash
pnpm nx run-many -t lint --projects=kudeploy,kudeploy-controller,kudeploy-crds
helm template kudeploy charts/kudeploy
```

The aggregate `kudeploy` chart uses local `file://` dependencies during
development. The `nx-helm` package rewrites those internal dependency
repositories to `oci://ghcr.io/kudeploy/helm-charts` when packaging charts for
publication.

### Aggregate Chart Values

```yaml
crds:
  enabled: true

controller:
  enabled: true
```

Controller chart values are passed through the subchart name:

```yaml
controller:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/controller
    tag: ""
```

The aggregate chart aliases `kudeploy-controller` as `controller`, so
controller values are set with `controller.*`. When `image.tag` is empty, the
controller chart uses the `kudeploy-controller` chart `appVersion`.

## Versioning

Nx Release and `nx-helm` manage Helm chart versions and local chart dependency
versions. The controller is a Go/Kubebuilder Nx project, not a Node package;
its release version comes from `charts/kudeploy-controller/Chart.yaml`
`appVersion`.

Version bumps are derived from conventional commit messages. Use commit scopes
that map to the affected chart or project, for example:

```text
feat(controller): add queued rollout reconciliation
feat(kudeploy-controller): add service rollout status
fix(kudeploy-crds): correct buildrun schema validation
```

Run `pnpm run release` to generate release commits and tags locally without
publishing. This uses the external `nx-helm` package to update Helm chart
versions and local chart dependency versions, and updates the
`kudeploy-controller` chart `appVersion` for controller image releases.

## Release

The `Release` GitHub Actions workflow handles publishing on `main`.

The workflow validates conventional commit messages, runs `nx release
--skip-publish` to create release commits and tags, then publishes:

- `ghcr.io/kudeploy/controller:<controller version>`
- `ghcr.io/kudeploy/controller:latest`
- Helm OCI charts under `ghcr.io/kudeploy/helm-charts`

The workflow can also be run manually with `publish_existing=true` to publish
the current controller image and chart versions even when no release commit is
generated.

## Useful Commands

```bash
pnpm install --frozen-lockfile
pnpm nx show projects
pnpm run commitlint
pnpm run release
pnpm run release:publish
pnpm nx run controller:docker:build
pnpm nx release publish --projects=controller --dry-run --yes
pnpm nx run-many -t lint --projects=kudeploy,kudeploy-controller,kudeploy-crds
pnpm nx run kudeploy:package
```
