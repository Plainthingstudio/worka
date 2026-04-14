#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /path/to/appwrite-backup.tar.gz"
  exit 1
fi

ARCHIVE="$1"
APPWRITE_DIR="${APPWRITE_DIR:-/opt/appwrite}"

sudo systemctl stop nginx || true
docker compose -f "$APPWRITE_DIR/docker-compose.yml" down || true
tar -xzf "$ARCHIVE" -C /
docker compose -f "$APPWRITE_DIR/docker-compose.yml" up -d
sudo systemctl start nginx || true

echo "Restore selesai."
