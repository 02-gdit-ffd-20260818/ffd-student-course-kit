# 第11课学生模板｜媒体内容、备份与Ubuntu部署

本课从完整SQLite工程开始，缺课也可直接克隆。

- 课前：本机SQLite博客功能完整，但还不能稳定公开访问
- 课后：图片/音频/视频可访问，SQLite可备份恢复，网站和API公网可用
- TODO 1：上传三类媒体并验证视频Range返回206
- TODO 2：执行部署前备份、服务重启、部署后持久化检查
- 重点文件：server/media-upload.js；ArticleFormView.vue；database/backup.mjs；Ubuntu部署实操.md；scripts/verify-live.mjs

启动：`npm install` → `node tools/prepare-env.mjs` → `npm run setup:course` → 分别运行 `npm run dev:api` 和 `npm run dev -- --host 0.0.0.0`。
