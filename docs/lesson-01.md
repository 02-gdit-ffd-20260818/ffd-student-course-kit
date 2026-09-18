# 第01课_HTML内容与首次上线：CMD / PowerShell 统一实操

本课使用固定资源 p1-web-20260918-v2.0。学生正常路线继续修改自己的 p1-homepage；各课 starter 是补课参考状态，不直接覆盖个人工程。

效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-01/

## 使用方法

CMD 与 PowerShell 的页只选一种；其余通用步骤只做一次。命令的说明写在代码框前，注释行以 CMD 的 rem 或 PowerShell 的 # 开头。代码框中的引号保持英文。网页代码只写到明确标出的文件中。Word 适合阅读，复制代码推荐打开本 Markdown 文件。

### PPT 第 1 页：第 01 课  HTML内容与首次上线

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

P1 一页知我

每次 3×45 分钟，共 6 次课

本课完成效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-01/

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 2 页。

### PPT 第 2 页：本课目标与课堂节奏

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

0—10 分钟：看效果、检查上次版本

10—25：最小讲解与示范

25—50：任务 A；50—60：检查与补讲

60—100：任务 B；100—120：检查、Git

120—135：展示、解释与复盘

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 3 页。

### PPT 第 3 页：当天资源与个人工程

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

教师资源：p1-kit-v2/starter/lesson-01

自己的工程：web-work/p1-homepage

本课素材：p1-kit-v2/resources

手册：p1-kit-v2/docs/lesson-01.md

教师答案留在教师包，课堂按任务推进。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 4 页。

### PPT 第 4 页：先打开正确的窗口

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

按 Windows 键，搜索 cmd，打开命令提示符。

PowerShell 也可以，两种终端只选一种。

命令输在终端，HTML/CSS/JS 写进文件。

普通窗口即可，不要用管理员身份。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：看到 C:\Users\…> 或 PS C:\Users\…>

遇到问题：只复制命令，不复制提示符或输出。

完成后回到第 5 页。

### PPT 第 5 页：检查 Git

运行平台：**Windows CMD / PowerShell 通用**。位置：**任意目录**。

显示 Git 版本。找不到命令时，从 git-scm.com/downloads/win 安装并重开终端。

```text
git --version
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：显示 git version；准备好 VS Code 和 GitHub 账号。

完成后回到第 6 页。

### PPT 第 6 页：建立工作区：CMD

运行平台：**Windows CMD**。位置：**任意目录**。

if not exist 避免重复创建；%USERPROFILE% 是当前用户目录；cd /d 同时切换盘符。

```bat
rem 仅在目录不存在时创建工作区，然后切换进去。
if not exist "%USERPROFILE%\web-work" mkdir "%USERPROFILE%\web-work"
cd /d "%USERPROFILE%\web-work"
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：进入 用户目录\web-work

完成后回到第 8 页。

### PPT 第 7 页：建立工作区：PowerShell

运行平台：**Windows PowerShell**。位置：**任意目录**。

Join-Path 拼接路径；-Force 复用目录；Set-Location 切换目录。

```powershell
# 创建或复用工作区，不删除已有内容。
$courseRoot = Join-Path $env:USERPROFILE 'web-work'
New-Item -ItemType Directory -Force -Path $courseRoot
Set-Location -LiteralPath $courseRoot
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：进入 用户目录\web-work

完成后回到第 9 页。

### PPT 第 8 页：领取模板：CMD

运行平台：**Windows CMD**。位置：**用户目录\web-work**。

set 保存地址；--branch 选固定标签；--depth 1 只取所需历史；末尾是本地目录。

```bat
rem 保存教师资源地址；下一行只领取固定版本。
set "courseRepo=https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git"
git clone --branch p1-web-20260918-v2.0 --depth 1 "%courseRepo%" p1-kit-v2
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：出现 p1-kit-v2；detached HEAD 提示对资料领取正常。

完成后回到第 10 页。

### PPT 第 9 页：领取模板：PowerShell

运行平台：**Windows PowerShell**。位置：**用户目录\web-work**。

变量保存资源地址；clone 参数含义与 CMD 相同。只执行当前终端这一页。

