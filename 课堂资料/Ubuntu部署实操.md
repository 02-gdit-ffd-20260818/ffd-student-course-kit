# P4 Ubuntu同源部署实操

本手册用于项目四每次课的阿里云 Ubuntu 部署体验，尚未在学生真实服务器执行。仅对自己的服务器操作。Windows 命令与 Ubuntu 命令分开执行。教学网页使用端口 8082；默认通过 SSH 隧道访问，不把尚未完成安全任务的起步工程公开。

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

平台：Ubuntu Bash，任意目录。clone 的是自己本次课的工程，先在 Windows 完成本课任务并 push；不是教师资源总仓库。项目四只有三课，与项目三第14课无关。

```bash
# 创建部署工作区，输入自己的仓库HTTPS地址。
mkdir -p ~/classroom-apps
cd ~/classroom-apps
read -r -p 'Your repository HTTPS URL: ' studentRepo
read -r -p 'Your current lesson branch: ' studentBranch
# 首次部署才clone；若目录已有工程，停止重复clone并检查。
git clone --single-branch --branch "$studentBranch" "$studentRepo" p4
cd p4
# 按锁文件安装；只在没有.env时生成配置。
npm ci
node tools/prepare-env.mjs
# 生成前端静态文件。
npm run check
npm test
npm run build
```

`read -r -p` 显示提示并把输入保存到变量；`--branch` 指定自己本课实际分支，不能假定总是 main。`prepare-env.mjs` 只在没有 `.env` 时复制模板，不覆盖已有配置。项目四没有登录账号，也不需要 SESSION_SECRET。使用 `nano .env` 编辑配置，Ctrl+O 回车保存、Ctrl+X 退出；密钥永远不提交 Git。

第1、2课有意保留后续任务占位，`npm run check` 是完整基线检查，部分条目失败不代表本课任务没做完。逐项按本课手册验收，再执行构建；第3课所有任务完成后应通过完整检查。不要为了消除检查提示提前照抄后续课答案。

## 4. 持久数据和版本目录

平台：Ubuntu Bash，位置~/classroom-apps/p4。

```bash
# 记录工程目录和服务用户，用于systemd。
appDirectory="$PWD"
serviceUser="$(id -un)"
# 建立本项目专用数据、备份和网页发布目录。
sudo install -d -o "$serviceUser" -g "$(id -gn)" /srv/classroom/p4/data /srv/classroom/p4/backups /srv/classroom/p4/releases
# 打开配置，把 CARD_STORAGE_PATH 那行改为下面指定的目录。
nano .env
```

把 `.env` 中的 `CARD_STORAGE_PATH` 设置为 `/srv/classroom/p4/data`，不要新增 DATABASE_PATH。分享卡片以 JSON 文件持久化，不能用 Navicat 连接。当前卡片接口读取 `MINIMAX_API_KEY`；留空即可使用本地文案兜底，`AI_PROVIDER` 是旧兼容接口的配置，不能用它判断当前接口是否调用模型。

```bash
# 本终端启动一次验证API；保持运行，另外开SSH窗口访问health。
npm run start:api
```

另一 Ubuntu 终端执行 `curl -f http://127.0.0.1:3030/health`，返回 JSON 中应有 `"status":"ok"`。回 API 终端 Ctrl+C 停止，继续下面自动服务配置。

## 5. 配置持久API服务

平台：Ubuntu Bash，位置~/classroom-apps/p4。沿用第4节的appDirectory/serviceUser；重新登录需要重新赋值。

```bash
# 写入本项目独立服务，不更改其他项目服务。
sudo tee /etc/systemd/system/classroom-p4.service >/dev/null <<EOF
[Unit]
Description=Classroom P4 API
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
sudo systemctl enable --now classroom-p4
sudo systemctl status classroom-p4 --no-pager
curl -f http://127.0.0.1:3030/health
```

tee写文件；daemon-reload重新读取；enable --now设置开机启动并立即运行；status看状态；curl核对API。失败先journalctl -u classroom-p4 -n 40 --no-pager，看第一条错误，修复.env或目录后restart。

