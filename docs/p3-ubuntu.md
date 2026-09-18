# P3 Ubuntu同源部署实操

本手册是新学生工程的部署路线，尚未在学生真实服务器执行。仅对自己的服务器操作。Windows命令与Ubuntu命令分开执行。端口8080为教学网址；已有域名和HTTPS由后续正式发布配置。

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
mkdir -p ~/classroom-node-install
cd ~/classroom-node-install
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
sudo mkdir -p /opt/classroom-node24
sudo tar -xJf "$nodeArchive" -C /opt/classroom-node24 --strip-components=1
# 本终端使用明确版本；PATH是正常系统环境变量。
export PATH="/opt/classroom-node24/bin:$PATH"
node --version
npm --version
```

curl下载，awk选校验行，sha256sum检验完整性，tar解压；node/npm应显示24.x及npm版本。每一条查看成功结果后再执行下一条。官方来源：https://nodejs.org/dist/v24.19.0/。

## 3. 领取自己的工程并生成配置

平台：Ubuntu Bash，任意目录。clone的是自己的公开工程，已经完成第13课并push；不是教师资源仓库。

```bash
# 创建部署工作区，输入自己的仓库HTTPS地址。
mkdir -p ~/classroom-apps
cd ~/classroom-apps
read -r -p 'Your repository HTTPS URL: ' studentRepo
# 首次部署才clone；若目录已有工程，停止重复clone并检查。
git clone "$studentRepo" p3
cd p3
# 按锁文件安装；只在没有.env时生成配置。
npm ci
node tools/prepare-env.mjs
# 生成前端静态文件。
npm run check
npm test
npm run build
```

本地prepare-env生成的密码不上传Git；服务器会生成自己的新密码，用编辑器或nano在服务器查看.env再登录。需要安装nano时sudo apt install -y nano。根目录执行nano .env，Ctrl+O回车保存、Ctrl+X退出。SESSION_SECRET与账号密码只留服务器。不要把数据库文件提交仓库。

## 4. 持久数据和版本目录

平台：Ubuntu Bash，位置~/classroom-apps/p3。

```bash
# 记录工程目录和服务用户，用于systemd。
appDirectory="$PWD"
serviceUser="$(id -un)"
# 建立本项目专用数据、备份和网页发布目录。
sudo install -d -o "$serviceUser" -g "$(id -gn)" /srv/classroom/p3/data /srv/classroom/p3/backups /srv/classroom/p3/releases
# 仅数据库项目需要把.env中的DATABASE_PATH改为下面持久路径。
```

在nano .env中将DATABASE_PATH改为`/srv/classroom/p3/data/p3-community.sqlite`，DB_DRIVER保持sqlite。

```bash
# 本终端启动一次验证API；保持运行，另外开SSH窗口访问health。
npm run start:api
```

另一Ubuntu终端执行curl -f http://127.0.0.1:3020/health，结果ok=true。回API终端Ctrl+C停止，继续下面自动服务配置。

## 5. 配置持久API服务

平台：Ubuntu Bash，位置~/classroom-apps/p3。沿用第4节的appDirectory/serviceUser；重新登录需要重新赋值。

```bash
# 写入本项目独立服务，不更改其他项目服务。
sudo tee /etc/systemd/system/classroom-p3.service >/dev/null <<EOF
[Unit]
Description=Classroom P3 API
After=network.target
[Service]
Type=simple
User=$serviceUser
WorkingDirectory=$appDirectory
EnvironmentFile=$appDirectory/.env
Environment=PATH=/opt/classroom-node24/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/opt/classroom-node24/bin/node server/index.js
Restart=on-failure
[Install]
WantedBy=multi-user.target
EOF
# 读取服务配置、启动并检查。
sudo systemctl daemon-reload
sudo systemctl enable --now classroom-p3
sudo systemctl status classroom-p3 --no-pager
curl -f http://127.0.0.1:3020/health
```

tee写文件；daemon-reload重新读取；enable --now设置开机启动并立即运行；status看状态；curl核对API。失败先journalctl -u classroom-p3 -n 40 --no-pager，看第一条错误，修复.env或目录后restart。

## 6. 发布网页并配置Nginx

平台：Ubuntu Bash，位置~/classroom-apps/p3。

```bash
# 每次新版本一个目录，保留旧网页便于恢复。
releaseName="$(date +%Y%m%d-%H%M%S)"
cp -a dist "/srv/classroom/p3/releases/$releaseName"
ln -sfnT "/srv/classroom/p3/releases/$releaseName" /srv/classroom/p3/current
# 本项目在独立教学端口运行，API同源转发。
sudo tee /etc/nginx/conf.d/classroom-p3.conf >/dev/null <<'EOF'
server {
    listen 8081;
    server_name _;
    root /srv/classroom/p3/current;
    index index.html;
    location /api/ { proxy_pass http://127.0.0.1:3020; proxy_set_header Host $host; }
    location = /health { proxy_pass http://127.0.0.1:3020/health; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF
# 只有语法成功才reload。
sudo nginx -t
sudo systemctl reload nginx
curl -f http://127.0.0.1:8081/health
```

cp复制dist；ln切换当前网页；Nginx的/api转发到本机Express，其他路由返回Vue首页。Windows浏览器打开http://自己的服务器地址:8081/。若本机curl成功公网打不开，教师核对云安全组的对应教学端口。每个项目端口不同，可在同一服务器保存全部项目。

## 7. 更新、日志与恢复

先在Windows完成测试、commit、push。Ubuntu cd ~/classroom-apps/p3→git status确认干净→git pull --ff-only origin main（仅允许快进更新）→npm ci→npm test→npm run build→重复第6节网页发布→sudo systemctl restart classroom-p3→curl health。不覆盖.env和持久数据目录。

数据库项目发布前完成备份。博客：在工程目录使用node --env-file=.env database/backup.mjs /srv/classroom/p2/backups/发布前.sqlite；restore需要先停止API，并确认真实备份文件存在。社区SQLite备份在停止服务后复制持久.sqlite文件，启动前检查PRAGMA integrity_check；事务中的数据库不能直接复制并声称可靠备份。MySQL使用工程database/mysql的备份脚本，属于选做扩展。

恢复网页：先ls /srv/classroom/p3/releases查看实际存在版本，再用ln -sfnT指向确实存在的旧网页目录。恢复API：git switch --detach 自己已发布的真实标签→npm ci→sudo systemctl restart classroom-p3；恢复后检查health与业务。继续开发前git switch main。涉及数据库迁移时，网页回退不等于数据库自动回退，需按真实备份恢复并确认模式兼容。

本机日志：journalctl -u classroom-p3 -n 40 --no-pager；Nginx日志在/var/log/nginx/。记录部署时间、Git提交、网页版本目录、数据库备份位置和健康检查结果。exit退出SSH返回Windows。
