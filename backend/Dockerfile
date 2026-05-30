FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl \
  && corepack enable
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile=false

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl \
  && corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl \
  && corepack enable \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeapp
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
RUN mkdir -p uploads && chown -R nodeapp:nodejs uploads
USER nodeapp
EXPOSE 4001
CMD ["node", "dist/main.js"]
