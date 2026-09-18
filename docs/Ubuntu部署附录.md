# Ubuntu 部署附录（教师扩展与后续项目准备）

适用：已有可 SSH 登录且允许 sudo 的 Ubuntu 24.04 LTS 教学服务器；网站为本项目静态文件。主课先用 GitHub Pages 获得上线成果，本附录不要求学生当堂购买服务器。

本附录命令与配置经过文字、路径和 Bash 语法检查，未在真实 Ubuntu 服务器执行。实际服务器 IP、账号、SSH 指纹、开放端口由教师提供。服务器只部署自己有权发布的内容。

## 1. 从 Windows 登录服务器

运行位置：Windows 本机，任意目录。先选择一种终端。

CMD：

```bat
rem 输入老师分配的 Linux 用户名和服务器地址，例如 student@203.0.113.10。
rem 示例地址不能直接照抄；输入你实际领取的信息。
set /p serverLogin=Ubuntu user@host: 
rem ssh 建立远程终端；首次连接核对老师提供的主机指纹。
ssh "%serverLogin%"
```

PowerShell：

```powershell
# 输入实际分配的用户名@服务器地址，不包含 http://。
$serverLogin = Read-Host 'Ubuntu user@host'
# 连接成功后，后面输入的命令在 Ubuntu 上运行。
ssh $serverLogin
```

密码输入时不显示字符属于正常现象。连接成功后出现类似 `student@server:~$` 的提示符。若 ssh 命令不存在，在 Windows“可选功能”中安装 OpenSSH 客户端，重新打开终端。

## 2. 安装工具并领取自己的项目

平台：SSH 登录后的 Ubuntu Bash。位置：自己的 Linux 用户目录。不要在 CMD 或 PowerShell 本地执行本节。

```bash
# 切换到当前 Linux 用户的个人目录。
cd ~
# 更新软件包索引，再安装 Git、Nginx、curl。
sudo apt update
sudo apt install -y git nginx curl
# 读取你自己的公开个人主页仓库 HTTPS 地址。
read -r -p 'Your public repository HTTPS URL: ' studentRepo
# 克隆个人作业；目录已存在时 Git 会停止，不会覆盖。
git clone "$studentRepo" p1-homepage
# 切换到项目并检查文件。
cd p1-homepage
ls
git log -1 --oneline
```

成功：看到 index.html、styles.css、assets 和自己的提交记录。如果 p1-homepage 已存在，先检查它的 remote；确认属于本作业后，跳过 clone，继续进入目录。

## 3. 创建这次发布目录

平台：Ubuntu Bash。位置：`~/p1-homepage`。本示例使用专用目录 `/var/www/p1-classroom`，不修改默认网站。首次使用前执行下面的查看命令，若存在别人维护的内容，应停在此处由教师换一个专用目录，并同步修改后文配置。

```bash
# 若输出“不存在”，表示可以为本课堂新建此目录。
ls -ld /var/www/p1-classroom
```

确认该目录属于本课堂后，逐行运行：

```bash
# 按当前日期时间给这次发布命名；不改变系统 HOME 变量。
releaseName=$(date +%Y%m%d-%H%M%S)
releaseDir="/var/www/p1-classroom/releases/$releaseName"
# -p 创建父目录，chmod 只调整新建的本次目录。
sudo mkdir -p "$releaseDir"
sudo chmod 755 "$releaseDir"
# 导出当前已提交版本，传给 tar 解包到本次目录；不包含 .git。
git archive HEAD | sudo tar -x -C "$releaseDir"
# 核对入口文件存在。
sudo test -f "$releaseDir/index.html" && echo 'index.html OK'
# current 是本课堂网站的发布指针，指向本次版本。
sudo ln -sfnT "$releaseDir" /var/www/p1-classroom/current
```

每次发布到新目录，旧目录保留。尚未 commit 的修改不会被 git archive 导出，因此必须先在 Windows 提交推送，再到服务器更新。

## 4. 写入独立 Nginx 配置

平台：Ubuntu Bash。位置：任意目录。先查看配置是否存在；存在就由教师核对后编辑，不能覆盖陌生配置。

```bash
# 查看该教学配置是否已经存在。
ls -l /etc/nginx/sites-available/p1-classroom
# 用终端编辑器新建或打开本课堂配置。
sudo nano /etc/nginx/sites-available/p1-classroom
```

将以下内容写入 nano 编辑区；这是 Nginx 配置，不是终端命令：

```nginx
server {
    # 教学网站监听 8080，保留已有 80 端口网站。
    listen 8080;
    server_name _;
    # current 指向上一步准备好的版本。
    root /var/www/p1-classroom/current;
    index index.html;
    charset utf-8;
    location / {
        try_files $uri $uri/ =404;
    }
    # 不对外提供隐藏文件。
    location ~ /\. {
        deny all;
    }
}
```

nano 保存：Ctrl+O → Enter；退出：Ctrl+X。继续输入终端命令：

```bash
# 启用独立配置；若提示 File exists，先核对原链接，不加 -f 强制覆盖。
sudo ln -s /etc/nginx/sites-available/p1-classroom /etc/nginx/sites-enabled/p1-classroom
# 检查配置；成功后才重载，失败就按报错文件与行号修复。
sudo nginx -t
# 仅在上一条显示 successful 后执行。
sudo systemctl reload nginx
# 在服务器本机查看 HTTP 状态，应有 200 OK。
curl -I http://127.0.0.1:8080/
```

Windows 浏览器打开 `http://实际服务器地址:8080/`。如果本机 curl 成功而公网打不开，让教师核对云平台安全组入站 TCP 8080。若服务器 UFW 已启用，可由管理员运行 `sudo ufw allow 8080/tcp`（允许该端口），再用 `sudo ufw status` 查看结果；本附录不要求新手启用或重置防火墙。

## 5. 更新与恢复

平台：Ubuntu Bash。位置：`~/p1-homepage`。

```bash
# 查看是否有未提交更改；服务器原则上只部署，不现场改源代码。
git status
# 仅允许快进更新，避免服务器意外产生合并。
git pull --ff-only origin main
# 查看取到的提交编号。
git log -1 --oneline
```

工作区干净且 pull 成功后，重复第 3 节“确认目录后”的发布命令，生成新版本并更新 current。静态文件变更不需要重载 Nginx。

恢复旧部署时：平台仍是 Ubuntu，任意目录。

```bash
# 查看所有版本目录和当前指针。
ls -l /var/www/p1-classroom/releases
readlink /var/www/p1-classroom/current
# 输入上面确实存在的版本目录名，例如日期时间数字。
read -r -p 'Existing release directory name: ' previousRelease
# 只接受日期时间命名，存在 index.html 才切换。
if [[ "$previousRelease" =~ ^[0-9]{8}-[0-9]{6}$ ]] && [ -f "/var/www/p1-classroom/releases/$previousRelease/index.html" ]; then
  sudo ln -sfnT "/var/www/p1-classroom/releases/$previousRelease" /var/www/p1-classroom/current
else
  echo 'Version not found; no change made.'
fi
# 验证恢复后的状态。
curl -I http://127.0.0.1:8080/
```

Windows 浏览器再次刷新，核对页面内容。最后在 SSH 窗口执行 `exit` 返回 Windows。端口 8080 的 HTTP 用于教学演练；域名与 HTTPS 放在后续正式部署课程中处理。

依据：[Ubuntu 安装 Nginx](https://ubuntu.com/server/docs/how-to/web-services/install-nginx/)、[Ubuntu 配置 Nginx](https://ubuntu.com/server/docs/how-to/web-services/configure-nginx/)。
