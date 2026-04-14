#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/studio-simplify}"

cd "$APP_DIR"
git pull
npm install
npm run build
sudo systemctl reload nginx

echo "Frontend deploy selesai."
