#!/usr/bin/env sh
set -eu

# Safe production deployment helper.
# Run from the repository root on the target server.
# This script does not hardcode server paths and does not delete data.

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

if [ -d ".git" ]; then
  echo "Pulling latest code with fast-forward only..."
  git pull --ff-only
else
  echo "No .git directory found; skipping git pull."
fi

echo "Building production Docker images..."
docker compose -f "$COMPOSE_FILE" build

echo "Starting production services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Running health checks..."
COMPOSE_FILE="$COMPOSE_FILE" sh ./deploy/scripts/healthcheck.sh

echo "Deployment completed."
