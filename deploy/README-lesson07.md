# 第07课上线体验：阿里云 Ubuntu 为主

目标：把**自己完成四项任务的代码**放到服务器，别人能打开网页、注册并登录，服务重启后账号仍在。
这不是把前端截图放到静态站点，也不是部署包含未完成权限任务的开发服务器。

## 0. 先分清两台电脑和三个位置

|标记|在哪里操作|本课路径|
|---|---|---|
|本机终端|你的 Windows CMD / PowerShell，当前在 lesson07 工程根目录|能看到 package.json、server、scripts|
|服务器终端|通过 ssh 登录的阿里云 Ubuntu|程序 /srv/ffd-lesson07/app；数据 /srv/ffd-lesson07/data|
|浏览器|自己的电脑或手机|教师提供的 HTTPS 域名；临时 IP 测试仅用一次性假账号|

本课默认选**前端、后端都放同一台 Ubuntu**：浏览器 → Nginx（80/443）→ 本机 3000 → SQLite 文件。
不用额外开数据库端口，不把 Node 的 3000 端口直接暴露到公网。两个可选前端托管分支见第 6 节。

**教师开课前准备**：一台独立课堂 ECS（Ubuntu 22.04/24.04），学生可 SSH 的账号与 sudo 权限；系统级 Node 24.x 和 npm；一个指向 ECS 的域名及 HTTPS 配置。不要使用有其他业务的服务器照抄本教程。
Node 安装文件和校验文件从 [Node 24 官方下载页](https://nodejs.org/en/download/archive/v24) 获取；应安装到 /usr/bin 或 /usr/local/bin 等系统可读位置，而不是某个人的 nvm 主目录。

在阿里云控制台 → ECS 实例 → 安全组 → 入方向，核对 TCP 22（只允许自己的管理 IP）、80/443（课堂访问范围）。**不要放通 3000、3306、5432**。公网 IP 来自实例详情，不是 127.0.0.1。
参考：[阿里云安全组说明](https://help.aliyun.com/zh/ecs/user-guide/security-group-rules)。服务器若启用 UFW，也需允许同样的访问；不要为排错关闭整个防火墙。

## 1. 本机：完成任务并打包已提交代码

CMD / PowerShell 都在本课根目录执行：

```bat
node scripts/check-lesson07.mjs 4
npm run build
git status
git ls-files .env
```

第一条必须 PASS；第二条生成 dist；第三条确认任务改动已按手册提交；第四条**必须无输出**（真实 .env 不能在 Git 中）。未提交时先完成手册“Git 提交”节，否则下面打包的是旧代码。

```bat
git archive --format=tar.gz --output=../lesson07-src.tar.gz HEAD
scp ../lesson07-src.tar.gz ubuntu@你的服务器公网IP:/tmp/lesson07-src.tar.gz
ssh ubuntu@你的服务器公网IP
```

archive 只导出 HEAD 这个已提交版本；--format 是压缩格式，--output 是输出文件。文件放在工程外，避免再次提交进项目。
scp 把本机文件复制到远程；冒号前是 SSH 地址，冒号后是远程路径。ssh 打开远程终端。把 ubuntu 换成教师实际提供的用户名，把“你的服务器公网IP”换成数字地址；不要把这些中文原样输入。
第一次连接时向教师核对主机指纹，不凭提示直接接受未知主机。若用密钥登录，由教师给出 `-i 密钥文件路径`，密钥文件不上传到仓库。

## 2. Ubuntu：安装到本课独立目录

以下全部在 **SSH 的 Ubuntu 终端** 输入，不在 Windows 输入：

```bash
node -v
command -v node
npm -v
sudo apt update
sudo apt install -y nginx
id ffdlesson07 || sudo useradd --system --home /srv/ffd-lesson07 --shell /usr/sbin/nologin ffdlesson07
sudo install -d -m 755 /srv/ffd-lesson07/app
sudo install -d -o ffdlesson07 -g ffdlesson07 -m 700 /srv/ffd-lesson07/data
sudo tar -xzf /tmp/lesson07-src.tar.gz -C /srv/ffd-lesson07/app
cd /srv/ffd-lesson07/app
sudo npm ci
sudo npm run build
```

node -v 必须是 v24.x；command -v 显示可执行文件位置。Node 不合要求就请教师先完成环境准备，不要靠安装项目依赖解决。
sudo 以管理员权限执行指定命令；apt update 更新软件目录，install 安装软件，-y 自动确认安装。
id 检查服务账号；`||` 表示前一条失败才执行创建；--system 建系统账号，--shell nologin 不允许它交互登录。
install -d 建目录，-o/-g 指定所有者和组，-m 指定权限。tar -xzf 解压 gzip 包，-C 指定目标目录。
npm ci 严格按锁文件安装**自己的课堂代码**的依赖；此处由管理员部署到独立目录，服务运行时会降到专用账号。不要在这里执行来历不明的仓库安装脚本。

## 3. Ubuntu：填写服务器自己的配置

```bash
sudo nano /srv/ffd-lesson07/app/.env
```

nano 是终端编辑器；下列内容填入文件（不是逐行当 shell 命令执行）：

```ini
PORT=3000
DATABASE_PATH=/srv/ffd-lesson07/data/blog.sqlite
MEDIA_PATH=/srv/ffd-lesson07/data/media
BACKUP_PATH=/srv/ffd-lesson07/data/backups
SESSION_SECRET=这里替换成服务器新生成的随机密钥
ADMIN_USERNAME=
ADMIN_PASSWORD=
FRONTEND_ORIGIN=
```

另开一个 SSH 终端执行：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

node 运行 JavaScript；-e 执行引号里的代码；require 载入 Node 自带 crypto 模块；randomBytes(32) 取 32 字节安全随机数据；toString('base64url') 转成适合文本保存的编码；console.log 输出结果。
只把结果粘进服务器 .env 的 SESSION_SECRET= 后面，不复制到模板、聊天或截图。不要复用本机密钥。
同源部署 FRONTEND_ORIGIN 留空，角色初始化项也留空。按 Ctrl+O、回车保存，Ctrl+X 退出。

```bash
sudo chown ffdlesson07:ffdlesson07 /srv/ffd-lesson07/app/.env
sudo chmod 600 /srv/ffd-lesson07/app/.env
sudo -u ffdlesson07 node --env-file=.env scripts/serve-lesson07.mjs
```

chown 改所有者；chmod 600 表示只有所有者可读写；sudo -u 指定以服务账号运行。
--env-file 让 Node 从文件加载环境变量。serve-lesson07 会先检查四项任务和实际 users 表结构，未通过就拒绝上线。
看到 lesson07 ready 后，在另一个 SSH 终端执行 `curl -i http://127.0.0.1:3000/health`，应返回 200 和 ok。-i 显示状态码与响应头。
确认后，在前台服务终端按 Ctrl+C，再进行下一节的后台托管，避免两个进程抢 3000。

如果旧的线上数据库不符合约束，**不要照本机练习方法改名或删库**。先停止发布，备份并由教师安排迁移；这个检查不会替你清空数据。

## 4. Ubuntu：后台托管与域名访问

打开 `deploy/lesson07.service`，核对 ExecStart 中 Node 路径与 `command -v node` 一致；若不在 /usr/bin，改为实际系统路径。服务启用 ProtectHome，放在个人主目录下的 Node 不可用。

```bash
sudo nano deploy/lesson07.service
sudo cp deploy/lesson07.service /etc/systemd/system/ffd-lesson07.service
sudo systemctl daemon-reload
sudo systemctl enable --now ffd-lesson07
sudo systemctl status ffd-lesson07 --no-pager
```

systemd 是系统服务管理器；daemon-reload 重读配置；enable 设置开机启动，--now 同时立刻启动；status 看状态，--no-pager 直接输出。
服务以专用非登录账号运行，仅 data 目录可写。失败时执行 `sudo journalctl -u ffd-lesson07 -n 50 --no-pager`：-u 选服务，-n 50 看最近 50 行。不要把日志中的个人资料公开。

```bash
sudo nano deploy/lesson07.nginx.conf
sudo cp deploy/lesson07.nginx.conf /etc/nginx/sites-available/ffd-lesson07
sudo ln -s /etc/nginx/sites-available/ffd-lesson07 /etc/nginx/sites-enabled/ffd-lesson07
sudo nginx -t
sudo systemctl reload nginx
```

把 server_name 的 lesson07.example.com 换成实际域名；ln -s 建启用配置的符号链接，若已存在不重复创建。nginx -t 先检查语法，**失败时不要 reload**；reload 平滑重载，不是停止网站。
该配置把网页和 API 一起转发给 127.0.0.1:3000，Node 只公开 dist，不会公开 .env 或 SQLite。
HTTPS 使用教师已经配置好的站点证书；本模板的 80 端口块是反代基础示例，不会自动生成证书。教师应将相同的 location 反代配置放入已配置证书的 443 站点并验证 HTTPS 后，再让全班正式使用账号功能。
参考：[Nginx proxy_pass 官方说明](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)。

**只有 IP、尚无 HTTPS 时**：本课可先在限制访问范围的 HTTP 地址做短时演示，只填一次性假账号与不复用的测试口令；不能称为正式安全上线，不能收集真实个人资料。课后关闭演示访问；正式交付补上 HTTPS。

## 5. 在公网亲手验收

1. 用自己的电脑打开 `https://你的域名/register`，创建一个此前不存在的课堂测试账号。右上角出现昵称，Network 中注册为 201，响应有 token、无密码字段。
2. 刷新同一标签页仍为登录态；退出后登录成功，错误密码返回 401。
3. 重复用户名返回 409；用手册的非法请求文件发给**公网域名**，得到 400 与规则提示。
4. SSH 中执行 `sudo systemctl restart ffd-lesson07`（restart 是重启服务），再用刚才的账号登录，仍应成功。这才是“云端数据持久化”的证据。
5. 访问 `/health` 为 200；`/.env`、`/var/blog.sqlite` 不能下载。尝试 POST `/api/articles` 应为 403：第07课上线入口主动封闭后续课写接口，不需要提前写第10课答案。
6. 请同学或手机浏览器打开地址，记录网址、检查日期、重启前后登录结果；截图不包含 .env、完整令牌或密码。

上线入口仅用于本课受限课堂体验，不代表完成整站权限、安全、并发、运维评审。源码更新后先重新检查与构建，再 `sudo systemctl restart ffd-lesson07`；data 与 app 分离，发布时不覆盖 data。

## 6. 可选：前端放 Surge 或 GitHub Pages，后端仍在阿里云

先完成同源路线，再选一个分离部署练习。静态托管只能放 dist，**不能承载 Node 后端或 SQLite**。
后端必须已有可访问的 HTTPS 域名；HTTPS 前端请求 HTTP 后端会被浏览器阻止。以下示例域名都需要替换。

**共同准备（本机编辑器）**：在工程根目录新建 `.env.production.local`，写入：

```ini
VITE_API_BASE_URL=https://你的后端域名
VITE_ROUTER_MODE=hash
```

VITE_API_BASE_URL 是构建时写入前端的 API 根地址（不带 /api、末尾不带 /）；它不是密钥。VITE_ROUTER_MODE=hash 让地址形如 /#/register，静态托管无需后端重写深层路径。修改后必须重新 build，不是只刷新页面。
**不要设置 VITE_STAGE=7**：旧变量是功能开关，不是课程编号，会把登录入口隐藏；本课沿用默认互动模式。不要设置 VITE_PUBLIC_PREVIEW=1，那只是静态文章预览，不是连接云端 API。

**选择 A：Surge（本机终端）**

```bat
npm run build
npx surge ./dist 你的唯一站点名.surge.sh
```

npx 运行 Surge 命令；./dist 是待上传文件夹，最后一个参数是自己的站点名；首次按提示注册/登录。部署后以 Surge 给出的实际 HTTPS 地址为准，不要上传整个工程目录。hash 模式刷新注册页不需要 200.html；若以后改回 history，参阅 [Surge 的 SPA 回退说明](https://surge.sh/help/adding-a-200-page-for-client-side-routing)。

**选择 B：GitHub Pages（本机终端 + GitHub 网页）**

```bat
npm run build -- --base=/你的Pages仓库名/
```

第一个 -- 表示后续参数交给 Vite；--base 指定项目站点的资源路径。例如 Pages 地址是 https://用户名.github.io/blog-demo/，就填 /blog-demo/；用户根站点则填 /。
新建一个**独立的前端发布仓库**，只将 dist **里面的文件**上传至该仓库根目录（不要再套一层 dist）；在 Settings → Pages 选择 Deploy from a branch、main、/(root)，保存并等待构建完成。确保 assets 目录也上传，不能只传 index.html。不要为了发布切掉课程源码分支。
参阅 [GitHub Pages 发布来源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

**最后一步（服务器）**：将后端 .env 的 FRONTEND_ORIGIN 改成前端地址的“协议 + 主机”，不含路径和结尾斜杠。例如 Pages 填 `https://你的用户名.github.io`，不是带 /blog-demo/ 的完整 URL；Surge 填实际 `https://站点名.surge.sh`。然后重启 ffd-lesson07。
它是精确跨域白名单，不填 *。浏览器会先发 OPTIONS 预检，允许后才提交 JSON；报 CORS 错误要核对协议、域名和端口。两个托管地址切换时同步更新白名单。
最后必须从这个前端地址重新完成第 5 节注册、登录和持久化验证，不能只证明页面能打开。
