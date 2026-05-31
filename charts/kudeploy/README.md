# kudeploy

Installs Kudeploy CRDs and the Kudeploy controller together.

```bash
helm dependency update charts/kudeploy-controller
helm dependency update charts/kudeploy
helm install kudeploy charts/kudeploy
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
```

The aggregate chart aliases the controller subchart as `controller`, so
controller values are set with `controller.*`.
