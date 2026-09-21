# 第10课｜权限控制与安全边界

这是可独立启动的完整工程。缺课学生可直接克隆本课分支；已有个人项目的学生可按实操手册继续开发。

- 操作前：功能可用，但角色和数据所有权尚未完整约束。
- 操作后：游客、普通用户、管理员拥有清晰且可验证的权限。
- 核心知识：认证中间件、授权、401/403、资源所有权。
- 重点文件：server/services/auth.js；server/blog-app.js；src/router.js；tests/api.test.mjs。

## 启动

```cmd
npm install
node tools/prepare-env.mjs
npm run dev:api
```

另开一个 Trae 终端：

```cmd
npm run dev -- --host 0.0.0.0
```

网页：`http://localhost:5173`；后端健康检查：`http://localhost:3000/health`。

## 账号与数据

- 普通用户在注册页创建，角色固定为 `reader`。
- 管理员用户名固定为 `admin`；随机密码在本机 `.env` 的 `ADMIN_PASSWORD`。
- SQLite 文件是 `var/blog.sqlite`。
- `.env`、`var`、`node_modules` 不提交到 Git。
- 详细开发、验证、提交和部署步骤见 `实操手册/lesson-10_统一实操.md`。