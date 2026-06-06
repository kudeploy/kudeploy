# kudeploy-server

Installs the Kudeploy API server.

```bash
helm dependency update helm-charts/kudeploy-server
helm install kudeploy-server helm-charts/kudeploy-server
```

Configure required runtime settings with `extraEnv` or `envFrom`.
