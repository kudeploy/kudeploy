# kudeploy

Installs Kudeploy CRDs, the Kudeploy controller, the Kudeploy server, and the
Kudeploy web client together.

```bash
helm dependency update helm-charts/kudeploy
helm install kudeploy helm-charts/kudeploy
```

CRD templates are generated from the controller API types:

```bash
pnpm nx run crds-helm-chart:generate
```

## Values

```yaml
crds:
  enabled: true

controller:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/controller
    tag: '0.2.1'

client:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/client
    tag: '0.2.2'

server:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/server
    tag: '1.3.2'

ingress:
  enabled: false
  hostname: ''
  tls: false
  server:
    paths:
      - path: /api
        pathType: Prefix
  client:
    paths:
      - path: /
        pathType: Prefix
  extraHosts: []
```

The chart renders `controller`, `client`, and `server` directly, while keeping
the CRDs chart as a dependency. Each component has its own ServiceAccount.

When `ingress.enabled=true`, the chart routes `/api` to the server service and
`/` to the client service. `server` receives `APP_URL` from the main
`ingress.hostname`; additional host rules can be added with `ingress.extraHosts`.
Ingress is disabled by default and should be enabled through release values for
the target environment.

PostgreSQL and Valkey are installed by default from
`oci://ghcr.io/community-helm-charts`. Disable `postgresql.enabled` or
`valkey.enabled` and configure `externalDatabase` or `externalValkey` to use
external services.

## Database Migrations

When `server.migration.enabled=true`, the chart creates a database migration
Job that uses the server image and runs `npm run migration:up`. By default the
Job is installed as a `post-install,post-upgrade` Helm hook, with
`before-hook-creation,hook-succeeded` cleanup.

The migration Job exposes operational limits:

```yaml
server:
  migration:
    backoffLimit: 6
    activeDeadlineSeconds: 600
    ttlSecondsAfterFinished: 300
```

Set `server.migration.activeDeadlineSeconds` to `null` when long-running
migrations should not have a Kubernetes Job deadline. Tune
`server.migration.backoffLimit` for environments where database startup or
network readiness can take longer than usual.

Server Pods include a `wait-for-migrations` init container when
`server.migration.waitForMigrations.enabled=true`. It checks MikroORM pending
migrations and blocks the server container until the database is up to date.
Adjust `server.migration.waitForMigrations.timeoutSeconds` if migration Jobs
regularly take longer than the default wait window.

The bundled PostgreSQL chart initializes the `anonymous` and `authenticated`
roles through `postgresql.initdb.scripts["00-init-database.sql"]` and grants
them to the configured PostgreSQL application user. PostgreSQL `initdb` scripts
run only when the bundled PostgreSQL data directory is first initialized. When
using `externalDatabase`, or when upgrading an existing database that was
created before these roles existed, create those roles and grants before
running server migrations.

If `server.enabled=false`, also set `postgresql.enabled=false` and
`valkey.enabled=false` when the bundled data services are not needed.
