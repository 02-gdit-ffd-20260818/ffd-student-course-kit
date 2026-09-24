#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"

stamp="$(date +%Y%m%d_%H%M%S)"
target="$PROJECT_ROOT/backups/hourly/db_${stamp}.dump"
temporary="${target}.partial"
trap 'rm -f "$temporary"' EXIT

compose exec -T postgres sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$temporary"
[[ -s "$temporary" ]] || { echo "Database backup is empty" >&2; exit 1; }
mv "$temporary" "$target"
find "$PROJECT_ROOT/backups/hourly" -type f -name 'db_*.dump' -mtime +7 -delete
echo "$target"
