# 第 15 课｜学生课堂工程

> 从这里开始：先阅读 [本课操作手册](课堂资料/本课操作手册.md)，完成每一步的“自己验证”后再继续。

- 跟不上或上一课没有完成：走手册中的**路线 B**。
- 要保留上一课个人作品：走手册中的**路线 A**，先预演续课工具。
- 基础 TODO 必须先独立完成；自检通过后才能进行 AI 复盘。

---

## 原工程说明

# PersonaLink Docker

PersonaLink 是面向班级/社群的个人信息分享平台，包含注册登录、班级管理、资料编辑、照片墙、用户搜索和同义词管理。本仓库是使用 Vue 3、Express、PostgreSQL 17 和 Docker Compose 的生产部署版本，适合部署到一台 Ubuntu 22.04/24.04 LTS 服务器。

## 新手应该先看哪里

如果你第一次接触本项目，按这个顺序阅读：

1. [命令速查：从不会到会](docs/command-reference.md)：先理解 `sudo`、`cd`、`git clone`、`npm ci` 和 `docker compose`。
2. [Ubuntu 私有仓库零基础部署](docs/deploy-ubuntu.md)：第一次把项目部署到服务器。
3. [CI/CD 与日常发布](docs/cicd.md)：以后修改代码并发布新版本。
4. [备份、异地副本与恢复](docs/backup-restore.md)：上线前建立备份，并定期验证能否恢复。
5. [更换服务器：小白实操手册](docs/server-migration.md)：服务器到期或需要迁移时使用。
6. [架构与持续开发](docs/architecture.md)：了解代码、数据库和生产数据分别放在哪里。

## 项目结构

```text
Internet -> 宿主机 Nginx (80/443) -> 127.0.0.1:3100 -> frontend (Vue/Nginx)
                                                       -> backend (Node/Express)
                                                       -> PostgreSQL 17
```

- `frontend/`：Vue 3 前端、Pinia 状态管理和 Vue Router。
- `backend/`：Express API；数据库访问集中在 `backend/src/repository.js`。
- `backend/migrations/`：按顺序执行的数据库迁移，不能用手工生产 SQL 代替。
- `docker/`：前后端镜像构建文件；`compose.yaml` 是基础服务配置。
- `scripts/`：健康检查、备份、恢复和生产更新脚本。
- `data/uploads/`、`logs/`、`backups/`：运行时数据，不提交 Git。

## 下载仓库：通用写法与实际示例

`git clone` 的意思是“从 GitHub 复制一份仓库到本地”；`cd` 的意思是“进入这个目录”。

通用操作：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 下载 GitHub 仓库；把尖括号替换为真实用户名和仓库名
cd <仓库名>                                         # 进入下载后的项目目录
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`git` 管理版本；`status` 查看改动；`diff` 查看逐行差异；`add` 选择待提交文件；`commit -m` 创建本地版本并写说明；`push` 发到远端；`clone` 下载仓库，`--branch` 选择分支，`--single-branch` 只取该分支历史；`remote` 管理远端别名，`fetch` 只取回记录。命令中的 `.` 表示当前目录，`--` 后面是文件路径。推送前用 `git remote -v` 核实 origin 是自己的仓库。

`cd` / `Set-Location` 切换终端当前目录；含空格的路径用引号包起来。CMD 的 `/d` 同时切换盘符；PowerShell 用 `Set-Location "路径"`，不加 `/d`。
<!-- COMMAND_HELP:END -->


实际仓库操作示例：

