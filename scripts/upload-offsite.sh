#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"

file="${1:-}"
[[ -f "$file" ]] || { echo "Backup file not found: $file" >&2; exit 2; }
[[ "$file" == *.enc ]] || { echo "Refusing to upload an unencrypted backup" >&2; exit 2; }

if [[ -z "${OFFSITE_REMOTE:-}" ]]; then
  echo "OFFSITE_REMOTE is empty; encrypted local backup retained" >&2
  exit 0
fi
require_command rclone
rclone copy "$file" "$OFFSITE_REMOTE" --checksum --retries 3
echo "Uploaded $(basename "$file") to $OFFSITE_REMOTE" >&2
