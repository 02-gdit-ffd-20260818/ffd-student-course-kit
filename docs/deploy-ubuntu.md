# Ubuntu 私有仓库零基础部署教程

本教程把一台全新的 Ubuntu 22.04/24.04 LTS 服务器部署成 PersonaLink 生产站点。你不需要在服务器安装 Node.js、npm 或 PostgreSQL；Node/npm 依赖会在 Docker 构建镜像时安装，PostgreSQL 会作为 Docker 服务运行。

## 先看懂部署结果

```text
用户 → 域名/HTTPS → 宿主机 Nginx:80/443 → 127.0.0.1:3100 → frontend → backend → PostgreSQL
```

- 对外只开放 SSH `22`、HTTP `80`、HTTPS `443`；不要把 `3100`、`3003`、`5432` 开到公网。
- 项目固定放在 `/srv/personalink`，因为生产更新脚本会检查这个路径。
- `.env` 是生产密码配置，只放在服务器；`.env.example` 只是无密码模板。
- 下文代码块中 `#` 后面都是命令备注，可以连同命令一起复制。

## 0. 下载仓库：通用操作与实际仓库

如果你只是想学习 GitHub 下载项目，通用写法是：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 把远程仓库复制到当前目录
cd <仓库名>                                         # 进入下载后的目录
```

按你的要求加入的真实仓库示例：

仓库页面：[PersonaLink_NoDB_20260828](https://github.com/Abner199/PersonaLink_NoDB_20260828)

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载实际仓库
cd PersonaLink_NoDB_20260828                                         # 进入实际仓库目录
```

上面的仓库用于演示真实 clone 操作。要按本教程部署 Docker 版，必须克隆包含 `compose.yaml`、`docker/` 和 `scripts/` 的 Docker 仓库；当前 Docker 版地址是：

```text
https://github.com/Abner199/PersonaLink20260821Docker.git
```

## 1. 开始前准备

在云厂商控制台准备一台 Ubuntu 22.04 或 24.04 LTS 服务器，并完成以下事项：

1. 准备域名，把 DNS 的 A 记录指向服务器公网 IP。
2. 安全组只放行 `22`、`80`、`443`。
3. 准备一个 GitHub 账号，并确认你有权读取私有仓库。
4. 准备一个用于接收 Certbot 证书通知的真实邮箱。

第一次登录服务器后执行：

```bash
sudo apt update                                      # 刷新 Ubuntu 软件包索引，不会安装软件
sudo apt install -y ca-certificates curl git nginx openssl  # 安装证书、网络、Git、Nginx 和密钥工具
sudo timedatectl set-timezone Asia/Shanghai          # 设置系统时区，便于看日志和备份时间
sudo systemctl enable --now nginx                    # 立即启动 Nginx，并设置为开机自动启动
```

## 2. 安装 Docker Engine 和 Compose

下面命令使用 Docker 官方软件源。每行后面的说明解释了它的用途；`EOF` 必须单独占一行。

```bash
sudo install -m 0755 -d /etc/apt/keyrings  # 创建存放软件源签名密钥的目录
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc  # 下载 Docker 软件源公钥
sudo chmod a+r /etc/apt/keyrings/docker.asc  # 允许 apt 读取公钥

sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF  # 写入 Docker 官方 apt 软件源配置
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update  # 让 apt 读取刚加入的 Docker 软件源
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin  # 安装 Docker 引擎、构建器和 Compose 插件
sudo systemctl enable --now docker  # 启动 Docker，并设置为开机自动启动
sudo docker run --rm hello-world  # 下载并运行一次测试容器；--rm 表示测试结束后删除它
sudo docker compose version  # 确认 Docker Compose 插件已安装
```

如果 `download.docker.com` 超时，先检查服务器网络或云厂商提供的合规镜像加速，不要执行来源不明的一键安装脚本。

## 3. 私有仓库配置只读 Deploy Key

如果仓库是公开的，可以跳到第 4 步。如果仓库是私有的，推荐使用只读 Deploy Key，而不是把 GitHub 密码或 Personal Access Token 写进脚本。

在服务器生成一把只属于这台服务器的密钥：

```bash
sudo install -d -m 700 /root/.ssh  # 创建 root 的 SSH 配置目录，并限制其他用户访问
sudo ssh-keygen -t ed25519 -C "personalink-deploy" -f /root/.ssh/personalink_deploy -N ""  # 生成无口令密钥；服务器只能读取这把 key
sudo cat /root/.ssh/personalink_deploy.pub  # 显示公钥；复制整行，不要复制私钥
```

