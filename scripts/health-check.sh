#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"
require_command curl

binding="$(compose port frontend 80)"
port="${binding##*:}"
for attempt in {1..20}; do
  if curl --fail --silent --show-error "http://127.0.0.1:${port}/health"; then
    echo
    exit 0
  fi
  [[ "$attempt" -eq 20 ]] || sleep 3
done
echo "Health check failed after 20 attempts" >&2
compose ps >&2
exit 1
