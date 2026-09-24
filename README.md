# PersonaLink - 个人信息分享平台

这是一个基于Vue 3和Node.js的个人信息分享平台，实现了分班功能、瀑布流照片墙和用户检索功能，解决了局域网内信息共享的问题。

## 项目架构

- `frontend/`：Vue 3、Pinia、Vue Router、Vite 和静态资源
- `backend/src/`：Express API、路由、中间件和 SQLite 数据层
- `backend/data/`：SQLite 运行数据及脱敏演示种子
- `docs/`：部署、测试和性能说明
- `infrastructure/nginx/`：生产环境反向代理配置

项目使用 npm workspaces，依赖和锁文件统一放在仓库根目录。

## 功能特性

1. 用户注册和登录
2. 分班管理和班级选择
3. 个人资料管理
4. 瀑布流照片墙展示
5. 用户搜索和同义词管理
6. 局域网内用户信息共享

## 文档

详细文档请参考 [docs](./docs) 目录，包含：
- [从 GitHub 到 Ubuntu 服务器：零基础部署教程](./docs/github-to-server.md)
- [部署指南](./docs/deployment.md)
- [性能优化指南](./docs/performance-optimization-guide.md)
- [测试报告](./docs/test-report.md)
- [测试计划](./docs/test-plan.md)

## 运行指南

### 前置条件

- Node.js 24.x 或更高版本
- npm 10.x 或更高版本

在仓库根目录安装一次依赖：

```bash
npm install
```

分别启动两个开发服务：

```bash
npm run dev:backend
npm run dev:frontend
```

常用维护命令：

```bash
npm run build       # 构建前端
npm test            # 运行后端测试
npm run db:status   # 检查 SQLite 数据量和日志模式
```

首次运行会创建 `backend/data/persona-link.sqlite`，并自动导入脱敏的
`backend/data/seed.json` 演示数据。本机旧数据与 SQLite 文件均不会上传 GitHub。

## 访问方式

- 前端应用: http://localhost:3000
- 后端API: http://localhost:3003

## 示例用户

初始化演示数据后可使用管理员账户：
- 邮箱: admin@system.com
- 密码: admin123

## 注意事项

1. SQLite 默认启用 WAL、外键约束和事务，数据库路径可通过 `DATABASE_PATH` 修改
2. `seed.json` 只包含公开演示数据；生产数据和本机旧数据已被 Git 忽略
3. 现有示例账户仍包含兼容性密码逻辑，正式部署前应改为安全认证与密码哈希
4. 系统默认支持局域网访问，请同时配置防火墙与可信的 CORS 来源

> 公开部署前请先阅读零基础部署教程中的安全说明。当前认证逻辑用于演示，不应直接用于承载敏感个人信息。

## 故障排查

1. 如果遇到权限问题，尝试以管理员身份运行命令行
2. 确保后端服务器已启动，否则前端无法访问API
3. 检查 `frontend/vite.config.mjs` 中的代理配置是否正确
4. 查看控制台日志以获取更多错误信息