```powershell
# 保存教师资源地址；下一行只领取固定版本。
$courseRepo = 'https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git'
git clone --branch p1-web-20260918-v2.0 --depth 1 $courseRepo p1-kit-v2
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：p1-kit-v2/starter/lesson-01/index.html 存在

完成后回到第 11 页。

### PPT 第 10 页：准备个人工程：CMD

运行平台：**Windows CMD**。位置：**用户目录\web-work**。

只复制 starter 内的网页文件，不复制教师资料仓库的 .git。目标已存在时打开原工程。

```bat
rem 目标存在就停下，避免覆盖自己的工程。
if exist p1-homepage (echo STOP: open existing project) else (xcopy "p1-kit-v2\starter\lesson-01" "p1-homepage\" /E /I /H)
cd /d "%USERPROFILE%\web-work\p1-homepage"
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：p1-homepage 中能看到 index.html

完成后回到第 12 页。

### PPT 第 11 页：准备个人工程：PowerShell

运行平台：**Windows PowerShell**。位置：**用户目录\web-work**。

先检测目标，再复制子目录。Recurse 包含素材子文件夹。不要重复覆盖。

```powershell
# 目标存在就停下，不能把模板盖到已有成果上。
if (Test-Path -LiteralPath 'p1-homepage') {
  Write-Output 'STOP: open existing project'
} else {
  Copy-Item 'p1-kit-v2/starter/lesson-01' 'p1-homepage' -Recurse
}
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work/p1-homepage')
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：p1-homepage 中能看到 index.html

完成后回到第 12 页。

### PPT 第 12 页：运行网页与打开编辑器

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

文件资源管理器打开 p1-homepage。

双击 index.html，在浏览器查看。

VS Code：文件 → 打开文件夹 → p1-homepage。

改完 Ctrl+S 保存，浏览器 Ctrl+R 刷新。

此路线不安装 npm，不需要两个终端。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：网页可见，编辑器左侧列出工程文件。

完成后回到第 13 页。

### PPT 第 13 页：HTML5 的内容结构

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

head 放编码、标题和样式引用。

body 放能看到的内容。

header / nav / main / section 表达页面结构。

h1 / h2 / h3 表达标题层级。

img 的 src 找图片，a 的 href 找目标。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 14 页。

### PPT 第 14 页：修改自己的介绍（1）

运行平台：**VS Code 文件编辑区**。位置：**index.html：搜索 h1 与 hero-role**。

先预测效果，再修改并刷新。

```text
<h1>林同学 <span>Lin</span></h1>
<p class="hero-role">前端开发学习者</p>
<img src="assets/avatar.svg" alt="我的头像">
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 15 页。

### PPT 第 15 页：任务 A：资料与照片

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

打开 index.html，搜索“请填写姓名”。

改成自己的姓名、学校、简介和联系方式。

将自己的照片放进 assets，更新 src 与 alt。

保存刷新，检查中文和图片。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：别人能看出你是谁；不用教师的论文和联系方式。

完成后回到第 16 页。

### PPT 第 16 页：检查 A：图片为什么不显示

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

先检查文件名和扩展名，再检查 src。

assets/avatar.svg 是相对当前 HTML 的路径。

发布到 Linux 后路径区分大小写。

不要使用 E:\… 或 C:\… 作为网页图片路径。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 17 页。

### PPT 第 17 页：增加一条经历（1）

运行平台：**VS Code 文件编辑区**。位置：**index.html：搜索 experience-item**。

复制一个完整区块，修改自己的内容。

```text
<div class="experience-item">
  <p class="experience-heading">
    <strong>我的学校 · 我的专业</strong>
    <time>在读</time>
  </p>
  <p class="experience-detail">学习网页开发。</p>
</div>
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 18 页。

### PPT 第 18 页：任务 B：经历与作品链接

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

增加一条真实经历，保留正确闭合标签。

搜索 portfolio，修改一个作品显示名称。

检查 href 能打开正确网页。

自己的后续项目未完成，可保留已标注的教学示例。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：经历出现；链接打开；标题层级没有跳乱。

完成后回到第 19 页。

### PPT 第 19 页：本课验收与提交

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

浏览器刷新后看到本课结果。

资料和已有功能没有被覆盖。

能指出修改文件并解释一处关键代码。

按本课检查单逐项记录。

随后回到终端保存版本。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 20 页。

### PPT 第 20 页：建立自己的 Git 历史

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

只在 p1-homepage 中执行一次；此处不是教师领取目录。

```text
git init -b main
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：显示初始化仓库；之后始终使用这一份仓库。

完成后回到第 21 页。

### PPT 第 21 页：设置提交身份：CMD

运行平台：**Windows CMD**。位置：**个人工程 p1-homepage**。

配置只作用于当前仓库；可用 GitHub 提供的 noreply 邮箱。

```bat
rem 按提示输入自己的姓名和邮箱，再按回车。
set /p studentName=Your name: 
set /p studentEmail=Your email: 
git config user.name "%studentName%"
git config user.email "%studentEmail%"
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：git config user.name 能显示自己的名字

完成后回到第 23 页。

### PPT 第 22 页：设置提交身份：PowerShell

运行平台：**Windows PowerShell**。位置：**个人工程 p1-homepage**。

只执行与自己终端相同的这一页。

```powershell
# 按提示填写自己的身份，不使用老师的信息。
$studentName = Read-Host 'Your name'
$studentEmail = Read-Host 'Your email'
git config user.name $studentName
git config user.email $studentEmail
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：身份配置完成

完成后回到第 23 页。

### PPT 第 23 页：检查与首次提交

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

status 看文件；diff 看修改；add 暂存；commit 写入本地历史。

```text
git status
git diff
git add .
git commit -m "完成个人主页初版"
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：出现提交编号；提交后 status 显示工作区干净。

完成后回到第 24 页。

### PPT 第 24 页：创建自己的远程仓库

运行平台：**GitHub 网页**。位置：**自己的 GitHub 账号**。

GitHub 登录本人账号，右上角 + → New repository。

名称填写 p1-homepage，选择 Public。

不勾选 README、.gitignore、License 初始化。

创建后复制 HTTPS 地址。

不要把教师资源仓库当作自己的 origin。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：地址含自己的用户名和 p1-homepage

完成后回到第 25 页。

### PPT 第 25 页：绑定远程：CMD

运行平台：**Windows CMD**。位置：**个人工程 p1-homepage**。

remote add 绑定；-v 检查；-u 建立 main 跟踪关系。第一次认证按浏览器提示登录本人账号。

```bat
rem 粘贴刚创建的个人仓库 HTTPS 地址。
set /p studentRepo=Repository URL: 
git remote add origin "%studentRepo%"
git remote -v
git push -u origin main
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：GitHub 仓库显示自己的 index.html

完成后回到第 27 页。

### PPT 第 26 页：绑定远程：PowerShell

运行平台：**Windows PowerShell**。位置：**个人工程 p1-homepage**。

只执行一个终端版本。若 origin 已存在，先检查 remote -v，不要重复添加或强推。

```powershell
# 粘贴自己仓库的 HTTPS 地址。
$studentRepo = Read-Host 'Repository URL'
git remote add origin $studentRepo
git remote -v
git push -u origin main
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：远程文件与本地一致

完成后回到第 27 页。

### PPT 第 27 页：发布或更新 GitHub Pages

运行平台：**GitHub 网页**。位置：**自己的 p1-homepage 仓库**。

第一次：仓库 Settings → Pages。

Source 选 Deploy from a branch。

Branch 选 main，目录选 /(root)，点击 Save。

以后 git push 后等待部署结束，打开显示的网址。

网站与仓库链接不同，以 Pages 的 Visit site 为准。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：从 Pages 打开的网站可访问。

遇到问题：404：确认 main 已推送，根目录有 index.html；查看 Actions 中部署是否结束。

完成后回到第 28 页。

### PPT 第 28 页：展示与退出条

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

用网址展示今天的新结果。

指出修改的一个文件和一段代码。

说明一次错误是如何定位的。

记录提交编号与下一步计划。

完成后关闭编辑器前先确认文件已保存。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 28 页。

## Git 与发布排错

- destination path already exists：已经领取过，直接打开原目录，不删除个人工程。
- index.html 找不到：检查是否仍在 p1-kit-v2，而没有进入 p1-homepage。
- author identity unknown：重新执行本机身份配置页。
- origin already exists：先 git remote -v，地址正确就跳过添加；不盲目更换。
- push 被拒：先记录错误。浏览器认证用本人账号，不把密码写入代码或命令。
- 远程非空：若建仓时误加 README，不强推。老师协助合并，或新建一个真正空的个人仓库。
- 仅浏览器有旧样式：Ctrl+F5 后再检查部署状态。

