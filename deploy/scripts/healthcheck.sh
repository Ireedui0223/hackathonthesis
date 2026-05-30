#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
API_HEALTH_URL="${API_HEALTH_URL:-http://localhost/health}"

check_url() {
  name="$1"
  url="$2"

  echo "Checking $name at $url"
  if ! curl -fsS "$url" >/dev/null; then
    echo "$name health check failed"
    exit 1
  fi
}

check_url "frontend" "$FRONTEND_URL"
check_url "backend" "$API_HEALTH_URL"

echo "All health checks passed."
