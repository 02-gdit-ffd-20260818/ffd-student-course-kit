# 第11课学生模板｜媒体、备份与Ubuntu部署

本课从完整SQLite工程开始，缺课也可直接克隆。

- 普通用户：注册后角色为 `reader`，可评论并删除自己的评论。
- 管理员：用户名 `teacher`，密码在本机 `.env` 的 `ADMIN_PASSWORD`，可上传媒体和管理文章。
- TODO 1：上传图片、音频和视频，验证视频Range请求返回206。
- TODO 2：把SQLite与媒体移到持久目录，备份后部署到Ubuntu。
- 详细步骤：项目根目录 `实操手册/lesson-11_统一实操.md`。

启动：`npm install` → `node tools/prepare-env.mjs` → 分别运行 `npm run dev:api` 和 `npm run dev -- --host 0.0.0.0`。