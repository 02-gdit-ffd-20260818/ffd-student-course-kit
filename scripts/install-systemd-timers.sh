#!/usr/bin/env bash
set -Eeuo pipefail
[[ "$(id -u)" -eq 0 ]] || { echo "Run as root: sudo $0" >&2; exit 1; }
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
[[ "$root" == "/srv/personalink" ]] || { echo "Expected repository at /srv/personalink; current path: $root" >&2; exit 2; }
install -m 0644 "$root/infrastructure/systemd/"personalink-backup-* /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now personalink-backup-db.timer personalink-backup-daily.timer
systemctl list-timers 'personalink-*' --no-pager
