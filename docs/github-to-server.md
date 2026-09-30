# 从 GitHub 到 Ubuntu 服务器：零基础部署教程

本文以 Ubuntu 22.04/24.04、Nginx 和 systemd 为例。完成后，Nginx 提供前端页面，Node.js 后端监听 `127.0.0.1:3003`，SQLite 数据保存在服务器本地。

## 一、部署前需要准备什么

- 一台可通过 SSH 登录的 Ubuntu 服务器。
- 服务器公网 IP；如使用域名，请提前将域名解析到该 IP。
- GitHub 仓库：`https://github.com/Abner199/PersonaLink20260821`。
- 云厂商安全组至少放行 TCP 端口 `22` 和 `80`；启用 HTTPS 时还需放行 `443`。

下面命令均在服务器 SSH 终端中执行。命令前的 `$` 不需要输入。

## 二、连接服务器并安装基础软件

Windows 可在 PowerShell 中连接：

```bash
ssh ubuntu@你的服务器IP
```

用户名可能是 `ubuntu`、`root` 或云厂商提供的其他名称。登录后安装 Git、curl、Nginx 和原生模块编译工具：

```bash
sudo apt update
sudo apt install -y git curl nginx build-essential python3
git --version
nginx -v
```

`build-essential` 和 `python3` 用于在预编译包下载失败时编译 SQLite 原生依赖；使用 `root` 登录时，命令中的 `sudo` 可以保留，也可以省略。

## 三、安装 Node.js 22

使用 nvm 安装 Node.js，避免污染系统包。中国大陆服务器建议强制使用脚本模式，绕过 nvm 安装器默认执行的 `git clone`：

```bash
curl --fail --retry 5 -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | METHOD=script bash
source ~/.bashrc
command -v nvm

export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
nvm install 22
nvm alias default 22
node --version
npm --version
```

`command -v nvm` 应输出 `nvm`，`node --version` 应以 `v22` 开头。`METHOD=script` 仍从 nvm 官方仓库下载固定版本文件，但不再克隆 Git 仓库；`NVM_NODEJS_ORG_MIRROR` 只影响 Node.js 安装包的下载地址。

你遇到的 `GnuTLS recv error (-110)` 表示服务器到 GitHub 的 TLS 连接在 `git clone` 期间被中断，不是项目或 Node.js 报错。前一次失败留下的 `~/.nvm` 空目录通常无需删除，上面的脚本模式可直接补全文件。

如果 `command -v nvm` 仍无输出，手动加载后再检查：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
command -v nvm
```

不要直接执行提示中的 `apt install nodejs`：Ubuntu 默认软件源提供的版本可能不满足本项目要求的 Node.js 22。

## 四、从 GitHub 克隆项目

创建部署目录，并把目录所有权交给当前登录用户：

```bash
sudo mkdir -p /var/www/personalink
sudo chown -R "$USER":"$USER" /var/www/personalink
git clone https://github.com/Abner199/PersonaLink20260821.git /var/www/personalink
cd /var/www/personalink
```

若克隆项目时也出现相同 TLS 错误，先改用 HTTP/1.1 和浅克隆重试：

```bash
git -c http.version=HTTP/1.1 clone --depth 1 https://github.com/Abner199/PersonaLink20260821.git /var/www/personalink
```

不要随意使用来源不明的 GitHub 代理或关闭 SSL 校验。持续失败通常是服务器到 GitHub 的线路问题，可稍后重试或更换服务器公网出口。

检查目录：

```bash
ls
```

应该看到 `frontend`、`backend`、`docs`、`infrastructure` 和 `package.json`。

## 五、安装、测试和构建

仓库使用 npm workspaces，只需安装一次依赖：

```bash
cd /var/www/personalink
npm config set registry https://registry.npmmirror.com
export npm_package_config_node_gyp_nodedir="$(dirname "$(dirname "$(command -v node)")")"
npm ci && npm test && npm run build
```

第一条命令为 npm 配置国内镜像；如服务器能稳定访问 npm 官方仓库，可以省略。第二条让 `node-gyp` 使用 nvm 已安装在本机的 Node.js 头文件，避免编译 SQLite 依赖时再次访问 `nodejs.org`。`&&` 表示上一条成功后才继续，避免依赖安装失败后产生连锁报错。正常结果：测试显示 `pass 1`，构建结束显示 `built`，并生成 `frontend/dist`。

## 六、配置并初始化 SQLite

复制环境变量模板：

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

保留或修改为：

```dotenv
PORT=3003
NODE_ENV=production
DATABASE_PATH=data/persona-link.sqlite
```

保存 nano：按 `Ctrl+O`、回车，再按 `Ctrl+X`。初始化并检查数据库：

```bash
npm run db:status
```

首次运行会从脱敏的 `backend/data/seed.json` 创建 SQLite。数据库文件不会提交到 GitHub。演示账户：

- 管理员：`admin@system.com` / `admin123`
- 普通用户：`demo@example.com` / `demo123`

这些是公开演示密码。当前项目适合学习、内网或受控演示；正式面向公网前，应重做认证与密码哈希，并限制后台访问。

## 七、先手动验证后端

```bash
npm start
```

看到 `Server is running on http://localhost:3003` 后，另开一个 SSH 窗口测试：

