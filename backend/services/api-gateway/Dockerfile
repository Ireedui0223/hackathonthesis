FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
RUN pnpm install --frozen-lockfile=false --filter @thesis/api-gateway...

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/services/api-gateway ./services/api-gateway
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
RUN pnpm --filter @thesis/shared build \
  && pnpm --filter @thesis/config build \
  && pnpm --filter @thesis/api-gateway build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeapp
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/api-gateway/node_modules ./services/api-gateway/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=deps /app/services/api-gateway/package.json ./services/api-gateway/package.json
USER nodeapp
EXPOSE 4001
CMD ["node", "services/api-gateway/dist/main.js"]
