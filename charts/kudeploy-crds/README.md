# kudeploy-crds

Installs the Kudeploy CustomResourceDefinitions.

CRDs live in the chart `templates/` directory so Helm renders them as regular
manifest resources.

Regenerate these files from the controller API types with:

```bash
cd apps/controller
make manifests
```
