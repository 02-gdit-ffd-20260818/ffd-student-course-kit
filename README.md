# 第09课｜文章评论与 SQLite 关联

这是可独立启动的完整工程。缺课学生可直接克隆本课分支；已有个人项目的学生可按实操手册继续开发。

- 操作前：文章可保存，但读者不能参与讨论。
- 操作后：登录用户可以评论，刷新与重启后仍保留。
- 核心知识：comments 表、外键、JOIN、一对多关系。
- 重点文件：src/components/ArticleComments.vue；server/blog-app.js；server/blog-db.js。

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
- 详细开发、验证、提交和部署步骤见 `实操手册/第09课_课堂操作手册.md`。