## 6. 发布网页并配置Nginx

平台：Ubuntu Bash，位置~/classroom-apps/p4。

```bash
# 每次新版本一个目录，保留旧网页便于恢复。
releaseName="$(date +%Y%m%d-%H%M%S)"
cp -a dist "/srv/classroom/p4/releases/$releaseName"
ln -sfnT "/srv/classroom/p4/releases/$releaseName" /srv/classroom/p4/current
# 本项目在独立教学端口运行，API同源转发。
sudo tee /etc/nginx/conf.d/classroom-p4.conf >/dev/null <<'EOF'
server {
    listen 8082;
    server_name _;
    root /srv/classroom/p4/current;
    index index.html;
    # 只允许本机访问；学生通过下文 SSH 隧道体验云端服务。
    allow 127.0.0.1;
    deny all;
    location /api/ { proxy_pass http://127.0.0.1:3030; proxy_set_header Host $host; }
    location /c/ { proxy_pass http://127.0.0.1:3030; proxy_set_header Host $host; }
    location = /health { proxy_pass http://127.0.0.1:3030/health; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF
# 只有语法成功才reload。
sudo nginx -t
sudo systemctl reload nginx
curl -f http://127.0.0.1:8082/health
```

`cp -a` 保留属性复制 dist；`ln -sfnT` 把本项目 current 符号链接切到新版本（先确认它不是实际目录）。Nginx 的 `/api/` 和 `/c/` 都转发到 Express，后者是分享页；漏掉 `/c/` 会错误显示应用首页。其他路径返回 Vue 首页。

在 Windows 的新终端执行（CMD/PowerShell 相同）：

```text
ssh -N -L 18082:127.0.0.1:8082 实际用户@实际服务器地址
```

`-N` 不执行远程命令，`-L` 把本机 18082 转发到服务器本机的 8082。保持此终端运行，在 Windows 浏览器打开 `http://127.0.0.1:18082/`；此时页面、生成 API 和分享存储都运行在云服务器。无需向公网开放 3030 或 8082。分享链接仍通过这个本机入口测试，不能声称已允许所有人公开访问。Ctrl+C 关闭隧道。

依次验证：页面加载 → 生成卡片 → 第3课完成后保存分享并打开 → 重启 API 后原链接仍显示原内容。只看到 health 成功不算业务通过。第1、2课以后续任务未完成的预期为准。要正式公开，先完成第3课全部安全任务，再由教师配置域名、HTTPS、访问与滥用限制；不直接删掉访问限制就宣称生产就绪。

## 7. 更新、日志与恢复

先在Windows完成测试、commit、push。Ubuntu cd ~/classroom-apps/p4→git status确认干净→git pull --ff-only origin main（仅允许快进更新）→npm ci→npm test→npm run build→重复第6节网页发布→sudo systemctl restart classroom-p4→curl health。不覆盖.env和持久数据目录。

本项目备份的是卡片 JSON 目录，不使用博客或 MySQL 的备份脚本。先停止 `classroom-p4`，再把 `/srv/classroom/p4/data` 复制到 `/srv/classroom/p4/backups/` 下一个新的带时间目录，确认文件齐全后启动服务；不要覆盖旧备份。恢复前也先保留现有目录，在新目录检查备份文件，再修改 `CARD_STORAGE_PATH` 指向恢复目录并重启。Navicat 不适用于这些 JSON 文件。

恢复网页：先ls /srv/classroom/p4/releases查看实际存在版本，再用ln -sfnT指向确实存在的旧网页目录。恢复API：git switch --detach 自己已发布的真实标签→npm ci→sudo systemctl restart classroom-p4；恢复后检查health与业务。继续开发前git switch main。涉及数据库迁移时，网页回退不等于数据库自动回退，需按真实备份恢复并确认模式兼容。

本机日志：journalctl -u classroom-p4 -n 40 --no-pager；Nginx日志在/var/log/nginx/。记录部署时间、Git提交、网页版本目录、数据库备份位置和健康检查结果。exit退出SSH返回Windows。
