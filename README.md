# Thesis Orchestral Defense

One-day hackathon full-stack website for university thesis defense management.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, ReactBits-inspired animated components.
- Backend: Fastify, TypeScript, tsx dev runtime.
- Database: PostgreSQL with Prisma.
- Auth: email/password, bcrypt, JWT.
- Uploads: local disk through Docker named volume, ready for future S3/R2 abstraction.
- Hosting: Hetzner VPS with Docker Compose, Nginx, and Certbot.

## Local Backend

```bash
cd backend
pnpm install
pnpm prisma:generate
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/thesis_orchestral pnpm prisma:migrate:dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/thesis_orchestral pnpm prisma:seed
pnpm dev
```

## Local Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Docker Local

```bash
cp .env.example .env
docker compose up --build
docker compose exec backend pnpm prisma:migrate
docker compose exec backend pnpm prisma:seed
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4001`
- Swagger: `http://localhost:4001/docs`
- PostgreSQL: `localhost:5432`

## Test Accounts

All demo passwords are `password123`.

- Admin: `admin@demo.com`
- Mentor teacher: `mentor@demo.com`
- Critique teacher: `critique1@demo.com`
- Student: `student1@demo.com`

## Production On Hetzner

1. Point DNS `A` records for `thesis.example.com` and `www.thesis.example.com` to the VPS IP.
2. Copy env:

```bash
cp .env.example .env
```

3. Edit `.env`:

```text
NEXT_PUBLIC_API_URL=https://thesis.example.com/api
CORS_ORIGIN=https://thesis.example.com
JWT_SECRET=replace-with-long-random-secret
```

4. Start:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend pnpm prisma:migrate
docker compose -f docker-compose.prod.yml exec backend pnpm prisma:seed
```

5. Install Nginx and Certbot on the host, copy `deploy/nginx/thesis-orchestral.conf`, validate with `nginx -t`, then run:

```bash
sudo certbot --nginx -d thesis.example.com -d www.thesis.example.com
```

## Logs And Backup

```bash
docker compose -f docker-compose.prod.yml logs --tail=200 backend
docker compose -f docker-compose.prod.yml logs --tail=200 frontend
docker compose -f docker-compose.prod.yml logs --tail=200 postgres
```

Back up the `postgres-data` volume before migrations or server moves. Also back up the `uploads-data` volume because thesis files are stored there.
