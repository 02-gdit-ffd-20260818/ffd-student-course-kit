# 第8课学生模板｜文章保存与SQLite文章表

本课从完整SQLite工程开始，缺课也可直接克隆。

- 课前：可以登录，但文章只适合阅读
- 课后：教师账号可新建、修改、发布文章；刷新和重启后文章仍存在
- TODO 1：跟踪表单对象如何转换成JSON请求以及服务端如何校验
- TODO 2：新增文章后查询SQLite，再重启API确认文章仍存在
- 重点文件：src/views/ArticleFormView.vue；src/services/articleApi.js；server/services/articleInput.js；server/course-app.js；course_articles表

启动：`npm install` → `node tools/prepare-env.mjs` → `npm run setup:course` → 分别运行 `npm run dev:api` 和 `npm run dev -- --host 0.0.0.0`。
