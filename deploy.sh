#!/usr/bin/env bash
# Deploy script — run on the remote server from the project directory.
# Usage: ./deploy.sh
set -euo pipefail

echo "==> Pulling latest changes..."
git pull origin master

echo "==> Rebuilding UI container..."
docker compose build --no-cache archplan-ui

echo "==> Restarting container..."
docker compose up -d archplan-ui

echo "==> Pruning old images..."
docker image prune -f

echo "==> Done. Container status:"
docker compose ps archplan-ui