在 GitHub 仓库打开 **Settings → Deploy keys → Add deploy key**，粘贴公钥，并确保不勾选 **Allow write access**。然后回服务器配置 SSH 443 端口：

```bash
sudo tee /root/.ssh/config >/dev/null <<'EOF'  # 写入 GitHub SSH 别名配置
Host github-personalink
    HostName ssh.github.com
    Port 443
    User git
    IdentityFile /root/.ssh/personalink_deploy
    IdentitiesOnly yes
EOF

sudo chmod 600 /root/.ssh/config  # 只允许 root 读写 SSH 配置
sudo ssh-keyscan -p 443 ssh.github.com | sudo tee -a /root/.ssh/known_hosts >/dev/null  # 保存 GitHub 主机指纹，避免首次连接卡住
sudo chmod 600 /root/.ssh/known_hosts  # 限制主机指纹文件权限
sudo ssh -T github-personalink || true  # 测试连接；GitHub 不提供 Shell，成功时也可能返回非 0
```

看到 `successfully authenticated` 或类似认证成功提示即可。`|| true` 只用于这一次测试，不要随便加到真正的发布命令后面。

## 4. 克隆 Docker 版代码

```bash
sudo mkdir -p /srv  # 创建项目父目录；-p 表示目录已存在时不报错
sudo git clone git@github-personalink:Abner199/PersonaLink20260821Docker.git /srv/personalink  # 通过只读 Deploy Key 下载 Docker 版
cd /srv/personalink  # 进入固定生产目录
sudo chmod +x scripts/*.sh  # 给运维脚本增加可执行权限
sudo git remote -v  # 查看远程地址，确认没有克隆错仓库
sudo git status --short  # 确认刚克隆的工作区没有本地修改
```

如果你使用的是公开仓库，也可以将 clone 命令替换为：

```bash
sudo git clone https://github.com/Abner199/PersonaLink20260821Docker.git /srv/personalink  # 通过 HTTPS 下载 Docker 版
```

克隆后应能看到 `compose.yaml`、`compose.prod.yaml`、`docker/`、`backend/`、`frontend/` 和 `scripts/`。看不到这些文件时先停下，不要继续配置服务器。

## 5. 创建生产环境配置

`.env.example` 是模板，`.env` 才是服务实际读取的配置。下面先生成随机密码，再把模板中的占位符替换掉：

```bash
cd /srv/personalink  # 确保后续命令在项目根目录执行
sudo cp .env.example .env  # 复制生产配置模板；不会修改 GitHub 上的文件

PERSONALINK_DB_PASSWORD="$(openssl rand -hex 24)"  # 生成 PostgreSQL 密码
PERSONALINK_JWT_SECRET="$(openssl rand -hex 32)"  # 生成 JWT 签名密钥
PERSONALINK_ADMIN_PASSWORD="$(openssl rand -hex 24)"  # 生成首次管理员密码

sudo sed -i "s|replace-with-a-long-random-password|${PERSONALINK_DB_PASSWORD}|" .env  # 写入数据库密码
sudo sed -i "s|replace-with-at-least-32-random-characters|${PERSONALINK_JWT_SECRET}|" .env  # 写入 JWT 密钥
sudo sed -i "s|replace-before-the-first-start|${PERSONALINK_ADMIN_PASSWORD}|" .env  # 写入首次管理员密码
printf '\n首次管理员密码（请立即保存）：%s\n\n' "$PERSONALINK_ADMIN_PASSWORD"  # 只在当前终端显示一次密码
sudo nano .env  # 检查 CORS_ORIGINS，改成真实 HTTPS 域名，例如 https://app.example.com
sudo chmod 600 .env  # 只允许 root 读写生产配置
```

重点检查：

- `POSTGRES_PASSWORD`、`JWT_SECRET` 和 `ADMIN_INITIAL_PASSWORD` 不要保留 `replace-with-...` 占位符。
- `CORS_ORIGINS` 写完整的前端地址，例如 `https://app.example.com`，不要加末尾斜杠。
- `.env` 不要提交 Git、截图或发送给其他人。

## 6. 启动服务并做第一次健康检查

```bash
cd /srv/personalink  # 进入项目目录
sudo mkdir -p data/uploads logs backups  # 创建宿主机持久化目录
sudo chown -R 1000:1000 data/uploads logs  # 允许非 root 的后端容器写入上传文件和日志
sudo docker compose -f compose.yaml -f compose.prod.yaml config --quiet  # 校验两份 Compose 配置，不启动服务
sudo docker compose -f compose.yaml -f compose.prod.yaml up -d --build  # 构建镜像并在后台启动三个服务
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 查看 postgres、backend、frontend 状态
sudo ./scripts/health-check.sh  # 轮询 /health，确认前端到数据库的链路正常
```

