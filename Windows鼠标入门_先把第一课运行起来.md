# Windows 鼠标入门：用 Git clone 领取并运行第一课

这份说明替代原手册步骤 2—4。主流程是 Git clone 领取模板，再打开自己的工程运行。初次只用一个终端，每个命令框都有平台、位置和注释。

## 1. 先打开可以输入命令的地方

运行平台：Windows 10/11。软件：VS Code。命令解释器：PowerShell。

1. 双击桌面或开始菜单中的 Visual Studio Code。
2. 点击顶部“终端 → 新建终端”。英文菜单是 Terminal → New Terminal。
3. 如果顶部菜单折叠，点击“…”查找“终端”；也可以按 Ctrl+Shift+P，输入 Terminal: Create New Terminal，再选择同名命令。
4. 下方出现可以输入文字的区域，这就是终端。若名称不是 PowerShell，点击终端右上方“+”旁的小箭头，选择 PowerShell。
5. 鼠标点击终端最后一行。后面所有 powershell 代码框都输入在这里，不能输入到浏览器地址栏或 index.html 编辑区。

PS C:\…> 是电脑显示的提示符，不用照抄。# 开头的行是注释，解释下一条命令，可以和命令一起粘贴。每次只复制一个代码框，按 Enter 执行，看到本步骤成功标志再继续。多行 if/else 代码框必须一起复制，不拆成独立命令。

如果当前终端已经运行着网页，先按 Ctrl+C，等 PS 提示符出现后再输入下面的命令。

## 2. 检查 Git 和 Node 已安装

运行平台：Windows PowerShell。运行位置：VS Code 下方终端，当前目录可以任意。运行方法：复制本代码框，粘贴到最后一行并按 Enter。

```powershell
# 检查 Git；用于从 GitHub 领取代码，以及后续提交和推送。
git --version
# 检查 Node.js；本课程统一使用 v24 系列。
node --version
# 检查 npm；npm.cmd 是 Windows 下的命令入口。
npm.cmd --version
```

成功标志：三条命令各显示一个版本号。

