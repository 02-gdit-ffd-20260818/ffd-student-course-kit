#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"

source_path="${1:-}"
confirmation="${2:-}"
if [[ -z "$source_path" || "$confirmation" != "--yes" ]]; then
  echo "Usage: $0 <daily-directory|encrypted-archive.enc> --yes" >&2
  echo "This replaces the live database and moves current uploads/logs to timestamped safety copies." >&2
  exit 2
fi
[[ -e "$source_path" ]] || { echo "Backup not found: $source_path" >&2; exit 2; }

temporary=""
cleanup() { [[ -z "$temporary" ]] || rm -rf -- "$temporary"; }
trap cleanup EXIT

if [[ "$source_path" == *.enc ]]; then
  [[ -n "${BACKUP_ENCRYPTION_PASSWORD:-}" ]] || { echo "BACKUP_ENCRYPTION_PASSWORD is required" >&2; exit 2; }
  require_command openssl
  temporary="$(mktemp -d)"
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in "$source_path" -out "$temporary/backup.tar.gz" -pass env:BACKUP_ENCRYPTION_PASSWORD
  tar -xzf "$temporary/backup.tar.gz" -C "$temporary"
  source_path="$(find "$temporary" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
fi

for file in database.dump uploads.tar.gz logs.tar.gz SHA256SUMS; do
  [[ -f "$source_path/$file" ]] || { echo "Incomplete backup: missing $file" >&2; exit 1; }
done
(cd "$source_path" && sha256sum --check SHA256SUMS)

compose stop frontend backend || true
compose up -d postgres
for attempt in {1..20}; do
  compose exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1 && break
  [[ "$attempt" -eq 20 ]] && { echo "PostgreSQL did not become ready" >&2; exit 1; }
  sleep 2
done
compose exec -T postgres sh -c 'exec pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --exit-on-error' < "$source_path/database.dump"

stamp="$(date +%Y%m%d_%H%M%S)"
if [[ -d "$PROJECT_ROOT/data/uploads" ]]; then
  mv "$PROJECT_ROOT/data/uploads" "$PROJECT_ROOT/data/uploads.before-restore.$stamp"
fi
mkdir -p "$PROJECT_ROOT/data/uploads"
tar -xzf "$source_path/uploads.tar.gz" -C "$PROJECT_ROOT/data/uploads"

if [[ -d "$PROJECT_ROOT/logs" ]]; then
  mv "$PROJECT_ROOT/logs" "$PROJECT_ROOT/logs.before-restore.$stamp"
fi
mkdir -p "$PROJECT_ROOT/logs"
tar -xzf "$source_path/logs.tar.gz" -C "$PROJECT_ROOT/logs"
chown -R 1000:1000 "$PROJECT_ROOT/data/uploads" "$PROJECT_ROOT/logs"

compose up -d
"$PROJECT_ROOT/scripts/health-check.sh"
echo "Restore complete. Previous files are in *.before-restore.$stamp directories." >&2
