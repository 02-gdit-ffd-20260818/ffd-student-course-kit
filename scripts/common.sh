#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILES=(-f "$PROJECT_ROOT/compose.yaml" -f "$PROJECT_ROOT/compose.prod.yaml")
BACKUP_ENV_FILE="${BACKUP_ENV_FILE:-/etc/personalink/backup.env}"

if [[ -f "$BACKUP_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$BACKUP_ENV_FILE"
  set +a
fi

compose() {
  docker compose --project-directory "$PROJECT_ROOT" "${COMPOSE_FILES[@]}" "$@"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }
}

mkdir -p "$PROJECT_ROOT/backups/hourly" "$PROJECT_ROOT/backups/daily" "$PROJECT_ROOT/backups/monthly"
