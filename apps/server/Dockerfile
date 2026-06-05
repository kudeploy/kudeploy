# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NX_DAEMON=false
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate

FROM base AS build-base
RUN apk add --no-cache libc6-compat python3 make g++ || \
    (sleep 5 && apk add --no-cache libc6-compat python3 make g++)

FROM build-base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm i --frozen-lockfile --store-dir=/pnpm/store
COPY . .
RUN pnpm nx run @repo/client:build
RUN pnpm nx run server:build
RUN CI=true pnpm prune --prod

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat || \
    (sleep 5 && apk add --no-cache libc6-compat)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/client/dist/client ./apps/server/client
RUN mv ./apps/server/client/_shell.html ./apps/server/client/index.html
WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
