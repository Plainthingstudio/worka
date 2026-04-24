#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
HOSTNAME_VALUE="$(hostname)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/worka}"
APPWRITE_DIR="${APPWRITE_DIR:-}"
APP_DIR="${APP_DIR:-}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STOP_APPWRITE="${STOP_APPWRITE:-true}"

find_first_dir() {
  for dir in "$@"; do
    if [[ -d "$dir" ]]; then
      printf '%s\n' "$dir"
      return 0
    fi
  done

  return 1
}

if [[ -z "$APPWRITE_DIR" ]]; then
  APPWRITE_DIR="$(find_first_dir "$HOME/appwrite" /home/ubuntu/appwrite /opt/appwrite)"
fi

if [[ -z "$APP_DIR" ]]; then
  APP_DIR="$(find_first_dir "$HOME/worka" /home/ubuntu/worka /var/www/studio-simplify /var/www/worka)"
fi

if [[ ! -d "$APPWRITE_DIR" ]]; then
  echo "Appwrite directory not found. Set APPWRITE_DIR=/path/to/appwrite and retry." >&2
  exit 1
fi

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found. Set APP_DIR=/path/to/worka and retry." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for Appwrite backups." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
WORK_DIR="$(mktemp -d "$BACKUP_DIR/.worka-backup-${TIMESTAMP}.XXXXXX")"
FINAL_ARCHIVE="$BACKUP_DIR/worka-manual-backup-${HOSTNAME_VALUE}-${TIMESTAMP}.tar.gz"
APPWRITE_STOPPED=false

cleanup() {
  if [[ "$APPWRITE_STOPPED" == "true" ]]; then
    echo "Starting Appwrite again..."
    (cd "$APPWRITE_DIR" && docker compose up -d)
  fi

  rm -rf "$WORK_DIR"
}

trap cleanup EXIT

echo "Preparing Worka backup..."
echo "Appwrite dir: $APPWRITE_DIR"
echo "App dir:      $APP_DIR"
echo "Backup dir:   $BACKUP_DIR"

if ! (cd "$APPWRITE_DIR" && docker compose config >/dev/null); then
  echo "Could not read Appwrite Docker Compose config in $APPWRITE_DIR." >&2
  exit 1
fi

cat > "$WORK_DIR/manifest.txt" <<EOF
Worka manual backup
Timestamp: $TIMESTAMP
Hostname: $HOSTNAME_VALUE
Appwrite dir: $APPWRITE_DIR
App dir: $APP_DIR
Stop Appwrite during volume copy: $STOP_APPWRITE
EOF

{
  echo "== date =="
  date -Is
  echo
  echo "== uname =="
  uname -a
  echo
  echo "== disk =="
  df -h
  echo
  echo "== docker ps =="
  docker ps
  echo
  echo "== app git =="
  if [[ -d "$APP_DIR/.git" ]]; then
    git -C "$APP_DIR" status --short
    git -C "$APP_DIR" rev-parse HEAD
  else
    echo "No git repository found in app dir."
  fi
} > "$WORK_DIR/server-info.txt" 2>&1 || true

echo "Dumping MariaDB..."
if ! (cd "$APPWRITE_DIR" && docker compose exec -T mariadb sh -lc 'mysqldump --all-databases --add-drop-database --single-transaction --routines --triggers -uroot -p"$MYSQL_ROOT_PASSWORD"') > "$WORK_DIR/mariadb-all-databases.sql"; then
  echo "MariaDB dump failed. Appwrite service name may be different from 'mariadb'." >&2
  exit 1
fi

echo "Saving Appwrite config..."
tar \
  --exclude='backups' \
  --exclude='*.tar.gz' \
  -czf "$WORK_DIR/appwrite-config.tar.gz" \
  -C "$APPWRITE_DIR" .

echo "Saving Worka app config..."
tar \
  --ignore-failed-read \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  -czf "$WORK_DIR/worka-app-config.tar.gz" \
  -C "$APP_DIR" \
  .env.production package.json package-lock.json docs deployment scripts

echo "Saving Nginx and SSL renewal config..."
sudo tar \
  --ignore-failed-read \
  -czf "$WORK_DIR/nginx-letsencrypt-config.tar.gz" \
  /etc/nginx/sites-available \
  /etc/nginx/sites-enabled \
  /etc/letsencrypt/renewal \
  /etc/letsencrypt/live 2>/dev/null || true

mapfile -t VOLUMES < <(
  cd "$APPWRITE_DIR"
  docker inspect $(docker compose ps -q) \
    --format '{{range .Mounts}}{{if eq .Type "volume"}}{{.Name}}{{"\n"}}{{end}}{{end}}' 2>/dev/null \
    | awk 'NF' \
    | sort -u
)

if [[ "${#VOLUMES[@]}" -eq 0 ]]; then
  echo "No Appwrite Docker volumes detected." >&2
  exit 1
fi

printf '%s\n' "${VOLUMES[@]}" > "$WORK_DIR/docker-volumes.txt"
mkdir -p "$WORK_DIR/volumes"

if [[ "$STOP_APPWRITE" == "true" ]]; then
  echo "Stopping Appwrite for consistent volume backup..."
  (cd "$APPWRITE_DIR" && docker compose stop)
  APPWRITE_STOPPED=true
fi

echo "Saving Docker volumes..."
for volume in "${VOLUMES[@]}"; do
  echo "  - $volume"
  docker run --rm \
    -v "$volume:/volume-data:ro" \
    -v "$WORK_DIR/volumes:/backup" \
    alpine:3.20 \
    sh -lc "tar -czf '/backup/${volume}.tar.gz' -C /volume-data ."
done

echo "Creating final backup archive..."
tar -czf "$FINAL_ARCHIVE" -C "$WORK_DIR" .
chmod 600 "$FINAL_ARCHIVE"

find "$BACKUP_DIR" -maxdepth 1 -type f -name "worka-manual-backup-*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo
echo "Backup complete:"
echo "$FINAL_ARCHIVE"
echo
echo "This archive contains secrets and user/client data. Keep it private."
