# kudeploy-controller

Installs the Kudeploy controller.

Install `kudeploy-crds` first, or install the aggregate `kudeploy` chart to
install CRDs and the controller together.

```bash
helm dependency update charts/kudeploy-controller
helm install kudeploy-controller charts/kudeploy-controller
```
