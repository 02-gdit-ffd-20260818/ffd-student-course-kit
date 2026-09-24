# 架构与持续开发

这份文档回答两个问题：请求和数据在系统里怎么流动，以及修改代码后应该遵守什么边界。命令参数的基础解释见 [命令速查](command-reference.md)。

## 运行边界

```text
浏览器
  → 宿主机 Nginx（80/443，负责域名和 TLS）
  → frontend 容器（127.0.0.1:3100）
  → Docker 内网中的 backend（3003）
  → Docker 内网中的 PostgreSQL（5432）
```

宿主机 Nginx 只反向代理到 `127.0.0.1:3100`。Frontend 容器提供 Vue 静态文件，并在 Docker 内网把 `/api` 转发给 Backend。Backend 通过连接池访问 `postgres:5432`。Backend 和 PostgreSQL 没有宿主机公网端口。

## 目录和数据边界

| 内容 | 位置 | 是否提交 Git | 说明 |
| --- | --- | --- | --- |
| Vue 前端 | `frontend/` | 是 | 页面和前端构建配置 |
| Express 后端 | `backend/` | 是 | API、服务和 repository 层 |
| SQL migration | `backend/migrations/` | 是 | 按顺序执行；schema 变更必须新增 migration |
| Compose / Docker | `compose*.yaml`、`docker/` | 是 | 服务编排和镜像构建 |
| 生产密钥 | `.env`、`/etc/personalink/backup.env` | 否 | 只存服务器，权限建议 600 |
| PostgreSQL 数据库 | `personalink_postgres_data` named volume | 否 | 不直接复制数据目录 |
| 用户上传文件 | `data/uploads/` bind mount | 否 | 由备份脚本单独打包 |
| 运行日志 | `logs/` | 否 | 不提交真实日志 |
| 备份 | `backups/` 和异地 remote | 否 | 不提交 dump 或加密归档 |

PostgreSQL 使用 named volume，因为数据库由容器管理；uploads 使用 bind mount，方便用 `tar` 或 `rsync` 复制。跨服务器迁移数据库使用 `pg_dump`/`pg_restore`，不直接复制 PostgreSQL 数据目录。

## 第一次下载代码

通用命令：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 从 GitHub 下载远程仓库
cd <仓库名>                                         # 进入项目目录
```

实际仓库示例：

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载真实仓库示例
cd PersonaLink_NoDB_20260828                                         # 进入仓库目录
```

需要运行 Docker 生产版时，请确认仓库包含 `compose.yaml`、`docker/`、`frontend/`、`backend/` 和 `scripts/`。

## 开发和发布流程

1. 在功能分支修改代码；数据库结构变化必须在 `backend/migrations/` 新建有顺序的 SQL migration。
2. 本地先安装依赖并验证构建：

   ```bash
   npm ci          # 按 package-lock.json 安装精确版本；ci 适合本地首次安装和 CI
   npm run build   # 构建 Vue 前端，确认生产构建成功
   npm test        # 在有 PostgreSQL 的测试环境运行后端测试
   ```

3. Push 或提交 Pull Request，让 GitHub Actions 检查依赖、后端测试、前端构建、Compose 和镜像。
4. `main` 的 CI 全绿后，在生产服务器执行：

   ```bash
   cd /srv/personalink                  # 进入固定生产目录
   sudo ./scripts/update-production.sh  # 备份、快进更新、构建、重启并做健康检查
   ```

5. 上线后查看健康接口和容器状态：

   ```bash
   curl -fsS https://你的域名/health  # 检查公网健康接口
   sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 查看服务和 healthy 状态
   ```

## 选择技术的原则

Vue、Express 和 PostgreSQL 足以满足当前功能；不预先引入 Redis、Kubernetes 或 ORM。只有出现可量化的性能、部署或多人协作需求时，才增加基础设施，并同步更新 Compose、CI、备份和部署文档。

## 代码审查清单

- 变更是否有对应测试或至少完成 `npm run build`？
- schema 变更是否是新的有序 migration，而不是手工修改生产数据库？
- 是否意外提交 `.env`、dump、上传文件、日志或真实用户信息？
- API/前端契约变化是否同时更新调用方和文档？
- 生产变更是否说明备份、回退和恢复影响？
