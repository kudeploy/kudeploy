# kudeploy

Installs Kudeploy CRDs, the Kudeploy controller, the Kudeploy server, and the
Kudeploy web client together.

```bash
helm dependency update helm-charts/kudeploy
helm install kudeploy helm-charts/kudeploy
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

PostgreSQL and Valkey are installed by default from
`oci://ghcr.io/community-helm-charts`. Disable `postgresql.enabled` or
`valkey.enabled` and configure `externalDatabase` or `externalValkey` to use
external services.

If `server.enabled=false`, also set `postgresql.enabled=false` and
`valkey.enabled=false` when the bundled data services are not needed.
