# 项目2 Ubuntu部署：SQLite唯一数据库路线

## 已验证的教师示例

教师公开演示为 P2 课程博客 v3.3，历史发布目录为 `/srv/ffd-p2-v31/releases/20260921-104353`。本课验收脚本要求当前工程的健康响应，运行时使用自己部署的第11课完成态。

- 网页：<http://47.120.73.69/ffd-p2-v31/>
- SQLite健康检查：<http://47.120.73.69/ffd-p2-v31-api/health>
- 文章API：<http://47.120.73.69/ffd-p2-v31-api/api/articles>

2026年9月21日完成真实验收：注册、登录、发表评论、越权删除返回403、图片/音频/视频访问、视频Range请求、API重启后评论仍存在、本人删除评论，全部通过。部署前数据库已备份。
本指南对应第11课完成态。练习时通过 SSH 隧道访问云端服务。服务器数据库和上传文件放在网页版本目录外。正式发布时由教师配置域名和 HTTPS。

## 账号与权限

- 普通用户在注册页面创建，数据库角色固定为 `reader`，可以阅读、发表评论和删除自己的评论。
- 管理员不是公开注册产生的。在服务器 `.env` 中设置 `ADMIN_USERNAME=admin` 和 `ADMIN_PASSWORD`，首次启动时写入 `users`，角色为 `admin`。
- 管理员可以管理文章、上传媒体和管理所有评论。不要把服务器管理员密码写入课件、Git或公开网页。
- 如果数据库已经创建后才修改管理员账号，需要使用新的管理员用户名重新启动，或由教师在SQLite中按规范维护账号；不要直接把普通用户角色改成管理员作为课堂捷径。

## 1. 从Windows登录

平台：Windows CMD/PowerShell，任意目录。把下列两个词换成自己真实的SSH用户与服务器地址，不复制占位词。

```text
ssh 实际用户@实际服务器地址
```

ssh建立远程终端；输入服务器账号密码或使用已配置密钥。屏幕出现Linux提示符后才执行下面Bash命令。Windows和Linux目录不同。没有服务器时先完成本地，不把本手册标成实际上线。

## 2. Ubuntu准备Node24与Nginx

平台：Ubuntu24.04 Bash，自己的用户目录。需要sudo权限。下面安装Node固定24.19.0，避免Ubuntu默认包版本过低。

```bash

# 更新包索引；安装下载、解压、Git与网页代理工具。
sudo apt update
sudo apt install -y curl xz-utils git nginx

# 建立下载目录，不覆盖自己的工程。
mkdir -p ~/node-runtime-install
cd ~/node-runtime-install

# 确認架构；仅支持下面明确识别的两种，其他架构停止。
case "$(uname -m)" in x86_64) nodeArch=x64 ;; aarch64) nodeArch=arm64 ;; *) echo 'Unsupported architecture'; exit 1 ;; esac
nodeArchive="node-v24.19.0-linux-$nodeArch.tar.xz"

# 下载官方二进制包与官方校验表。
curl -fLO "https://nodejs.org/dist/v24.19.0/$nodeArchive"
curl -fLO https://nodejs.org/dist/v24.19.0/SHASUMS256.txt

# 只校验本次归档；不通过则停止，不继续安装。
awk -v f="$nodeArchive" '$2==f' SHASUMS256.txt > selected.sha256
test -s selected.sha256 && sha256sum -c selected.sha256

# 上一条必须成功；安装到独立目录，避免混合旧依赖。
sudo mkdir -p /opt/node24
sudo tar -xJf "$nodeArchive" -C /opt/node24 --strip-components=1

# 本终端使用明确版本；PATH是正常系统环境变量。
export PATH="/opt/node24/bin:$PATH"
node --version
npm --version
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`curl.exe` 是发送 HTTP 请求的程序，在终端运行，不在浏览器地址栏输入。`-i` 同时显示状态行和响应头；`-X` 指定请求方法（GET 读取、POST 提交、DELETE 删除）；`-H` 添加请求头；`-d` 发送请求体；`--data-binary @文件名` 原样发送文件内容。`Content-Type: application/json` 告诉后端内容是 JSON；`Authorization: Bearer 令牌` 携带当前用户身份。`-f` 遇到 HTTP 错误返回失败退出码，`-sS` 隐藏进度但保留错误，`-L` 跟随跳转，`-o` 指定下载文件。示例里的中文编号/令牌必须替换成自己的值。CMD 的行尾 `^` 表示下一行仍是同一条命令，符号后不能有空格；PowerShell 不使用这种续行符。

`npm` 管理项目依赖并执行脚本；`install` 安装依赖（有兼容的锁文件时使用锁定版本）；`ci` 严格按锁文件安装并重建 node_modules；`run 名称` 执行当前 package.json 的 scripts 中同名命令；`test` 是运行测试脚本。先确认终端所在目录有本课 package.json。服务启动后持续占用终端是正常的，另开终端做下一步，Ctrl+C 才停止服务。

`node` 在终端运行 JavaScript；后接文件路径就是执行该文件；`-v` 只显示版本；`-e` 执行后面引号内的代码；`--check` 只检查语法；`--watch` 监测文件变化并重启。`console.log(...)` 把括号内的结果打印出来，函数调用的参数写在括号里，多个参数用逗号分开。

`git` 管理版本；`status` 查看改动；`diff` 查看逐行差异；`add` 选择待提交文件；`commit -m` 创建本地版本并写说明；`push` 发到远端；`clone` 下载仓库，`--branch` 选择分支，`--single-branch` 只取该分支历史；`remote` 管理远端别名，`fetch` 只取回记录。命令中的 `.` 表示当前目录，`--` 后面是文件路径。推送前用 `git remote -v` 核实 origin 是自己的仓库。

`cd` / `Set-Location` 切换终端当前目录；含空格的路径用引号包起来。CMD 的 `/d` 同时切换盘符；PowerShell 用 `Set-Location "路径"`，不加 `/d`。
<!-- COMMAND_HELP:END -->


curl下载，awk选校验行，sha256sum检验完整性，tar解压；node/npm应显示24.x及npm版本。每一条查看成功结果后再执行下一条。官方来源：https://nodejs.org/dist/v24.19.0/。

## 3. 领取自己的工程并生成配置

平台：Ubuntu Bash，任意目录。clone的是自己的公开工程，已经完成第11课并push；不是教师资源仓库。

```bash