仓库页面：[PersonaLink_NoDB_20260828](https://github.com/Abner199/PersonaLink_NoDB_20260828)

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载指定的实际仓库
cd PersonaLink_NoDB_20260828                                         # 进入该仓库目录
```

> 上面的 `PersonaLink_NoDB_20260828` 是真实仓库示例。若要按本文部署 Docker 版，请确认仓库中有 `compose.yaml`、`docker/` 和 `scripts/`；当前 Docker 版远程仓库为 `https://github.com/Abner199/PersonaLink20260821Docker.git`。

## 快速启动（已有 Ubuntu、Docker 的情况）

在项目根目录执行。第一次启动前必须编辑 `.env`，不能直接使用示例密码。

```bash
cp .env.example .env                                      # 复制配置模板；真实配置文件只保存在本机
nano .env                                                  # 编辑数据库密码、JWT_SECRET、管理员初始密码和域名
docker compose -f compose.yaml -f compose.prod.yaml config --quiet  # 只校验 Compose 配置，不启动服务
docker compose -f compose.yaml -f compose.prod.yaml up -d --build   # 构建镜像并在后台启动服务
sudo ./scripts/health-check.sh                             # 请求 /health，确认前端、后端和数据库链路正常
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`docker compose` 读取当前工程的 Compose 配置；`up` 创建并启动服务；`-d` 后台运行；`--build` 启动前构建；`ps` 看状态；`logs -f` 跟随日志；`exec 服务名 命令` 在运行容器内执行；`down` 停止并删除容器但保留命名卷；`down -v` 还会删除数据卷；`-f 文件` 选择配置文件，多个 `-f` 按顺序合并。
<!-- COMMAND_HELP:END -->


成功后访问 `CORS_ORIGINS` 中配置的地址。首次启动会创建 `admin@system.com` 管理员，密码是 `.env` 中的 `ADMIN_INITIAL_PASSWORD`；登录后请立即改密。

## 常用命令

```bash
docker compose -f compose.yaml -f compose.prod.yaml ps                    # 查看容器、端口和 healthy 状态
docker compose -f compose.yaml -f compose.prod.yaml logs --tail=100 backend  # 查看 backend 最近 100 行日志
docker compose -f compose.yaml -f compose.prod.yaml logs -f backend        # 持续跟踪日志；Ctrl+C 只退出查看，不停止容器
docker compose -f compose.yaml -f compose.prod.yaml up -d --build          # 修改代码后重新构建并更新服务
sudo ./scripts/backup-db.sh                                                   # 生成 PostgreSQL 小时备份
sudo ./scripts/backup-all.sh                                                  # 生成数据库、上传文件、日志和加密异地备份
sudo ./scripts/update-production.sh                                          # 在生产服务器执行受控更新
sudo ./scripts/change-admin-password.sh                                     # 交互式修改管理员密码
npm ci                                                                        # 本地/CI 按锁定版本安装依赖；生产服务器不需要手工执行
npm test                                                                      # 运行后端测试；需要 PostgreSQL 和 DATABASE_URL
npm run build                                                                 # 构建前端生产文件
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`npm` 管理项目依赖并执行脚本；`install` 安装依赖（有兼容的锁文件时使用锁定版本）；`ci` 严格按锁文件安装并重建 node_modules；`run 名称` 执行当前 package.json 的 scripts 中同名命令；`test` 是运行测试脚本。先确认终端所在目录有本课 package.json。服务启动后持续占用终端是正常的，另开终端做下一步，Ctrl+C 才停止服务。
<!-- COMMAND_HELP:END -->


每条命令的参数解释见 [命令速查](docs/command-reference.md)。

## 安全底线

- 只提交 `.env.example` 和 `.backup.env.example`，绝不提交 `.env`、数据库 dump、用户上传文件、备份或真实凭据。
- PostgreSQL 仅在 Docker 内网提供服务；公网只开放 Nginx 的 `80/443`，SSH 使用 `22`。
- `docker compose down --volumes` 会删除数据库 volume；除非正在清理新服务器上的空库，否则不要执行。
- 生产数据变更前先备份；恢复操作会替换当前数据库，必须确认备份目录后再执行。

## 开发命令

```bash
npm ci                 # 按 package-lock.json 安装精确版本，适合首次开发或 CI
npm run dev:frontend   # 启动 Vite 前端开发服务器
npm run dev:backend    # 启动 Express 后端 watch 模式
npm run build          # 构建前端，提交前建议执行
npm test               # 运行后端测试，需要可用的测试 PostgreSQL
```

项目要求 Node.js 24 或更高版本。生产环境不在宿主机安装 Node/npm，依赖由 Dockerfile 在构建镜像时安装。
