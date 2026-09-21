# 第7课学生模板｜注册、登录与SQLite用户表

本课从完整SQLite工程开始，缺课也可直接克隆。

- 课前：只能匿名阅读，不知道访问者是谁
- 课后：可以注册、登录、退出；账号写入SQLite，刷新和重启后仍可登录
- TODO 1：观察 course_users 表及 username UNIQUE，解释为什么不能保存明文密码
- TODO 2：用浏览器Network追踪注册和登录请求，分别验证201、409和401
- 重点文件：server/course-db.js；server/course-app.js；server/services/auth.js；src/views/RegisterView.vue；src/views/LoginView.vue；src/stores/auth.js

启动：`npm install` → `node tools/prepare-env.mjs` → `npm run setup:course` → 分别运行 `npm run dev:api` 和 `npm run dev -- --host 0.0.0.0`。
