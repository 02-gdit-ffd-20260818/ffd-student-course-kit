# Ubuntu 部署附录：平台、命令注释与运行方法

配合第六课 PPT 第 45—58 页使用。Windows 用于构建和上传；SSH 登录后，命令才运行在 Ubuntu 24.04 服务器。两者可以共用同一个 VS Code 终端，但必须看清当前提示符。

Windows 提示符通常以 PS 开头，包含 C: 等盘符。Ubuntu 通常显示 账号@主机名:~$。下方每一步都标注当前平台，按顺序一次执行一个代码框。# 开头为注释，可一起复制。发生错误先停止后续依赖步骤。

前提：第六课工程检查通过；已领取 kit-06-v12，内有 deploy/nginx-p1.conf；教师提供专用练习服务器、账号、主机指纹、认证方式及 sudo 权限，并确认 8088 端口和本次目录可用于练习。SSH 密码输入时通常不显示字符或星号，正常输入后回车；密钥登录按教师分发的配置操作，不把私钥或密码写入代码。

打开方式：Windows 上打开 VS Code 的 p1-portfolio，点击“终端 → 新建终端”，选择 PowerShell。如果网页服务还在运行，先 Ctrl+C 停止，再输入以下定位命令。

运行平台：Windows PowerShell。输入位置：VS Code 下方终端，起始目录任意。运行方法：粘贴本代码框并按 Enter。

```powershell
# 在 Windows 中进入自己的工程，为后续构建和上传确定目录。
Set-Location (Join-Path $env:USERPROFILE 'web-work/p1-portfolio')
```

## PPT 第 45 页：Ubuntu部署预演：教师按需演示

P1主课到上一页完成，以下为部署参考。

适用Ubuntu 24.04、已有SSH账号与sudo权限。

把已构建静态站部署到独立8088端口。

P2的API、数据库与HTTPS另按对应项目实施。

## PPT 第 46 页：从Windows检查SSH客户端

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 显示 Windows OpenSSH 客户端版本，确认 ssh 可用。
ssh -V
```

解释：显示OpenSSH客户端版本；命令运行在Windows，不是服务器。

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 显示 Windows scp 程序的位置，用于后续上传文件。
Get-Command scp
```

解释：确认Windows能找到SCP文件传输工具。

成功标志：SSH版本和scp路径可见。

遇到问题：缺少客户端：Windows设置中搜索“可选功能”，安装OpenSSH客户端后重开终端。

## PPT 第 47 页：填写服务器并连接

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 按提示输入老师提供的账号@地址，保存在当前 Windows 终端变量中。
$serverTarget = Read-Host "输入账号@服务器地址"
```

解释：例如老师提供的ubuntu@某IP；不要把密码或私钥粘进地址。

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 连接服务器；核对主机指纹并完成本人认证后，后续提示符属于 Ubuntu。
ssh $serverTarget
```

解释：连接Ubuntu。首次核对老师提供的主机指纹后确认，按提示认证。

成功标志：提示符变为Ubuntu账号与主机名。

遇到问题：连接超时：核对地址与云安全组SSH端口；Permission denied先检查账号和密钥。

## PPT 第 48 页：确认Linux环境与目标端口

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 显示当前登录账号，确认 SSH 使用的是教师提供的账号。
whoami
# 显示服务器当前目录。
pwd
```

解释：分别显示当前登录账号和当前目录，确认已经进入服务器。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 显示服务器的 Linux 发行版与版本。
cat /etc/os-release
# 以管理权限检查 8088 端口监听；只有表头表示此端口当前没有监听。
sudo ss -ltnp "sport = :8088"
```

解释：查看Ubuntu版本与8088监听情况。ss只有表头时表示当前没有该端口监听。

成功标志：系统为预期Ubuntu，练习端口未被其他服务占用。

遇到问题：8088已占用：停止本次新站配置，由教师选择独立主机或统一新端口。

