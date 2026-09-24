#!/usr/bin/env bash
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[[ "$(id -u)" -eq 0 ]] || { echo "请使用 sudo 运行：sudo $0" >&2; exit 1; }

read -rsp "请输入新管理员密码（至少 12 位）: " new_password
echo
read -rsp "请再次输入新密码: " confirmed_password
echo
trap 'unset new_password confirmed_password' EXIT

[[ ${#new_password} -ge 12 ]] || { echo "新密码至少需要 12 位" >&2; exit 2; }
[[ "$new_password" == "$confirmed_password" ]] || { echo "两次输入的密码不一致" >&2; exit 2; }

printf '%s' "$new_password" | compose exec -T backend node -e '
  const fs = require("node:fs");
  const bcrypt = require("bcryptjs");
  const { query, closeDB } = require("./backend/src/database");

  (async () => {
    try {
      const password = fs.readFileSync(0, "utf8");
      const hash = await bcrypt.hash(password, 12);
      const result = await query(
        "UPDATE users SET password_hash=$1, updated_at=now() WHERE lower(email)=lower($2) RETURNING email",
        [hash, "admin@system.com"]
      );
      if (!result.rowCount) throw new Error("没有找到管理员账号");
      console.log(`管理员密码修改成功：${result.rows[0].email}`);
    } catch (error) {
      console.error(`密码修改失败：${error.message}`);
      process.exitCode = 1;
    } finally {
      await closeDB();
    }
  })();
'

sed -i '/^ADMIN_INITIAL_PASSWORD=/d' "$PROJECT_ROOT/.env"
echo "已从 .env 删除一次性 ADMIN_INITIAL_PASSWORD"
