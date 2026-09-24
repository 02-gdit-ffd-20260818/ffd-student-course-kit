# 命令速查：从不会到会

这份速查表解释本文档里最常见的命令。所有命令默认在 Ubuntu 的终端中执行；代码行末的 `#` 后面是备注，不需要单独执行。

## 先记住 4 个概念

| 写法 | 含义 | 新手提示 |
| --- | --- | --- |
| `sudo` | 临时用管理员权限执行命令 | 看到密码提示时输入当前 Linux 用户密码，输入过程中不会显示字符 |
| `cd 目录` | 进入目录 | 本项目服务器目录是 `/srv/personalink`；忘记当前位置可运行 `pwd` |
| `./scripts/xxx.sh` | 执行当前项目里的脚本 | 如果提示没有权限，先运行 `sudo chmod +x scripts/*.sh` |
| `# 备注` | Shell 注释 | `#` 后面的文字只是说明，不会被执行 |

## 下载代码：clone 是什么意思

`git clone` 会把 GitHub 上的远程仓库完整复制到当前电脑；`cd` 会进入刚刚复制出来的文件夹。

通用写法：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 从 GitHub 下载仓库；把尖括号内容替换成真实值
cd <仓库名>                                         # 进入下载后的项目目录
```

你要求加入的实际仓库示例：

仓库页面：[https://github.com/Abner199/PersonaLink_NoDB_20260828](https://github.com/Abner199/PersonaLink_NoDB_20260828)

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载实际仓库
cd PersonaLink_NoDB_20260828                                         # 进入实际仓库目录
```

本 Docker 部署文档使用的是包含 `compose.yaml` 的 Docker 版本仓库：

```bash
sudo mkdir -p /srv                                      # 创建服务器项目父目录；目录已存在也不会报错
sudo git clone https://github.com/Abner199/PersonaLink20260821Docker.git /srv/personalink  # 下载 Docker 版到固定路径
cd /srv/personalink                                      # 进入生产项目目录
```

> `PersonaLink_NoDB_20260828` 是真实仓库示例；服务器部署必须选择包含本项目 `compose.yaml`、`docker/` 和 `scripts/` 的仓库。克隆后可运行 `ls` 检查这些文件是否存在。

## Node.js / npm 命令

| 命令 | 作用 | 什么时候执行 |
| --- | --- | --- |
| `npm ci` | 根据 `package-lock.json` 干净、准确地安装依赖；`ci` 是 Continuous Integration 的缩写 | 本地开发或 GitHub Actions；不要在生产服务器手工执行，本项目由 Docker 构建镜像时安装 |
| `npm run build` | 执行 `package.json` 中的 `build` 脚本，生成前端生产文件 | 修改 Vue、API 契约或依赖后，在本地验证 |
| `npm test` | 执行后端测试；本项目需要可连接的 PostgreSQL | 本地测试环境或 CI |
| `npm run dev:frontend` | 启动 Vite 前端开发服务器 | 本地开发，不用于生产 |
| `npm run dev:backend` | 以 watch 模式启动 Express 后端 | 本地开发，不用于生产 |

常用本地检查：

```bash
npm ci                 # 删除/重建 node_modules，并严格使用 package-lock.json 中锁定的版本
npm run build          # 构建 Vue 前端；成功通常会生成 frontend/dist/
npm test               # 运行后端测试；需要 DATABASE_URL 指向测试 PostgreSQL
```

## Git 命令

```bash
git status                              # 查看哪些文件被修改、添加或删除，不会修改文件
git diff --check                        # 检查空格、换行等常见提交问题
git add -A                              # 把当前目录下的所有变更放入下一次提交暂存区
git commit -m "feat: describe the change"  # 创建一个带说明的本地提交
git push -u origin main                 # 把当前分支首次推送到名为 origin 的远程仓库
```

服务器更新时常见的只读检查：

```bash
git remote -v              # 查看远程仓库地址
git branch --show-current  # 查看当前分支；生产脚本要求是 main
git log -1 --oneline       # 查看当前部署的最近一次提交
git ls-remote origin       # 测试服务器是否能读取远程仓库
```

## Docker Compose 命令

本项目生产环境始终同时加载两个 Compose 文件：基础配置 `compose.yaml` 加生产覆盖 `compose.prod.yaml`。为避免漏参数，下面的写法请整体复制。

```bash
docker compose -f compose.yaml -f compose.prod.yaml config --quiet  # 只校验配置，不启动容器
docker compose -f compose.yaml -f compose.prod.yaml up -d --build    # 必要时构建镜像，并在后台启动/更新服务
docker compose -f compose.yaml -f compose.prod.yaml ps               # 查看容器状态和健康状态
docker compose -f compose.yaml -f compose.prod.yaml logs --tail=100 backend  # 查看 backend 最近 100 行日志
docker compose -f compose.yaml -f compose.prod.yaml stop frontend backend  # 暂停前后端写入；不删除数据
docker compose -f compose.yaml -f compose.prod.yaml down             # 停止并删除容器、网络；默认保留 volume
docker compose -f compose.yaml -f compose.prod.yaml down --volumes   # 连同 volume 一起删除；只允许清理新服务器的空库
```

最容易误解的参数：

- `-f`：指定 Compose 文件；重复两次表示叠加配置。
- `up`：创建并启动服务；`-d` 表示后台运行；`--build` 表示先重新构建镜像。
- `ps`：列出服务状态；`healthy` 表示健康检查通过。
- `logs -f`：持续跟踪日志；按 `Ctrl+C` 退出查看，不会停止容器。
- `down --volumes`：会删除数据库 volume，可能造成数据丢失，除非文档明确说明，否则不要执行。

## Shell 中的特殊写法

```bash
command1 && command2  # 只有 command1 成功（退出码为 0）才执行 command2
command || true       # 即使命令返回非 0，也让这段脚本继续；本项目只用于 GitHub SSH 测试
echo "$NAME"          # 读取变量 NAME；双引号可以保护空格和特殊字符
echo "$(command)"     # 先执行括号里的命令，再把输出放到 echo 中
```

如果一条命令太长，行末的 `\` 表示“下一行还是同一条命令”；反斜杠必须是该行最后一个字符，后面不要留空格。

## 安全提醒

- `.env`、`/etc/personalink/backup.env`、数据库 dump、上传照片和备份都属于敏感数据，不能提交 Git 或发到聊天群。
- 修改生产数据前先执行备份；`restore.sh` 会覆盖当前数据库，必须明确输入 `--yes` 才会执行。
- 不确定命令是否会删除数据时，先停下来查看本速查表和对应 runbook，不要尝试 `git reset --hard` 或 `docker compose down --volumes`。
