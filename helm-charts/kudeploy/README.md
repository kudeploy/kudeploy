# kudeploy

Installs Kudeploy CRDs, the Kudeploy controller, the Kudeploy server, and the
Kudeploy web client together.

```bash
helm dependency update helm-charts/kudeploy-controller
helm dependency update helm-charts/kudeploy-client
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
    tag: ''

client:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/client
    tag: ''

server:
  enabled: true
  image:
    registry: ghcr.io
    repository: kudeploy/server
    tag: ''

ingress:
  enabled: false
  hosts:
    - host: ''
      paths:
        server:
          - path: /api
            pathType: Prefix
        client:
          - path: /
            pathType: Prefix
```

The aggregate chart aliases subcharts as `controller`, `client`, and `server`,
so values are set with `controller.*`, `client.*`, and `server.*`.
