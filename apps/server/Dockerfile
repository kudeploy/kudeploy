FROM node:24-alpine AS base

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @repo/client --docker --out-dir ./out/client
RUN turbo prune @repo/server --docker --out-dir ./out/server

FROM base AS client-builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=pruner /app/out/client/json/ .
RUN pnpm i --frozen-lockfile
COPY --from=pruner /app/out/client/full/ .
RUN pnpm run build

FROM base AS server-builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=pruner /app/out/server/json/ .
RUN pnpm i --frozen-lockfile
COPY --from=pruner /app/out/server/full/ .
RUN pnpm run build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
COPY --from=server-builder --chown=nodejs:nodejs /app .
COPY --from=client-builder --chown=nodejs:nodejs /app/apps/client/dist/client ./apps/server/client
RUN mv ./apps/server/client/_shell.html ./apps/server/client/index.html
WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
