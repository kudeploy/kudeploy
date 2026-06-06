# syntax=docker/dockerfile:1.7

FROM --platform=$BUILDPLATFORM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NX_DAEMON=false
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps/client/package.json apps/client/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm i --frozen-lockfile --store-dir=/pnpm/store
COPY apps/client apps/client
RUN pnpm --filter @kudeploy/client build && \
    if [ -f apps/client/dist/client/_shell.html ]; then \
    mv apps/client/dist/client/_shell.html apps/client/dist/client/index.html; \
    fi

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runner
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/client/dist/client /usr/share/nginx/html
