# API Gateway

Public backend entrypoint for the frontend.

## Routes

- `GET /health`
- `GET /api/health`
- `GET /api/models`
- `POST /api/inference/demo`

The gateway calls `MODEL_ORCHESTRATOR_URL` for model and inference requests.

## Commands

```bash
pnpm --filter @thesis/api-gateway dev
pnpm --filter @thesis/api-gateway typecheck
pnpm --filter @thesis/api-gateway build
pnpm --filter @thesis/api-gateway start
```
