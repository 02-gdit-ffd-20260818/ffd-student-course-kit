# CI/CD 与日常发布：小白操作手册

本项目采用“自动 CI + 人工确认 CD”：GitHub Actions 先自动检查代码，确认全部通过后，再由你登录生产服务器执行发布脚本。这样每次上线都有检查和人工确认，适合单服务器、私有仓库和初学者。

如果不熟悉命令参数，先看 [命令速查](command-reference.md)。其中 `npm ci` 的意思是“严格按照 `package-lock.json` 安装依赖”，不是“启动项目”；生产服务器不需要手工执行它。

## CI 和 CD 分别做什么

| 阶段 | 执行位置 | 会做什么 | 不会做什么 |
| --- | --- | --- | --- |
| CI（持续集成） | GitHub Actions 的 Ubuntu runner | `npm ci`、后端 PostgreSQL 测试、前端构建、Shell 检查、Compose 校验、镜像构建和登录冒烟测试 | 不连接生产数据库，不读取服务器 `.env` |
| 受控 CD（持续交付） | 你的 Ubuntu 生产服务器 | 备份数据库、快进拉取 `main`、构建镜像、替换容器、健康检查 | 不删除数据库 volume，不覆盖 `.env` 或 uploads |

`.github/workflows/ci.yml` 会在 push 或 Pull Request 指向 `main` 时运行。CI 使用临时测试密码，仓库不需要保存生产密码。

## 0. 第一次下载项目

通用写法：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 把 GitHub 远程仓库复制到本地
cd <仓库名>                                         # 进入项目目录
```

实际仓库示例：

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载真实仓库示例
cd PersonaLink_NoDB_20260828                                         # 进入该仓库目录
```

如果要继续执行本文 Docker 发布流程，必须使用含有 `.github/workflows/ci.yml` 和 Docker 文件的仓库，并确认 `git remote -v` 显示的是你要发布的仓库。

## 1. 在本地电脑修改代码

```bash
git switch main                              # 切换到 main 分支；main 通常代表可发布代码
git pull --ff-only                            # 只在没有分叉时同步远程 main，避免自动生成复杂合并提交
git switch -c feature/short-description      # 创建并切换到功能分支，名称用英文小写和短横线
```

修改后先检查：

```bash
git status                                    # 查看哪些文件被修改，不会改文件
git diff --check                              # 检查多余空格和换行问题
npm ci                                        # 按 package-lock.json 安装精确版本；首次开发或依赖变化后执行
npm run build                                 # 构建 Vue 前端；确认生产构建可以完成
npm test                                      # 运行后端测试；本地需配置可用 PostgreSQL，否则交给 CI
```

不要提交 `.env`、dump、真实照片、备份或密码。修改部署文档、API 契约或前端后，至少执行 `npm run build`。

## 2. 提交并推送

```bash
git add -A                                   # 把当前目录下所有变更放入暂存区
git status                                   # 再检查一次，确认没有敏感文件
git commit -m "feat: describe the change"   # 创建本地提交；说明要简短、清楚
git push -u origin feature/short-description # 首次推送该分支并建立远程跟踪关系
```

在 GitHub 打开 Pull Request，写清楚三件事：改了什么、怎么验证、界面是否变化。如果直接 push `main`，也会触发 CI，但仍要等待检查完成。

## 3. 确认 GitHub Actions 全部通过

进入仓库 **Actions → CI → 最新一次运行**，等待黄色运行状态变成绿色对勾，并确认以下步骤全部成功：

1. `Install dependencies`：执行 `npm ci`，安装锁定依赖。
2. `Run PostgreSQL backend tests`：运行后端测试。
3. `Build frontend`：构建 Vue 前端。
4. `Validate operational scripts`：检查 Shell 脚本语法和备份配置导出。
5. `Validate Compose model`：检查 Compose 配置能否解析。
6. `Build production images`：构建前后端生产镜像。
7. `Smoke test production stack`：启动容器并测试健康接口、管理员登录。

红色叉号表示不能上线。点开失败步骤，从第一条真正的 `error` 开始处理；本地修复后重新 push，不要在服务器绕过 CI。

## 4. 合并并发布到生产

Pull Request 合并到 `main` 后，再等待 `main` 的 CI 变绿。然后 SSH 登录生产服务器：

```bash
cd /srv/personalink                         # 进入固定生产目录；发布脚本会检查这个路径
sudo ./scripts/update-production.sh        # 执行备份、快进更新、构建、更新容器和健康检查
```

提示出现后输入大写 `DEPLOY` 才会继续。正常结尾类似：

```text
发布成功：旧提交SHA -> 新提交SHA
```

脚本内部顺序：

```text
检查服务器没有本地修改
  → PostgreSQL 小时备份
  → git fetch + fast-forward 拉取 main
  → Compose 配置校验
  → 先 build（旧容器继续运行）
  → up -d 替换容器
  → /health 健康检查
```

## 5. 上线后检查

```bash
curl -fsS https://你的域名/health  # 访问公开健康接口；失败时 curl 会返回错误码
echo                               # 换行，方便阅读 JSON
cd /srv/personalink                # 回到生产目录
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 查看容器和 healthy 状态
sudo docker compose -f compose.yaml -f compose.prod.yaml logs --tail=50 backend  # 查看后端最近 50 行日志
```

再用手机移动网络和浏览器无痕窗口测试登录、照片墙、搜索和管理员页面。

## 发布失败怎么办

### GitHub Actions 失败

不要执行生产发布。在本地修复代码、push，等新一次 CI 全绿。

### `git fetch` 或合并失败

```bash
cd /srv/personalink                 # 进入生产目录
sudo git status                     # 检查是否存在本地修改
sudo git ls-remote origin           # 测试远程仓库读取权限
sudo ssh -T github-personalink || true  # 测试 Deploy Key；GitHub 无 Shell，非 0 可能是正常提示
```

不要直接执行 `git reset --hard`。如果跟踪文件被修改，先确认是谁修改的、是否需要保留。

### Docker 构建失败

更新脚本在启动新容器前先 build，所以构建失败时旧站通常仍在运行。查看终端中最早出现的错误，修复后重新走 CI。

### 健康检查失败

```bash
cd /srv/personalink                 # 进入生产目录
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 查看哪个服务未 healthy
sudo docker compose -f compose.yaml -f compose.prod.yaml logs --tail=200 backend  # 查看后端日志
sudo docker compose -f compose.yaml -f compose.prod.yaml logs --tail=200 postgres  # 查看数据库日志
```

代码回退首选在本地对问题提交执行 `git revert`，push 后等 CI 变绿，再重新发布。如果包含数据库结构变更，不要擅自恢复旧 dump；恢复会覆盖上线后的新数据，先判断 migration 是否兼容。

## 为什么暂时不做全自动部署

全自动 CD 需要把服务器 IP 和 SSH 私钥放入 GitHub Secrets，并允许 GitHub runner 登录生产机。对当前单服务器规模，这会增加密钥、防火墙和误发布风险。以后有测试环境、多人开发或高频发布需求时，再增加 GitHub Environments 审批和 `workflow_dispatch` 手动部署工作流。

官方参考：[GitHub 管理和重跑 workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs) 和 [Docker Compose 生产环境](https://docs.docker.com/compose/how-tos/production/)。
