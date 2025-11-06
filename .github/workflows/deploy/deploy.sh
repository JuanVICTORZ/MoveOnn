#!/usr/bin/env bash
set -euo pipefail
LOGFILE="$(pwd)/deploy.log"
exec > >(tee -a "$LOGFILE") 2>&1

echo "==== Move ON - Deploy started: $(date) ===="
# Variables expected in env: IMAGE, ORACLE_CONN_STRING, ORACLE_USER, ORACLE_PWD, OPENAI_API_KEY
IMAGE="${IMAGE:-}"
ORACLE_CONN_STRING="${ORACLE_CONN_STRING:-}"
ORACLE_USER="${ORACLE_USER:-}"
ORACLE_PWD="${ORACLE_PWD:-}"

echo "Pulling docker image: $IMAGE"
docker pull "$IMAGE" || { echo "Failed to pull image"; exit 1; }

# Stop existing container
if docker ps -a --format '{{.Names}}' | grep -q '^moveon-backend$'; then
  docker stop moveon-backend || true
  docker rm moveon-backend || true
fi

echo "Starting container..."
docker run -d --name moveon-backend \
  -e ORACLE_CONN_STRING="$ORACLE_CONN_STRING" \
  -e ORACLE_USER="$ORACLE_USER" \
  -e ORACLE_PWD="$ORACLE_PWD" \
  -e OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
  -p 3000:3000 "$IMAGE"

echo "Waiting for app to initialize..."
sleep 8

# Run DB migrations or SQL script to apply latest PL/SQL objects
if [ -n "$ORACLE_CONN_STRING" ] && command -v sqlplus >/dev/null 2>&1; then
  echo "Applying DB scripts..."
  echo "CONNECT $ORACLE_USER/$ORACLE_PWD@$ORACLE_CONN_STRING" > /tmp/mig.sql
  cat ./database/moveon_database.sql >> /tmp/mig.sql
  sqlplus -s /nolog @" /tmp/mig.sql" || echo "SQLPlus execution failed (check credentials)"
else
  echo "sqlplus not available or ORACLE_CONN_STRING empty - skipping DB migrations"
fi

echo "==== Deploy finished: $(date) ===="
