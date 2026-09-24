#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"
[[ -n "${BACKUP_ENCRYPTION_PASSWORD:-}" ]] || { echo "BACKUP_ENCRYPTION_PASSWORD is required" >&2; exit 2; }
require_command openssl

target="${1:-$PROJECT_ROOT/backups/config_$(date +%Y%m%d_%H%M%S).env.enc}"
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -in "$PROJECT_ROOT/.env" -out "$target" -pass env:BACKUP_ENCRYPTION_PASSWORD
echo "$target"
