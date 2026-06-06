# syntax=docker/dockerfile:1.7

FROM --platform=$BUILDPLATFORM node:24-alpine AS base
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
COPY apps/server/package.json apps/server/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm i --frozen-lockfile --store-dir=/pnpm/store
COPY apps/server apps/server
RUN pnpm --filter @kudeploy/server build

FROM node:24-alpine AS prod-deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NX_DAEMON=false
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat || \
    (sleep 5 && apk add --no-cache libc6-compat)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm i --prod --frozen-lockfile --store-dir=/pnpm/store

FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache libc6-compat || \
    (sleep 5 && apk add --no-cache libc6-compat)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
COPY --from=prod-deps --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/apps/server/package.json ./apps/server/package.json
COPY --from=prod-deps --chown=nodejs:nodejs /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/dist ./apps/server/dist
USER nodejs
WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