`postgres` 和 `backend` 应显示 `healthy`，健康检查应成功返回 `status: ok`。首次启动会执行数据库迁移并创建 `admin@system.com`；不会扫描或导入 SQLite 文件。

## 7. 配置宿主机 Nginx

先让域名的 DNS A 记录生效，再配置 Nginx。以下命令只禁用 Ubuntu 默认欢迎页，不会删除其他具名站点：

```bash
cd /srv/personalink  # 进入项目目录
read -rp "请输入域名（例如 app.example.com）: " PERSONALINK_DOMAIN  # 读取用户输入的域名
PERSONALINK_DOMAIN="${PERSONALINK_DOMAIN#http://}"  # 去掉误输入的 http://
PERSONALINK_DOMAIN="${PERSONALINK_DOMAIN#https://}"  # 去掉误输入的 https://
PERSONALINK_DOMAIN="${PERSONALINK_DOMAIN%%/*}"  # 去掉路径和末尾斜杠
printf '将使用域名：%s\n' "$PERSONALINK_DOMAIN"  # 回显最终域名，先检查是否正确
sudo cp infrastructure/nginx/personalink.conf.example /etc/nginx/sites-available/personalink  # 复制 Nginx 示例配置
sudo sed -i "s/app\.example\.com/${PERSONALINK_DOMAIN}/g" /etc/nginx/sites-available/personalink  # 替换 server_name
sudo ln -sfn /etc/nginx/sites-available/personalink /etc/nginx/sites-enabled/personalink  # 启用该站点配置
sudo rm -f /etc/nginx/sites-enabled/default  # 禁用默认欢迎页；不会删除其他自定义站点文件
sudo nginx -t  # 检查 Nginx 语法；失败时不要 reload
sudo systemctl reload nginx  # 不停止服务地重新加载配置
curl -I http://127.0.0.1:3100  # 从服务器本机测试前端容器端口
curl -fsS -H "Host: ${PERSONALINK_DOMAIN}" http://127.0.0.1/health  # 通过 Nginx 测试 /health
echo  # 换行，让 JSON 输出更易读
```

最后一条命令应返回包含 `"status":"ok"` 的 JSON。如果出现 `Welcome to nginx`，先检查 `server_name` 和默认站点是否仍启用。

## 8. 申请 HTTPS 证书

确认域名已经解析到这台服务器后执行：

```bash
read -rp "请再次输入已解析的域名: " PERSONALINK_DOMAIN  # 读取域名，不要输入 http:// 或路径
PERSONALINK_DOMAIN="${PERSONALINK_DOMAIN#http://}"  # 清理协议前缀
PERSONALINK_DOMAIN="${PERSONALINK_DOMAIN#https://}"  # 清理 HTTPS 前缀
PERSONALINK_DOMAIN="${PERSONALINK_DOMAIN%%/*}"  # 清理路径
sudo apt install -y certbot python3-certbot-nginx  # 安装证书申请工具和 Nginx 插件
sudo certbot --nginx -d "$PERSONALINK_DOMAIN"  # 申请证书并自动写入 Nginx HTTPS 配置
sudo nginx -t  # 检查证书配置后的 Nginx 语法
sudo systemctl reload nginx  # 重新加载 HTTPS 配置
sudo certbot certificates  # 查看证书，状态应为 VALID
curl -fsS "https://${PERSONALINK_DOMAIN}/health"  # 验证 HTTPS 访问健康接口
echo  # 换行
sudo certbot renew --dry-run  # 模拟续期，确认未来能自动续期
```

Certbot 会要求输入有效邮箱并接受条款。`-d` 后只写域名，例如 `peaceinside.fun`，不能写 `http://peaceinside.fun/`。

## 9. 配置自动备份

备份配置单独放在 `/etc/personalink/backup.env`，并使用与业务 `.env` 不同的加密密码：

