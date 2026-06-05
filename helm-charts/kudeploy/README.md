# kudeploy

Installs Kudeploy CRDs, the Kudeploy controller, and the Kudeploy server
together.

```bash
helm dependency update helm-charts/kudeploy-controller
helm dependency update helm-charts/kudeploy-server
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
    tag: ""

server:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/server
    tag: ""
```

The aggregate chart aliases subcharts as `controller` and `server`, so values
are set with `controller.*` and `server.*`.
