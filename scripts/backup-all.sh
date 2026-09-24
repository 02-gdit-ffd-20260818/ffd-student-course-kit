#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"
require_command tar
require_command sha256sum

stamp="$(date +%Y%m%d_%H%M%S)"
daily="$PROJECT_ROOT/backups/daily/$stamp"
mkdir -p "$daily"

db_file="$($PROJECT_ROOT/scripts/backup-db.sh)"
cp "$db_file" "$daily/database.dump"
tar -C "$PROJECT_ROOT/data/uploads" -czf "$daily/uploads.tar.gz" .
tar -C "$PROJECT_ROOT/logs" -czf "$daily/logs.tar.gz" .
(cd "$daily" && sha256sum database.dump uploads.tar.gz logs.tar.gz > SHA256SUMS)

if [[ -n "${BACKUP_ENCRYPTION_PASSWORD:-}" ]]; then
  require_command openssl
  archive="$PROJECT_ROOT/backups/daily/personalink_${stamp}.tar.gz"
  encrypted="${archive}.enc"
  encrypted_partial="${encrypted}.partial"
  trap 'rm -f "${archive:-}" "${encrypted_partial:-}"' EXIT
  tar -C "$PROJECT_ROOT/backups/daily" -czf "$archive" "$stamp"
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -in "$archive" -out "$encrypted_partial" -pass env:BACKUP_ENCRYPTION_PASSWORD
  mv "$encrypted_partial" "$encrypted"
  rm -f "$archive"
  "$PROJECT_ROOT/scripts/upload-offsite.sh" "$encrypted"
  if [[ "$(date +%d)" == "01" ]]; then
    cp "$encrypted" "$PROJECT_ROOT/backups/monthly/$(date +%Y-%m).tar.gz.enc"
  fi
else
  echo "BACKUP_ENCRYPTION_PASSWORD is empty; local files were created but encrypted/off-site backup failed" >&2
  exit 1
fi

find "$PROJECT_ROOT/backups/daily" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf -- {} +
find "$PROJECT_ROOT/backups/daily" -type f -name '*.enc' -mtime +30 -delete
find "$PROJECT_ROOT/backups/monthly" -type f -name '*.enc' -mtime +366 -delete
echo "$daily"
