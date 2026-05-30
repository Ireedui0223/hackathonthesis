FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY services/model-orchestrator ./services/model-orchestrator
RUN pnpm install --frozen-lockfile=false --filter @thesis/model-orchestrator...

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/services/model-orchestrator ./services/model-orchestrator
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
RUN pnpm --filter @thesis/shared build \
  && pnpm --filter @thesis/config build \
  && pnpm --filter @thesis/model-orchestrator build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeapp
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/model-orchestrator/node_modules ./services/model-orchestrator/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/model-orchestrator/dist ./services/model-orchestrator/dist
COPY --from=deps /app/services/model-orchestrator/package.json ./services/model-orchestrator/package.json
USER nodeapp
EXPOSE 4002
CMD ["node", "services/model-orchestrator/dist/main.js"]
