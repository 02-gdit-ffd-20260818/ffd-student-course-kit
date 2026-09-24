#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose --project-directory "$PROJECT_ROOT" -f "$PROJECT_ROOT/compose.yaml" -f "$PROJECT_ROOT/compose.prod.yaml")

[[ "$(id -u)" -eq 0 ]] || { echo "请使用 sudo 运行：sudo $0" >&2; exit 1; }
[[ "$PROJECT_ROOT" == "/srv/personalink" ]] || { echo "项目应位于 /srv/personalink，当前是 $PROJECT_ROOT" >&2; exit 2; }
command -v git >/dev/null || { echo "缺少命令：git" >&2; exit 1; }
command -v docker >/dev/null || { echo "缺少命令：docker" >&2; exit 1; }

cd "$PROJECT_ROOT"
[[ "$(git branch --show-current)" == "main" ]] || { echo "生产仓库必须位于 main 分支" >&2; exit 2; }
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
  echo "服务器的跟踪文件有本地修改，请先检查 git status，发布已停止。" >&2
  exit 2
}

if [[ "${1:-}" != "--yes" ]]; then
  read -rp "确认最新 GitHub Actions 已全绿，输入大写 DEPLOY 继续: " confirmation
  [[ "$confirmation" == "DEPLOY" ]] || { echo "已取消发布"; exit 2; }
fi

previous_commit="$(git rev-parse HEAD)"
echo "当前提交：$previous_commit"
"$PROJECT_ROOT/scripts/backup-db.sh"

git fetch origin main
git merge --ff-only origin/main
current_commit="$(git rev-parse HEAD)"

"${COMPOSE[@]}" config --quiet
"${COMPOSE[@]}" build
"${COMPOSE[@]}" up -d

if ! "$PROJECT_ROOT/scripts/health-check.sh"; then
  echo "发布后健康检查失败。发布前提交：$previous_commit" >&2
  "${COMPOSE[@]}" ps >&2 || true
  "${COMPOSE[@]}" logs --tail=100 backend >&2 || true
  exit 1
fi

"${COMPOSE[@]}" ps
echo "发布成功：$previous_commit -> $current_commit"
