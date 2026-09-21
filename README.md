# 第9课学生模板｜文章评论与SQLite关联

本课从完整SQLite工程开始，缺课也可直接克隆。

- 课前：文章可保存，但读者不能参与讨论
- 课后：登录用户可发表评论、刷新后仍存在；评论显示作者和时间
- TODO 1：发表一条评论并用JOIN查询作者昵称
- TODO 2：解释article_id和user_id为什么必须是外键
- 重点文件：src/components/ArticleComments.vue；server/course-app.js；course_comments表；course_users表

启动：`npm install` → `node tools/prepare-env.mjs` → `npm run setup:course` → 分别运行 `npm run dev:api` 和 `npm run dev -- --host 0.0.0.0`。