```bash
cd /srv/personalink  # 进入项目目录
sudo mkdir -p /etc/personalink  # 创建备份配置目录
sudo cp .backup.env.example /etc/personalink/backup.env  # 复制备份配置模板
PERSONALINK_BACKUP_PASSWORD="$(openssl rand -hex 32)"  # 生成异地备份加密密码
sudo sed -i "s|replace-with-a-different-long-random-password|${PERSONALINK_BACKUP_PASSWORD}|" /etc/personalink/backup.env  # 写入加密密码
printf '\n备份解密密码（请在服务器之外保存）：%s\n\n' "$PERSONALINK_BACKUP_PASSWORD"  # 显示密码，保存到密码管理器
sudo chmod 600 /etc/personalink/backup.env  # 只允许 root 读写备份配置
sudo ./scripts/backup-db.sh  # 立即测试 PostgreSQL 小时备份
sudo ./scripts/backup-all.sh  # 测试数据库、上传文件、日志和加密异地备份
sudo ./scripts/install-systemd-timers.sh  # 安装并启用小时/每日定时任务
sudo systemctl start personalink-backup-daily.service  # 手动触发一次每日备份服务
sudo systemctl status personalink-backup-daily.service --no-pager -l  # 查看服务结果，期望 status=0/SUCCESS
```

备份密码必须在服务器之外再保存一份；丢失密码就无法解密异地备份。备份存在不代表一定可恢复，请按 [备份、异地副本与恢复](backup-restore.md) 每月做一次演练。

## 10. 首次登录后修改管理员密码

```bash
cd /srv/personalink  # 进入项目目录
sudo grep '^ADMIN_INITIAL_PASSWORD=' .env  # 首次登录前查看密码；不要截图或发送给别人
sudo ./scripts/change-admin-password.sh  # 交互输入两次新密码，输入时屏幕不显示字符
```

管理员邮箱是 `admin@system.com`。新密码至少 12 位；脚本成功后会删除一次性 `ADMIN_INITIAL_PASSWORD`，不会影响数据库中已经保存的 bcrypt 密码。

## 11. 以后如何更新项目

开发电脑完成修改后先 push，等待 GitHub Actions 全部变绿，再登录生产服务器执行：

```bash
cd /srv/personalink  # 进入生产目录
sudo ./scripts/update-production.sh  # 备份、快进拉取 main、构建镜像、更新容器并做健康检查
```

脚本提示时输入大写 `DEPLOY` 才会继续。不要在生产服务器手工执行 `npm ci` 或替换单个 Vue 文件；Docker 镜像构建会自动安装锁定的依赖。

## 12. 常用排错命令

```bash
cd /srv/personalink  # 进入项目目录
sudo git status  # 查看服务器仓库是否有本地修改
sudo git ls-remote origin  # 验证远程仓库读取权限
sudo ssh -vT github-personalink || true  # 输出 GitHub SSH 443 的详细连接信息
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 查看服务状态和健康状态
sudo docker compose -f compose.yaml -f compose.prod.yaml logs --tail=200 backend  # 查看后端最近 200 行日志
sudo docker compose -f compose.yaml -f compose.prod.yaml logs --tail=200 postgres  # 查看数据库最近 200 行日志
sudo nginx -t  # 检查 Nginx 配置语法
sudo journalctl -u nginx -n 100 --no-pager  # 查看 Nginx 最近 100 行系统日志
```

| 现象 | 常见原因 | 处理方式 |
| --- | --- | --- |
| `not a FQDN` | 输入了 `http://域名/` | 只输入域名；本文清理命令也会去掉协议和路径 |
| `Welcome to nginx` | 默认站点接管请求 | 检查 `server_name`，禁用 `sites-enabled/default`，再 `nginx -t` 和 reload |
| `better-sqlite3` 或 `node-gyp` 下载失败 | 在服务器执行了旧版裸机安装流程 | 本 Docker 版不要求服务器安装 Node/npm，重新按本文构建镜像 |
| `git` 连接 GitHub 超时 | 跨境链路或 SSH 端口不稳定 | 使用只读 Deploy Key 和 `ssh.github.com:443`，再运行 `git ls-remote origin` |
| `Permission denied` | 脚本没有执行权限或目录属主不对 | 执行 `sudo chmod +x scripts/*.sh`，并确认 `data/uploads`、`logs` 属主为 `1000:1000` |
| `No environment variable BACKUP_ENCRYPTION_PASSWORD` | 备份配置未安装或未被脚本读取 | 检查 `/etc/personalink/backup.env` 是否存在且权限为 600 |

## 完成标准

以下项目全部满足，才算部署完成：

- `docker compose ... ps` 中服务持续运行，`postgres` 和 `backend` 为 `healthy`。
- `https://你的域名/health` 返回 `status: ok`。
- 管理员可以登录，且已经修改初始密码。
- `backup-all.sh` 手工成功，systemd timer 已启用。
- GitHub、服务器和聊天记录中都没有 `.env`、备份密码或真实用户数据。

官方参考：[Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)、[Docker Compose 生产环境](https://docs.docker.com/compose/how-tos/production/)、[GitHub Deploy Key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)。
