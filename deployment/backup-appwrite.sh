#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/studio-simplify}"
APPWRITE_DIR="${APPWRITE_DIR:-/opt/appwrite}"
APP_DIR="${APP_DIR:-/var/www/studio-simplify}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/appwrite-${TIMESTAMP}.tar.gz" "$APPWRITE_DIR"
tar -czf "$BACKUP_DIR/studio-simplify-${TIMESTAMP}.tar.gz" "$APP_DIR"

find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +14 -delete

echo "Backup selesai di $BACKUP_DIR"
