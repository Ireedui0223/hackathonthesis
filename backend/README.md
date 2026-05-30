# Backend

Fastify + Prisma API for thesis defense management.

## Commands

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
pnpm typecheck
pnpm build
pnpm start
```

## Main Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/theses`
- `POST /api/theses`
- `POST /api/theses/:id/files`
- `GET /api/critique-groups`
- `POST /api/admin/critique-groups`
- `GET /api/schedules`
- `POST /api/admin/schedules`
- `GET /api/defense-stages`
- `POST /api/theses/:id/defense-scores`
- `GET /api/critiques`
- `PATCH /api/critiques/:id/feedback`
- `POST /api/critiques/:id/submit-revision`
- `GET /api/statistics/overview`

Swagger is available at `/docs`.