若出现“无法识别”：先完成相应软件安装，关闭并重开 VS Code，再检查。安装入口：[Git for Windows](https://git-scm.com/downloads/win)、[Node.js](https://nodejs.org/en/download)、[VS Code](https://code.visualstudio.com/Download)。Git 安装保留 Git Credential Manager；Node 选择 24 系列。安装准备由教师课前统一安排。

## 3. 建立并进入统一的上课文件夹

运行平台：Windows PowerShell。运行位置：仍是 VS Code 下方同一个终端，起始目录任意。运行方法：整框复制，粘贴后按 Enter。

```powershell
# $workRoot 是一个临时名字，用来记住上课文件夹的完整地址。
# $env:USERPROFILE 会自动换成本人的 Windows 用户文件夹。
# Join-Path 把用户目录与 web-work 拼接起来，适用不同用户名。
$workRoot = Join-Path $env:USERPROFILE 'web-work'
# 建立 web-work；Directory 表示文件夹，Force 在这里允许复用已有目录。
New-Item -ItemType Directory -Force -Path $workRoot
# 进入 web-work；后面的领取操作会把文件下载到这里。
Set-Location $workRoot
# 显示现在的完整路径，方便检查自己在哪里。
Get-Location
```

成功标志：最后显示的路径以 web-work 结尾。例如这台电脑是 C:\Users\niewe\web-work；学生用户名不同正常，不需要修改命令。

## 4. 用 git clone 领取第一课模板

运行平台：Windows PowerShell。运行位置：同一个终端，当前目录必须是刚才的 web-work。运行方法：复制下面整个代码框，粘贴并按 Enter；等待下载结束。

```powershell
# 保存老师的真实资源仓库地址。这一行直接复制，不改成自己的仓库。
$repo = 'https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git'
# clone 表示从远程下载仓库。
# --branch 指定第一课分支 p1-guide-01-v1.2。
# --single-branch 只下载这一课分支，--depth 1 只取它的最新提交。
# 最后的 kit-01-v12 是本次资源保存在电脑上的文件夹名称。
git clone --branch p1-guide-01-v1.2 --single-branch --depth 1 $repo kit-01-v12
```

成功标志：下载结束并重新出现 PS 提示符；web-work 里新增 kit-01-v12。公开教学资源通常不需要登录就能领取，后续推送个人成果时才需要自己的账号权限。

如果提示 destination path already exists，说明这个目录已经存在。不要反复 clone 或删除它，先检查是不是之前领取的第一课资源。若是，继续下一步核对；若不是，让老师协助检查。

运行平台：Windows PowerShell。运行位置：仍是 web-work。运行方法：复制下面两条带注释的命令，粘贴后按 Enter。

```powershell
# 检查第一课初稿中是否有 package.json，True 表示入口文件存在。
Test-Path './kit-01-v12/starter/package.json'
# 用 Windows 文件资源管理器打开当前的 web-work，便于用鼠标查看。
# 点号 . 表示“当前文件夹”。
explorer.exe .
```

成功标志：终端显示 True，并弹出 web-work 文件夹窗口。False 表示领取未成功或当前目录不对，先回看步骤 3—4。

## 5. 用鼠标把初稿复制成自己的工程

操作平台：Windows 文件资源管理器。本步骤只点鼠标和使用快捷键，不输入终端命令。

你现在看到的 kit-01-v12 是“老师的资源包”。里面的 starter 是“本课初稿”。接下来建立你自己的 p1-portfolio，后续开发和提交都在这个工程里进行。

1. 在刚弹出的 web-work 窗口里，双击 kit-01-v12。
2. 找到 starter 文件夹，单击选中，按 Ctrl+C 复制。只复制 starter，不复制整个 kit-01-v12。
3. 按 Alt+上方向键返回上一层 web-work。
4. 先看这里是否已有 p1-portfolio。如果已有，停止复制，打开原工程核对，保留之前的成果。
5. 首次且目标不存在时，按 Ctrl+V，把 starter 粘贴到 web-work。
6. 选中新粘贴的 starter，按 F2，把名称改成 p1-portfolio，按 Enter。

成功标志：web-work 里并列出现 kit-01-v12 和 p1-portfolio。前者用来领取和查材料，后者是自己的长期工程。不要把两个文件夹相互套在里面。

这一步复制 starter，会保留初稿中的 .github 发布配置，同时不会把 kit 外层老师的 .git 仓库历史复制进个人工程。个人 Git 仓库稍后按全流程手册首次初始化。

## 6. 用 VS Code 打开自己的工程

操作平台：Windows 桌面和 VS Code；本步骤用菜单打开文件夹。

1. 回 VS Code，点击“文件 → 打开文件夹”（File → Open Folder）。
2. 弹出窗口后，在上方地址栏输入以下地址并按 Enter。这是文件夹地址，不是终端命令。

```text
%USERPROFILE%\web-work\p1-portfolio
```

3. 点击“选择文件夹”。如果对话框没有展开 %USERPROFILE%，去普通文件夹窗口打开 p1-portfolio，按 Ctrl+L、Ctrl+C 复制真实地址，再粘贴到选择窗口。
4. 如果询问是否信任，核对确实是自己的课堂工程，再由你选择信任。

成功标志：VS Code 左边直接显示 index.html、styles.css、package.json、README.md 等。只看到一个 p1-portfolio 文件夹，说明打开的是上一级，需要重新选中里面的工程。

打开工程可能会重新加载 VS Code。再次点击“终端 → 新建终端”，选择 PowerShell。前面用于领取的终端到这里可以关闭，接下来只使用工程里的这一个终端。

## 7. 在工程里安装依赖并检查初稿

运行平台：Windows PowerShell。运行位置：VS Code 下方的工程终端，初始目录可以任意。运行方法：复制本代码框，粘贴后按 Enter。

```powershell
# 重新明确进入自己的工程，不依赖之前终端里的临时变量。
Set-Location (Join-Path $env:USERPROFILE 'web-work/p1-portfolio')
# 确认当前目录包含工程入口文件。
Test-Path ./package.json
```

成功标志：路径以 p1-portfolio 结尾，检查结果为 True。否则停止，回第 6 步检查打开的文件夹。

运行平台：Windows PowerShell。运行位置：同一个终端，p1-portfolio。运行方法：复制本代码框，粘贴后按 Enter，等待重新出现 PS 提示符。

```powershell
# 按 package-lock.json 约定的版本安装项目依赖。
# ci 是安装命令；第一次或依赖改变后执行，通常需要网络。
npm.cmd ci
```

成功标志：依赖安装成功结束。更新提醒或 funding 提示不代表失败；出现 npm ERR、npm error 或红色异常先停止，找出第一条错误。

运行平台：Windows PowerShell。运行位置：同一个终端，p1-portfolio。运行方法：粘贴下面代码框并按 Enter。

```powershell
# 检查初稿文件是否齐全；此时允许课堂 TODO 还没完成。
npm.cmd run check:starter
```

成功标志：起步检查通过。若失败，按错误信息核对文件，不跳过检查。

## 8. 启动网页

运行平台：Windows PowerShell。运行位置：同一个终端，p1-portfolio。运行方法：粘贴下面代码框，按 Enter，保持它运行。

```powershell
# 运行本地开发服务，终端持续占用是正常现象。
npm.cmd run dev
```

成功标志：出现 Local 地址，例如 http://127.0.0.1:5173/。复制终端实际显示的网址，粘贴到浏览器地址栏打开，看到“你好，我是林晓”的初稿。

此时不再出现新 PS 提示符，是因为网页服务正在运行。保持终端打开。不要把浏览器地址当成要在终端输入的命令。

## 9. 改一个名字，验证自己会操作

操作平台：VS Code 代码编辑区与浏览器。

1. 在 VS Code 左侧单击 index.html。
2. 按 Ctrl+F，搜索“你好，我是林晓”，按 Esc 退出搜索。
3. 选中代码里的“林晓”，换成自己的公开展示名，保留 h1 标签。
4. 按 Ctrl+S 保存，回浏览器按 Ctrl+R 刷新。

成功标志：网页出现新名字。随后进入第一课全流程手册第 5 步，按“原文、替换代码、检查结果”完成 HTML 与 CSS 任务。

## 10. 停止网页，在同一个终端检查和提交

操作平台：VS Code 下方 PowerShell 终端。运行方式：在正在运行网页的终端按 Ctrl+C。Windows 若继续询问是否终止批处理，输入 Y 并按 Enter。等 PS 提示符出现后，才能输入检查或 Git 命令。

运行平台：Windows PowerShell。运行位置：自己的 p1-portfolio。运行方法：完成本课代码后，粘贴本代码框并按 Enter。

```powershell
# 检查本课 HTML 等核心任务是否完成；缺少 TODO 对应实现时会失败。
npm.cmd run check:lesson
```

成功标志：本课验收通过。然后按全流程手册第 6—10 步完成测试、建自己的 Git 仓库、提交和推送。自己的 origin 应指向自己的 p1-portfolio，不是老师的 ffd-student-course-kit。

要再次启动网页，在同一个终端运行：

运行平台：Windows PowerShell。运行位置：自己的 p1-portfolio。运行方法：粘贴后按 Enter。

```powershell
# 再次启动本地网页，保存代码后回浏览器刷新查看。
npm.cmd run dev
```

## 备用：网络无法领取时使用 ZIP

课堂主流程使用 Git clone。网络故障时，老师可发送“P1_第一课_直接打开版.zip”。右键“全部解压缩”，把里面的 p1-portfolio 放到用户目录下 web-work，再从第 6 步继续。已有同名个人工程时不覆盖。ZIP 是临时领取方式，后续仍学习 Git 提交与推送。

## 给老师的检查点

第一轮停在步骤 4，确认每个人克隆成功并显示 True。第二轮停在步骤 6，确认 VS Code 左边打开正确工程。第三轮停在步骤 8，看见初稿后才进入代码教学。账号、Git、Node 安装和网络尽量课前准备。

第 2—6 课使用各自完整手册的领取、备份与导入流程，继续保留同一个个人 Git 历史。PPT 仍主导课堂顺序，实操手册负责说明具体怎么点、怎么输入和怎么检查。
