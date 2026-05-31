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
scripts/                      Version and publish helpers
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
  --create-namespace
```

If GHCR requires authentication in your environment:

```bash
helm registry login ghcr.io
```

For local chart validation:

```bash
helm dependency update charts/kudeploy-controller
helm dependency update charts/kudeploy
helm lint charts/kudeploy-crds charts/kudeploy-controller charts/kudeploy
helm template kudeploy charts/kudeploy
```

The aggregate `kudeploy` chart depends on the CRD and controller charts from
`oci://ghcr.io/kudeploy/helm-charts`, so `helm dependency update charts/kudeploy`
requires the selected child chart versions to already exist in GHCR.

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
controller chart uses `Chart.appVersion`.

## Versioning

Changesets is used for version management only. The workspace packages are
private and are not published to npm.

Create a changeset for user-visible changes:

```bash
pnpm changeset
```

Apply pending changesets and sync chart metadata:

```bash
pnpm run version-packages
```

This runs `changeset version`, syncs chart versions with chart package versions,
syncs `charts/kudeploy-controller/Chart.yaml` `appVersion` from
`apps/controller/package.json`, and refreshes the controller chart dependency on
`common`. The aggregate chart dependencies are refreshed during publishing after
the child charts are available in GHCR.

## Release

The `Release` GitHub Actions workflow handles publishing on `main`.

When unreleased changesets exist, the workflow opens or updates a
`Version Packages` pull request. After that PR is merged, the workflow publishes:

- `ghcr.io/kudeploy/controller:<app version>`
- `ghcr.io/kudeploy/controller:latest`
- changed Helm OCI charts under `ghcr.io/kudeploy/helm-charts`

The workflow can also be run manually with `force=true` to publish the current
versions. Existing controller image tags are skipped by the workflow image
check, and existing Helm chart versions are skipped by the publish script.

## Useful Commands

```bash
pnpm install --frozen-lockfile
pnpm run version-packages
helm lint charts/kudeploy-crds charts/kudeploy-controller charts/kudeploy
```
