# 第11课｜媒体、备份与 Ubuntu 部署

这是可独立启动的完整工程。缺课学生可直接克隆本课分支；已有个人项目的学生可按实操手册继续开发。

- 操作前：本机功能完整，但尚未形成可恢复的在线服务。
- 操作后：媒体可上传访问，SQLite 可备份，网站与 API 可在线运行。
- 核心知识：媒体上传、Range 206、备份恢复、systemd、Nginx。
- 重点文件：server/media-upload.js；database/backup.mjs；scripts/verify-live.mjs；Ubuntu部署实操.md。

## 启动

```cmd
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
npm install
node tools/prepare-env.mjs
npm run dev:api
```

另开一个 Trae 终端：

```cmd
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
npm run dev -- --host 0.0.0.0
```

网页：`http://localhost:5173`；后端健康检查：`http://localhost:3000/health`。

## 账号与数据

- 普通用户在注册页创建，角色固定为 `reader`。
- 管理员用户名固定为 `admin`；随机密码在本机 `.env` 的 `ADMIN_PASSWORD`。
- SQLite 文件是 `var/blog.sqlite`。
- `.env`、`var`、`node_modules` 不提交到 Git。
- 详细开发、验证、提交和部署步骤见 `实操手册/第11课_课堂操作手册.md`。