# 创建部署工作区，输入自己的仓库HTTPS地址。
mkdir -p ~/apps
cd ~/apps
read -r -p 'Your repository HTTPS URL: ' studentRepo
read -r -p 'Your completed lesson branch: ' studentBranch

# 首次部署才clone；若目录已有工程，停止重复clone并检查。
git clone --single-branch --branch "$studentBranch" "$studentRepo" p2 && cd p2

# 按锁文件安装；只在没有.env时生成配置。
npm ci
(umask 077; npm run setup:app)

# 生成前端静态文件。
npm test
npm run build
```

`--branch` 选择已完成第11课的个人分支。克隆失败时先停止，确认仓库和分支再重试。 `npm run setup:app` 在没有 `.env` 时生成随机会话密钥及管理员密码，已有配置会保留。括号开启子 Shell，`umask 077` 令新配置仅当前账号可读写。使用 `nano .env` 编辑，Ctrl+O 后回车保存，Ctrl+X 退出。账号密码、密钥及数据库留在服务器。

## 4. 持久数据和版本目录

平台：Ubuntu Bash，位置~/apps/p2。

```bash

# 记录工程目录和服务用户，用于systemd。
appDirectory="$PWD"
serviceUser="$(id -un)"

# 建立本项目专用数据、备份和网页发布目录。
sudo install -d -o "$serviceUser" -g "$(id -gn)" /srv/apps/p2-blog/data /srv/apps/p2-blog/backups /srv/apps/p2-blog/releases

# 编辑 .env，将数据库、媒体和备份分别指向持久目录。
nano .env
```

在已有键上改值，每个键只保留一行。已有线上工程沿用原来确认过的数据路径。

```dotenv
PORT=3000
DATABASE_PATH=/srv/apps/p2-blog/data/blog.sqlite
MEDIA_PATH=/srv/apps/p2-blog/data/media
BACKUP_PATH=/srv/apps/p2-blog/backups
```

这四行是配置内容。数据库和上传文件各自持久化。第5节启动前可执行 `chmod 600 .env`，使该文件只允许自己的账号读写。

```bash

# 本终端启动一次验证API；保持运行，另外开SSH窗口访问health。
npm run start:api
```

另一Ubuntu终端执行curl -f http://127.0.0.1:3000/health，结果ok=true。回API终端Ctrl+C停止，继续下面自动服务配置。

## 5. 配置持久API服务

平台：Ubuntu Bash，位置~/apps/p2。沿用第4节的appDirectory/serviceUser；重新登录需要重新赋值。

```bash

