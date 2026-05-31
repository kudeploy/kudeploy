# kudeploy

Installs the Kudeploy controller. The chart depends on the local `kudeploy-crds`
chart, so dependency builds include the CRDs chart automatically.

```bash
helm dependency update charts/kudeploy
helm install kudeploy charts/kudeploy
```