## PPT 第 49 页：安装Nginx并准备接收目录

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 刷新 Ubuntu 软件包索引；sudo 表示申请管理权限。
sudo apt update
# 安装 Nginx；-y 自动确认软件包安装问题。
sudo apt install -y nginx
```

解释：update刷新软件包索引；install安装Nginx；sudo申请管理权限。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 建立服务器用户家目录下的上传目录；-p 允许复用已有目录。
mkdir -p ~/p1-upload
# 结束本次 SSH 连接，回到原来的 Windows PowerShell。
exit
```

解释：建立用户上传目录；exit结束SSH，返回Windows终端。

成功标志：安装成功，返回PS开头的Windows提示符。

遇到问题：无sudo权限或软件源失败：由服务器管理员处理，不继续写系统配置。

## PPT 第 50 页：从Windows上传构建结果

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 在 Windows 的个人工程中重新生成 dist 部署文件。
npm.cmd run build
# 检查 Windows 工程的构建入口是否存在，必须显示 True 再继续。
Test-Path ./dist/index.html
```

解释：重新构建并确认入口，必须成功且为True后再上传。

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 把 Windows 的 dist 目录递归上传；花括号分隔变量和后面的冒号。
scp -r ./dist "${serverTarget}:p1-upload/"
```

解释：-r递归复制dist到远程用户的p1-upload目录；变量后的冒号用花括号分隔。

成功标志：SCP传输完成，没有错误。

遇到问题：serverTarget为空：重新Read-Host输入；上传的是dist而非node_modules。

## PPT 第 51 页：上传本站Nginx配置

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 把第六课资源中的 Nginx 配置上传到服务器用户目录。
scp ../kit-06-v12/deploy/nginx-p1.conf "${serverTarget}:p1-upload/"
```

解释：上传本课提供的配置文件。反引号表示续行；此文件只服务本练习站点。

运行平台：Windows 10/11 · PowerShell（本机）。

运行位置：VS Code 下方同一个终端；当前应显示 PS，目录为自己的 p1-portfolio。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```powershell
# 连接服务器；核对主机指纹并完成本人认证后，后续提示符属于 Ubuntu。
ssh $serverTarget
```

解释：重新进入Ubuntu，后续sudo命令均在服务器运行。

成功标志：传输成功并进入Ubuntu提示符。

遇到问题：找不到配置：核对第6课领取目录和deploy子目录。

## PPT 第 52 页：Nginx配置文件的内容

这是配置文件内容，不是终端命令。

listen指定端口；root指定网站文件夹；index指定首页。

try_files按路径找文件，找不到时返回404。

输入位置：这是 kit-06-v12/deploy/nginx-p1.conf 配置文件内容，已随资源提供，用编辑器查看，不粘贴到终端执行。

```nginx
server {
  listen 8088;
  server_name _;
  root /var/www/p1-classroom;
  index index.html;
  location / { try_files $uri $uri/ =404; }
}
```

## PPT 第 53 页：安装本次站点文件

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 确认上传的 index.html 存在，显示文件属性；不存在就停止后续安装。
ls -l ~/p1-upload/dist/index.html
```

解释：列出上传后的入口文件。文件不存在则停止，先修正Windows上传步骤。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 建立网站目录；-d 表示目录，-m 755 设置可读取和进入的目录权限。
sudo install -d -m 755 /var/www/p1-classroom
# 把上传的 dist 内容复制到本练习站点；dist/. 表示内容本身，避免多套一层目录。
sudo cp -r ~/p1-upload/dist/. /var/www/p1-classroom/
```

解释：建立本站目录，再复制dist里的内容，避免多嵌套一层dist。仅对本练习目录执行。

成功标志：目录中可找到/var/www/p1-classroom/index.html。

遇到问题：入口不存在：先回Windows检查SCP路径；不要继续配置Nginx。

## PPT 第 54 页：设置可读权限并检查配置目标

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 只给本次站点增加读取与目录访问权限；-R 递归，a+rX 供各用户读取及进入目录。
sudo chmod -R a+rX /var/www/p1-classroom
```