# 写入本项目独立服务，不更改其他项目服务。
sudo tee /etc/systemd/system/p2-blog.service >/dev/null <<EOF
[Unit]
Description=P2 Content Platform API
After=network.target
[Service]
Type=simple
User=$serviceUser
WorkingDirectory=$appDirectory
EnvironmentFile=$appDirectory/.env
Environment=PATH=/opt/node24/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/opt/node24/bin/node server/blog-index.js
Restart=on-failure
[Install]
WantedBy=multi-user.target
EOF

# 读取服务配置、启动并检查。
sudo systemctl daemon-reload
sudo systemctl enable --now p2-blog
sudo systemctl status p2-blog --no-pager
curl -f http://127.0.0.1:3000/health
```

tee写文件；daemon-reload重新读取；enable --now设置开机启动并立即运行；status看状态；curl核对API。失败先journalctl -u p2-blog -n 40 --no-pager，看第一条错误，修复.env或目录后restart。

## 6. 发布网页并配置Nginx

平台：Ubuntu Bash，位置~/apps/p2。

```bash

# 每次新版本一个目录，保留旧网页便于恢复。
releaseName="$(date +%Y%m%d-%H%M%S)"
cp -a dist "/srv/apps/p2-blog/releases/$releaseName"
ln -sfnT "/srv/apps/p2-blog/releases/$releaseName" /srv/apps/p2-blog/current

# 教学入口仅监听服务器回环地址，通过 SSH 隧道访问。
sudo tee /etc/nginx/conf.d/p2-blog.conf >/dev/null <<'EOF'
server {
    listen 127.0.0.1:8080;
    server_name _;
    root /srv/apps/p2-blog/current;
    index index.html;
    client_max_body_size 45m;
    location /api/ { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
    location /media/uploads/ { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
    location /media/ { try_files $uri =404; }
    location = /health { proxy_pass http://127.0.0.1:3000/health; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF

# 只有语法成功才reload。
sudo nginx -t && sudo systemctl reload nginx
curl -f http://127.0.0.1:8080/health
```

`cp -a` 复制构建产物，`ln -sfnT` 切换网页版本。Nginx 将 `/api/` 和 `/media/uploads/` 转发到 Express。项目自带的 `/media/` 文件从网页目录读取。 `client_max_body_size 45m` 为 40 MiB 文件及表单编码预留空间，文件大小仍由后端检查。

在 Windows 新终端执行下面一行，替换 SSH 用户和地址。终端保持运行，再打开 `http://127.0.0.1:18080/`。

```text
ssh -N -L 18080:127.0.0.1:8080 实际用户@实际服务器地址
```

`-N` 表示只做转发，`-L` 将本机 18080 连到服务器的 8080。进入新建练习站后，使用虚构账号检查登录、文章和评论。用管理员上传自有小图片，确认图片在详情页能打开，重启本课服务后再验证一次。第11课完成态可在服务器工程根目录运行 `LIVE_BASE=http://127.0.0.1:8080 npm run verify:live`。该命令会向练习库写入验收记录。

## 7. 更新、日志与恢复

先在 Windows 测完并推送。Ubuntu 进入 `~/apps/p2`，用 `git status -sb` 检查当前分支、追踪分支及改动。确认干净后执行 `git pull --ff-only`，只允许快进更新当前追踪分支。随后逐条执行 `npm ci`、`npm test`、`npm run build`。全部通过后发布网页、重启本课服务，再检查健康和上传媒体读取。

发布前在自己的练习站暂停写入，执行一致快照备份。在工程根目录逐条运行：

```bash
sudo systemctl stop p2-blog
npm run db:backup -- --confirmed-stopped
sudo systemctl start p2-blog
```

中间的 `--` 把后面的参数交给备份脚本，`--confirmed-stopped` 表明后端及其他写入工具均已关闭。最后一条用于恢复服务，备份报错也要先恢复服务再排查。成功后记录打印的备份目录，用 `npm run db:backup -- --verify "实际备份目录"` 核对摘要和数据库完整性。备份可能含服务端配置，保存在受限目录。恢复演练用第11课手册中的独立恢复副本，保留现有库和上传文件。

恢复网页前用 `ls /srv/apps/p2-blog/releases` 查到实际旧版目录，再让 `current` 指向它。恢复 API 前先记录 `git branch --show-current` 的结果，核对旧版与现有数据库结构兼容，再切换到已发布标签、安装依赖并重启。恢复完成后检查健康和业务。需要继续更新时，切回刚才记录的分支。

本机日志：journalctl -u p2-blog -n 40 --no-pager；Nginx日志在/var/log/nginx/。记录部署时间、Git提交、网页版本目录、数据库备份位置和健康检查结果。exit退出SSH返回Windows。
