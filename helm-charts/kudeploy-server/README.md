# kudeploy-server

Installs the Kudeploy API server and bundled web application.

```bash
helm dependency update helm-charts/kudeploy-server
helm install kudeploy-server helm-charts/kudeploy-server
```

Configure required runtime settings with `extraEnv` or `envFrom`.