解释：让Nginx可读取本站文件并进入目录，范围限定为本练习站点。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 核对是否已有同名站点配置；首次安装时预期文件不存在，已有则先由老师核对归属。
ls -l /etc/nginx/sites-available/p1-classroom
# 核对是否已有同名站点配置；首次安装时预期文件不存在，已有则先由老师核对归属。
ls -l /etc/nginx/sites-enabled/p1-classroom
```

解释：检查是否已有同名配置。首次练习应显示不存在；已有时先由教师确认归属。

成功标志：第一次配置时，两处同名文件均不存在。

遇到问题：已有配置：停止首次安装步骤；更新已有本站时先备份并检查差异。

## PPT 第 55 页：启用本站配置

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 复制配置文件并设置 644 权限：所有者可读写，其他用户可读。
sudo install -m 644 ~/p1-upload/nginx-p1.conf /etc/nginx/sites-available/p1-classroom
```

解释：复制配置到sites-available；Bash用反斜杠续行，不能用PowerShell反引号。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 创建符号链接启用本站配置，只在确认目标不存在时执行。
sudo ln -s /etc/nginx/sites-available/p1-classroom /etc/nginx/sites-enabled/p1-classroom
```

解释：建立启用链接。只在上一页确认不存在同名配置后执行。

成功标志：两个路径指向本次配置文件。

遇到问题：File exists：不要用-f覆盖；回上一页确认已有配置。

## PPT 第 56 页：检查配置后再加载

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 检查全部 Nginx 配置；看到 successful 后才继续重载。
sudo nginx -t
```

解释：检查全部Nginx配置语法，必须看到successful后再运行下一条。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 让 Nginx 重新读取配置；必须先通过 nginx -t。
sudo systemctl reload nginx
# 请求响应头，确认服务器本机访问本站得到 HTTP 200。
curl -I http://127.0.0.1:8088/
```

解释：reload重新加载配置；curl -I仅请求响应头，检查本站是否返回HTTP 200。

成功标志：配置检查成功，本机HTTP响应为200。

遇到问题：语法检查失败则不reload；根据文件和行号修正。

## PPT 第 57 页：检查防火墙与访问条件

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 查看防火墙状态；inactive 时不在本课临时启用整个防火墙。
sudo ufw status
```

解释：查看UFW状态。inactive时不为本课临时启用整个防火墙。

运行平台：Ubuntu 24.04 · Bash（SSH 连接后的服务器）。

运行位置：VS Code 下方已经登录 Ubuntu 的同一个终端；命令使用 ~/ 或绝对路径，可在该账号任意目录执行。

运行方法：粘贴本代码框，按 Enter；等待命令结束，按下面成功标志核对后再继续。

```bash
# 仅当 UFW 已启用且教师确认需要放行时执行：允许 TCP 8088。
sudo ufw allow 8088/tcp
```

解释：仅当UFW已启用且教师确认需要开放本站时执行；允许HTTP练习端口。

成功标志：云安全组也已允许课堂需要的来源访问TCP 8088。

遇到问题：云安全组在云平台网页配置；本机curl成功不代表外网可达。

## PPT 第 58 页：公网验证与后续更新

Windows浏览器打开 http://服务器地址:8088/。

核对本课文字、资源、筛选和主题。

更新时重新build、上传dist，再复制本站文件。

仅静态内容更新通常不需要重载Nginx。

## 平台切换回看

执行 ssh 后，若登录成功，进入 Ubuntu。执行 exit 后，回到 Windows。若只是新建了一个终端，它没有之前的 serverTarget 变量，需要在 Windows 重新执行第 47 页输入服务器地址的代码框。连接失败时仍在 Windows，不能直接输入 sudo。

本附录的 Bash 命令可以检查语法；真正的 SSH 登录、Nginx 配置加载和公网访问，仍需在实际教学服务器上演练。P1 这里只部署 HTTP 静态站，数据库和完整服务部署按后续项目安排。

官方依据：[Ubuntu Nginx](https://ubuntu.com/server/docs/how-to/web-services/install-nginx/)、[Windows OpenSSH](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-overview)。
