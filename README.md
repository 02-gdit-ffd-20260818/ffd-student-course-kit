# 第10课学生模板｜权限控制与安全边界

本课从完整SQLite工程开始，缺课也可直接克隆。

- 课前：功能可用，但不能证明谁能修改或删除什么
- 课后：匿名写入返回401；越权返回403；本人可删自己的评论；管理员可管理文章
- TODO 1：分别制造401和403并在Network中解释差异
- TODO 2：用两个普通账号验证甲不能删除乙的评论
- 重点文件：server/course-app.js中的signed/admin；src/router.js；ArticleComments.vue；tests/api.test.mjs

启动：`npm install` → `node tools/prepare-env.mjs` → `npm run setup:course` → 分别运行 `npm run dev:api` 和 `npm run dev -- --host 0.0.0.0`。