```bash
curl http://127.0.0.1:3003/
curl http://127.0.0.1:3003/api/classes
```

返回 JSON 即表示正常。回到第一个窗口按 `Ctrl+C` 停止，下一步交给 systemd 常驻运行。

## 八、配置 systemd 开机自启

先确认用户名和主目录：

```bash
whoami
echo "$HOME"
```

复制模板：

```bash
sudo cp infrastructure/systemd/personalink.service.example /etc/systemd/system/personalink.service
sudo nano /etc/systemd/system/personalink.service
```

把模板中的 `ubuntu` 和 `/home/ubuntu` 全部改成上一步的实际结果。例如当前提示符是 `root@...`，通常应使用 `User=root`、`Group=root`、`Environment=HOME=/root`，并把 `ExecStart` 中的路径改为 `/root/.nvm/nvm.sh`。然后启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now personalink
sudo systemctl status personalink
```

按 `q` 退出状态页。实时查看日志：

```bash
sudo journalctl -u personalink -f
```

## 九、配置 Nginx

复制仓库内配置：

```bash
sudo cp infrastructure/nginx/nginx.conf /etc/nginx/sites-available/personalink
sudo nano /etc/nginx/sites-available/personalink
```

如果只有 IP，将 `server_name your-domain.com;` 改为：

```nginx
server_name _;
```

如果有域名，则替换为实际域名。确认静态目录为：

```nginx
root /var/www/personalink/frontend/dist;
```

启用站点并检查配置：

```bash
sudo ln -s /etc/nginx/sites-available/personalink /etc/nginx/sites-enabled/personalink
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

只有当 `nginx -t` 显示 successful 才执行 reload。浏览器访问 `http://服务器IP`。

## 十、防火墙

