# 项目2 Ubuntu部署：SQLite唯一数据库路线

## 已验证的教师示例

当前公开版本：P2内容发布平台 v3.3，服务器发布目录 `/srv/ffd-p2-v31/releases/20260921-104353`。

- 网页：<http://47.120.73.69/ffd-p2-v31/>
- SQLite健康检查：<http://47.120.73.69/ffd-p2-v31-api/health>
- 文章API：<http://47.120.73.69/ffd-p2-v31-api/api/articles>

2026年9月21日完成真实验收：注册、登录、发表评论、越权删除返回403、图片/音频/视频访问、视频Range请求、API重启后评论仍存在、本人删除评论，全部通过。部署前数据库已备份。
Windows课堂和Ubuntu服务器使用同一套SQLite代码。服务器数据库文件放在版本目录之外，重新部署代码不会覆盖数据。仅对自己的服务器操作；端口8080为教学网址，域名和HTTPS在正式发布时配置。

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

# 首次部署才clone；若目录已有工程，停止重复clone并检查。
git clone "$studentRepo" p2
cd p2

# 按锁文件安装；只在没有.env时生成配置。
npm ci
node tools/prepare-env.mjs

# 生成前端静态文件。
npm test
npm run build
```

本地prepare-env生成的密码不上传Git；服务器会生成自己的新密码，用编辑器或nano在服务器查看.env再登录。需要安装nano时sudo apt install -y nano。根目录执行nano .env，Ctrl+O回车保存、Ctrl+X退出。SESSION_SECRET与账号密码只留服务器。不要把数据库文件提交仓库。

## 4. 持久数据和版本目录

平台：Ubuntu Bash，位置~/apps/p2。

```bash

# 记录工程目录和服务用户，用于systemd。
appDirectory="$PWD"
serviceUser="$(id -un)"

# 建立本项目专用数据、备份和网页发布目录。
sudo install -d -o "$serviceUser" -g "$(id -gn)" /srv/apps/p2-blog/data /srv/apps/p2-blog/backups /srv/apps/p2-blog/releases

# 仅数据库项目需要把.env中的DATABASE_PATH改为下面持久路径。
```

在nano .env中将DATABASE_PATH改为`/srv/apps/p2-blog/data/blog.sqlite`。

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

# 本项目在独立教学端口运行，API同源转发。
sudo tee /etc/nginx/conf.d/p2-blog.conf >/dev/null <<'EOF'
server {
    listen 8080;
    server_name _;
    root /srv/apps/p2-blog/current;
    index index.html;
    location /api/ { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
    location = /health { proxy_pass http://127.0.0.1:3000/health; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF

# 只有语法成功才reload。
sudo nginx -t
sudo systemctl reload nginx
curl -f http://127.0.0.1:8080/health
```

cp复制dist；ln切换当前网页；Nginx的/api转发到本机Express，其他路由返回Vue首页。Windows浏览器打开http://自己的服务器地址:8080/。若本机curl成功公网打不开，教师核对云安全组的对应教学端口。每个项目端口不同，可在同一服务器保存全部项目。

## 7. 更新、日志与恢复

先在Windows完成测试、commit、push。Ubuntu cd ~/apps/p2→git status确认干净→git pull --ff-only origin main（仅允许快进更新）→npm ci→npm test→npm run build→重复第6节网页发布→sudo systemctl restart p2-blog→curl health。不覆盖.env和持久数据目录。

数据库项目发布前完成备份。博客：在工程目录使用node --env-file=.env database/backup.mjs /srv/apps/p2-blog/backups/发布前.sqlite；restore需要先停止API，并确认真实备份文件存在。社区SQLite备份在停止服务后复制持久.sqlite文件，启动前检查PRAGMA integrity_check；事务中的数据库不能直接复制并声称可靠备份。项目二不再提供第二套数据库分支。

恢复网页：先ls /srv/apps/p2-blog/releases查看实际存在版本，再用ln -sfnT指向确实存在的旧网页目录。恢复API：git switch --detach 自己已发布的真实标签→npm ci→sudo systemctl restart p2-blog；恢复后检查health与业务。继续开发前git switch main。涉及数据库迁移时，网页回退不等于数据库自动回退，需按真实备份恢复并确认模式兼容。

本机日志：journalctl -u p2-blog -n 40 --no-pager；Nginx日志在/var/log/nginx/。记录部署时间、Git提交、网页版本目录、数据库备份位置和健康检查结果。exit退出SSH返回Windows。
