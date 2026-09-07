# 长风成卷｜P2 个人博客与内容管理平台

当前版本：`p2-v2.1.1` SQLite 持久化生产部署补丁。

生产地址：<https://ffd-p2-blog.netlify.app/>

## 5 分钟启动

```powershell
# 按锁文件精确安装生产版依赖。
npm ci
# 检查认证、数据库适配和部署文件。
npm run check
# 运行认证与授权测试。
npm test
# 启动前端开发服务器；结束时按 Ctrl+C。
npm run dev
```

另开一个终端运行 API：

```powershell
# 在另一个终端启动本地 API，保持窗口运行。
npm run dev:api
```

生产构建：

```powershell
# 生成前端生产构建。
npm run build
```

## v1.0 已完成

- 文章列表、详情、标签筛选和关于页面。
- props、emit、命名 slot 和生命周期。
- loading、success、empty、error、not-found 状态。
- 10 项逻辑测试、3 项组件测试和 9 项结构检查。
- GitHub Actions 与 Netlify 配置。

## v1.1 新增

- Vue Router 动态路由与 Netlify SPA fallback。
- Pinia 文章 store、搜索、新建、编辑、删除和预览。
- 草稿隔离、字段级校验、删除确认和 localStorage 刷新恢复。
- 管理端 service 的正常、边界和失败测试。

## v2.0 新增

- Express health 与文章 REST CRUD，统一 400/404/500 错误格式。
- 内存 repository 隔离数据层，为 v2.1 替换 SQLite 留出边界。
- 前端 `articleApi` 与异步 Pinia action，API 停止时显示 error/retry。
- CORS、请求 ID、脱敏结构化日志、API 契约与 `.http` 请求集。

## v2.1 新增

- Node 内置 SQLite 数据库，默认写入被 Git 忽略的 `var/p2-blog.sqlite`。
- `users`、`articles`、`comments` 三表迁移，外键级联、索引与迁移历史。
- SQLite repository 持久化 CRUD，以及状态、关键词、分页查询。
- `db:migrate`、`db:seed`、`db:verify`、`db:backup`、`db:restore` 运维命令。
- 第 10 次课教师指南和数据库自动测试。

## v2.1.1 部署补丁

- Ubuntu systemd API 与 Nginx 路径反向代理已经上线。
- Netlify 通过同源 `/api/*` 转发到 Ubuntu，前端无需暴露跨域地址。

## 状态模拟

- 空数据：`/?empty=1`
- 请求失败：`/?fail=1`
- 文章不存在：`/articles/missing`

教师指南见 `docs/lesson-07-teacher-guide.md`，学生入口见 `docs/lesson-07-student-guide.md`。