若启用了 UFW：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status
```

不需要向公网开放 3003；Nginx 会在服务器内部代理 `/api`。

## 十一、以后如何更新

每次 GitHub 有新提交，在服务器执行：

```bash
cd /var/www/personalink
git pull --ff-only
NODE_ROOT="$(dirname "$(dirname "$(command -v node)")")"
export npm_package_config_node_gyp_nodedir="$NODE_ROOT"
npm ci && npm test && npm run build
sudo systemctl restart personalink
sudo systemctl reload nginx
```

如果确认本次只修改前端页面或样式，且 `package-lock.json` 没有变化，可以在拉取后只执行：

```bash
npm run build
sudo systemctl reload nginx
```

不需要重新安装依赖或重启后端。若 `git pull` 提示本地有修改，先运行 `git status`，不要直接使用强制覆盖命令。

### 中国大陆服务器 git pull 卡住时怎么办

阿里云到 `github.com` 和 `raw.githubusercontent.com` 的连接可能间歇性超时：同一台服务器可能刚刚克隆成功，稍后却卡在 `git pull`，过一段时间又恢复。这类 `Failed to connect ... port 443`、`GnuTLS recv error` 或长时间没有输出属于网络线路问题，不是仓库损坏。

先按 `Ctrl+C` 停止卡住的命令，再使用 HTTP/1.1 限时重试（整行执行）：

```bash
timeout 60 git -c http.version=HTTP/1.1 -c http.lowSpeedLimit=1 -c http.lowSpeedTime=30 pull --ff-only
```

如果只是急需部署一个已知的前端文件，可以使用 raw 地址应急更新。以下为手机端照片墙入口修复的实际示例：

```bash
cd /var/www/personalink
cp frontend/src/views/Home.vue /tmp/Home.vue.before-update
curl --fail --location --retry 5 --connect-timeout 10 --max-time 120 https://raw.githubusercontent.com/Abner199/PersonaLink20260821/main/frontend/src/views/Home.vue -o /tmp/personalink-Home.vue
grep -n "function-card" /tmp/personalink-Home.vue
cp /tmp/personalink-Home.vue frontend/src/views/Home.vue
npm run build
sudo systemctl reload nginx
```

只有 `curl` 成功且 `grep` 显示预期内容后才执行覆盖。`curl` 可能在前几次重试中保持 `0 bytes`，随后恢复；等待时间过长时可以按 `Ctrl+C`，稍后重试。该流程只替换前端源文件和构建产物，不会改动 `backend/data/persona-link.sqlite`、`backend/.env` 或 Nginx 系统配置。

单文件下载只是应急方案，不适用于依赖变更、数据库迁移或多文件后端更新。它还会让 `git status` 暂时显示该文件被修改。GitHub 网络恢复后，先保留备份，再恢复仓库版本并正常拉取：

```bash
cp frontend/src/views/Home.vue /tmp/Home.vue.emergency-backup
git restore frontend/src/views/Home.vue
git pull --ff-only
npm run build
sudo systemctl reload nginx
```

如果正常拉取后的页面与应急版本不一致，可用 `/tmp/Home.vue.emergency-backup` 对比，不要使用 `git reset --hard`。

## 十二、备份与恢复 SQLite

更新前建议备份：

```bash
sudo systemctl stop personalink
cp backend/data/persona-link.sqlite backend/data/persona-link.sqlite.backup
sudo systemctl start personalink
```

恢复时停止服务，把 `.backup` 复制回原文件名，再启动服务。不要在服务写入数据库时直接覆盖 SQLite。

## 十三、常见故障

### nginx -t 提示 invalid value "must-revalidate"

旧版配置曾把不受支持的 `must-revalidate` 写入 `gzip_proxied`。拉取最新代码并重新复制配置：

```bash
cd /var/www/personalink
git pull --ff-only
sudo cp infrastructure/nginx/nginx.conf /etc/nginx/sites-available/personalink
sudo nginx -t && sudo systemctl restart nginx
```

若已经在服务器配置中填写了域名，请不要直接覆盖，改为编辑 `/etc/nginx/sites-available/personalink`，从 `gzip_proxied` 一行中只删除 `must-revalidate`。Nginx 官方允许的对应参数为 `expired no-cache no-store private auth`。

### 安装 nvm 时出现 GnuTLS recv error (-110)

这表示 nvm 的默认 Git 克隆失败。回到“安装 Node.js 22”一节，执行带有 `METHOD=script` 的完整命令，不要继续执行尚未安装的 `nvm`、`node` 或 `npm` 命令。

如果下载 Node.js 本体缓慢，确认当前终端已设置镜像：

```bash
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
nvm install 22
```

### npm ci 下载 Node.js headers 时出现 ETIMEDOUT

如果错误路径是 `better-sqlite3`，并包含 `node-gyp`、`node-v...-headers.tar.gz` 和 `ETIMEDOUT`，说明 npm 包已经下载，但编译原生 SQLite 模块时无法从 `nodejs.org` 下载头文件。Python 和编译器通常没有问题。

nvm 安装的 Node.js 已包含对应头文件，可直接使用本机副本：

```bash
cd /var/www/personalink
sudo apt install -y build-essential python3

NODE_ROOT="$(dirname "$(dirname "$(command -v node)")")"
test -f "$NODE_ROOT/include/node/node.h" && echo "Node.js 本地头文件存在"
export npm_package_config_node_gyp_nodedir="$NODE_ROOT"

npm ci && npm test && npm run build
```

`npm ci` 会重新创建依赖目录，不需要继续使用上一次未完成的安装。若第一条命令失败，`npm test` 和 `npm run build` 不会执行。不要用 `NODE_TLS_REJECT_UNAUTHORIZED=0` 关闭 TLS 校验。

### 页面显示 502 Bad Gateway

```bash
sudo systemctl status personalink
sudo journalctl -u personalink -n 100 --no-pager
curl http://127.0.0.1:3003/
```

通常是后端未启动、Node 路径不正确或 3003 端口被占用。

### 页面刷新后 404

检查 Nginx 的 `location /` 中是否保留：

```nginx
try_files $uri $uri/ /index.html;
```

### 修改前端后页面没有变化

```bash
npm run build
sudo systemctl reload nginx
```

然后用浏览器强制刷新（Windows：`Ctrl+F5`）。

### 查看端口

```bash
sudo ss -lntp | grep -E ':80|:3003'
```

## 参考资料

- [GitHub：克隆仓库](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
- [nvm 官方安装说明](https://github.com/nvm-sh/nvm)
- [Node.js 22 官方下载归档](https://nodejs.org/en/download/archive/v22)
- [npmmirror 镜像站](https://npmmirror.com/)
- [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)
