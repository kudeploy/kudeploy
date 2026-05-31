# kudeploy

Installs Kudeploy CRDs and the Kudeploy controller together.

```bash
helm dependency update charts/kudeploy-controller
helm dependency update charts/kudeploy
helm install kudeploy charts/kudeploy
```
