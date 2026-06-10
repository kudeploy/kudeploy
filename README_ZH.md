# Kudeploy

Kudeploy 是一个 Kubernetes 原生部署平台。这个仓库是一个 pnpm 和 Nx
workspace，包含 Web 客户端、API server、Kubernetes controller、CRD、Helm
charts 和发布工具。

Kudeploy 当前定义了 `kudeploy.com/v1alpha1` API：`Project`、`Service`、
`Deployment` 和 `BuildRun`。

## 安装

### 前置要求

- Kubernetes 集群
- `kubectl`
- Helm 3

如果需要从源码构建镜像或本地开发，还需要 Node.js 24、pnpm 11.5.0、Go
1.25.7 或更新版本，以及 Docker buildx。

### 使用 Helm 安装

推荐安装聚合 chart，它会一起安装 CRD、controller 和 server：

```bash
helm upgrade --install kudeploy oci://ghcr.io/kudeploy/helm-charts/kudeploy \
  --namespace kudeploy-system \
  --create-namespace
```

检查组件是否启动：

```bash
kubectl get pods -n kudeploy-system
```

如果需要指定镜像版本：

```bash
helm upgrade --install kudeploy oci://ghcr.io/kudeploy/helm-charts/kudeploy \
  --namespace kudeploy-system \
  --create-namespace \
  --set controller.image.tag=0.1.0 \
  --set server.image.tag=1.0.14
```

如果当前环境需要登录 GHCR：

```bash
helm registry login ghcr.io
```

### 可用 Helm Charts

- `ghcr.io/kudeploy/helm-charts/kudeploy`
- `ghcr.io/kudeploy/helm-charts/kudeploy-controller`
- `ghcr.io/kudeploy/helm-charts/kudeploy-crds`
- `ghcr.io/kudeploy/helm-charts/kudeploy-server`

聚合 chart 默认 values：

```yaml
crds:
  enabled: true

controller:
  enabled: true

server:
  enabled: true
```

`kudeploy` chart 会把 `kudeploy-controller` alias 为 `controller`，把
`kudeploy-server` alias 为 `server`，所以子 chart 参数通过
`controller.*` 和 `server.*` 传入。

## 开发

### 仓库结构

```text
apps/client/                  React + TanStack Start client
apps/server/                  NestJS GraphQL API server
apps/controller/              Kubebuilder controller
helm-charts/kudeploy-crds/    CRD-only Helm chart
helm-charts/kudeploy/         Aggregate Helm chart
```

### 安装依赖

```bash
nvm use
corepack enable
pnpm install
```

### 环境变量

服务端环境变量示例在 `apps/server/.env.example`：

```bash
cp apps/server/.env.example apps/server/.env
```

本地开发时常用配置：

```text
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:secret@localhost:5432/kudeploy
PROMETHEUS_URL=http://vmsingle-vmks-victoria-metrics-k8s-stack.monitoring.svc.cluster.local:8428
VICTORIA_LOGS_URL=http://vlsingle-victoria-logs-single.logging.svc.cluster.local:9428
```

客户端开发环境默认读取 `apps/client/.env.development`，其中 `API_URL`
指向本地 API server。

### 启动开发服务

从仓库根目录启动所有支持 `dev` target 的应用：

```bash
pnpm run dev
```

也可以分别启动客户端和服务端：

```bash
pnpm --filter @kudeploy/client dev
pnpm --filter @kudeploy/server dev
```

客户端默认运行在 `http://localhost:3000`，服务端默认运行在
`http://localhost:4000`。

### Controller 开发

Controller 代码在 `apps/controller`。

运行测试：

```bash
cd apps/controller
GOTOOLCHAIN=auto make test
```

修改 API 类型后重新生成 CRD：

```bash
cd apps/controller
GOTOOLCHAIN=auto make manifests
```

`make manifests` 会更新 `apps/controller/config/crd/bases`，并同步复制到
`helm-charts/kudeploy-crds/templates`。

构建本地 controller 镜像：

```bash
cd apps/controller
make docker-build IMG=ghcr.io/kudeploy/controller:dev
```

### 常用命令

```bash
pnpm nx show projects
pnpm run build
pnpm run lint
pnpm run check-types
pnpm run commitlint
pnpm --filter @kudeploy/server test
pnpm --filter @kudeploy/client test
pnpm --filter @kudeploy/client test:e2e
```

### Helm Chart 校验

```bash
pnpm nx run-many -t lint --projects=helm-chart,controller-helm-chart,crds-helm-chart,server-helm-chart
helm template kudeploy helm-charts/kudeploy
pnpm nx run helm-chart:package
```

开发时聚合 chart 使用本地 `file://` 依赖。发布打包时，`nx-helm` 会把内部
chart 依赖改写到 `oci://ghcr.io/kudeploy/helm-charts`。

### 发布

版本发布由 Nx Release 和 `nx-helm` 管理。提交信息需要符合 conventional
commits，例如：

```text
feat(controller): add queued rollout reconciliation
feat(server): add workspace usage endpoint
fix(crds-helm-chart): correct buildrun schema validation
```

本地生成 release commit 和 tag：

```bash
pnpm run release
```

发布已有版本：

```bash
pnpm run release:publish
```

GitHub Actions 的 `Release` workflow 会在 `main` 上发布 controller/server
镜像和 Helm OCI charts。
