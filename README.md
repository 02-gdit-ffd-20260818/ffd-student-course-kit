# 项目 1 · 第 06 课课堂操作手册

## 测试、修复与最终发布

课堂统一使用 Trae IDE。一次课共 3×45 分钟。第三个课时教师最多讲 15 分钟，至少留 30 分钟给学生完成、推送、部署和交作业。

效果参考：https://ffd-p1-web-v2-20260918.netlify.app/lesson-06/

本课主要文件：`课堂操作手册中的验收项和实际修复文件`。本课目标：完成交叉测试、问题记录、修复、重测和最终部署。

## 一、上课只使用这一个入口

学生进入本课工程后只阅读本 `README.md`。教师答案统一放在 `教师答案/lesson-06/README.md`。

## 二、3×45 分钟安排

| 课时 | 教师与学生安排 | 结果 |
|---|---|---|
| 第 1 个 45 分钟 | 教师展示效果和启动方法；学生选择路线、克隆、用 Trae 打开并本地运行 | 本地工程可用 |
| 第 2 个 45 分钟 | 教师讲核心代码；学生完成任务 A、B，建立本课仓库并开启 Pages | 主要功能完成 |
| 第 3 个 45 分钟前 15 分钟 | 教师只复盘验收、Git 和部署，不再增加新知识 | 学生明确交付 |
| 第 3 个 45 分钟后 30 分钟 | 学生补完、测试、commit、push、检查 Pages、交作业 | 完成线上交付 |

## 三、选择启动路线

# 项目 1 · 第 06 课双入口启动

无论从哪条路线开始，最终都在独立目录 `p1-lesson-06` 中开发，并推送到本课新仓库 `p1-lesson-06-学号`。

## 路线 A：以上次自己的作品为基础

适合已经完成第 05 课并希望保留个人修改的学生。下面以学生上次仓库 `p1-lesson-05-学号` 为例。

### Windows CMD

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
cd /d "%USERPROFILE%\Desktop\web-work"
git clone https://github.com/你的用户名/p1-lesson-05-学号.git p1-lesson-06
cd /d "p1-lesson-06"
git remote rename origin previous
git branch -M main
```

### Windows PowerShell

```powershell

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone https://github.com/你的用户名/p1-lesson-05-学号.git p1-lesson-06
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-06')
git remote rename origin previous
git branch -M main
```

`previous` 保留上次仓库来源。不要把本课结果推回 `previous`，这样第 05 课的网站和提交不会被覆盖。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
cd /d "%USERPROFILE%\Desktop\web-work"
git clone --branch p1-l06-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-06
cd /d "p1-lesson-06"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone --branch p1-l06-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-06
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-06')
git remote rename origin course
git branch -M main
```

教师模板已经包含本课所需的前置效果，不要求补做缺席课程。

## 两条路线共同的后续步骤

1. 在 GitHub 新建空的公开仓库 `p1-lesson-06-学号`，不要勾选 README。
2. 连接本课新仓库：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-06-学号.git
git push -u origin main
git remote -v
```

3. 开发完成后正常执行 `git add`、`git commit`、`git push`。
4. 在本课新仓库开启 GitHub Pages。

## 远程名称检查

- 路线 A：`previous` 指向学生上次仓库，`origin` 指向本课新仓库。
- 路线 B：`course` 指向教师模板仓库，`origin` 指向本课新仓库。

这样既能继承学生上次作品，也能保证每次课的代码、提交和部署互不覆盖。

路线 A 直接使用第 5 课完整工程，不需要额外领取代码文件。

## 四、使用 Trae IDE

1. 打开 Trae IDE，选择“打开文件夹 / Open Folder”。
2. 打开 `%USERPROFILE%\Desktop\web-work\p1-lesson-06`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

统一启动方式：`npx live-server --port=7000 --host=0.0.0.0`，打开 http://127.0.0.1:7000/，停止按 `Ctrl+C`。

## 五、本课任务

# 第06课任务：测试发布与Vue过渡

本课效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-06/

## 任务 A：交叉测试与修复

两人交换网址，按本手册“下课前验收”项目检查。

检查资料、图片、链接、窄屏、导航、数组。

记录一个可重现问题：步骤、现象、文件。

修复后按同样步骤重测。

成功标志：问题记录具体；修复提交说明原因和结果。

## 任务 B：完整发布

完成 README 与检查单。

检查 git diff，提交并推送 main。

打开 Pages 确认部署成功。

换设备查看；再发布一个可辨认的小改动。

成功标志：同一个网址更新；最终提交有日期和功能说明。

## 交付

运行截图、个人提交编号、线上网址（发布课）、一句代码解释。遇到故障写明命令、目录和完整错误，不只写“运行不了”。

## 六、保存、推送与部署

在 Trae 内置终端先运行 `git status` 和 `git diff`。确认没有密码、临时文件和无关文件后：

```text
git add .
git commit -m "完成项目1第06课"
git push
git log -1 --oneline
```

GitHub Pages：`Settings → Pages → Deploy from a branch → main → /(root) → Save`。

## 七、交作业

提交姓名、学号、Git 提交编号、GitHub 仓库地址、GitHub Pages 地址和一句代码解释。

## 八、缺课补做

没有个人项目时直接走路线 B。教师模板已经包含本课需要的前置效果，不要求先补缺席课程。

## 九、常见故障

- `destination path already exists`：改用新的空目录。
- `fatal: not a git repository`：先进入本课目录。
- Trae 看不到文件：确认打开的是 `p1-lesson-06`。
- 页面没变化：确认 `Ctrl+S`，再按 `Ctrl+F5`。
- `git push` 没有上游：运行 `git push -u origin main`。
- Pages 404：检查 Public、main、`/(root)` 和根目录 `index.html`。

## 命令逐项解释（课堂必须讲清楚）

所有项目统一放在桌面：`C:\Users\当前用户名\Desktop\web-work`。例如用户名是 HUAWEI，实际路径就是 `C:\Users\HUAWEI\Desktop\web-work`。命令使用 `%USERPROFILE%` 或 `$env:USERPROFILE`，可以自动适应不同用户名。

### 建立桌面工作区

CMD：

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
mkdir "%USERPROFILE%\Desktop\web-work" 2>nul
cd /d "%USERPROFILE%\Desktop\web-work"
dir
```

PowerShell 或 Trae 终端：

```powershell

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Desktop\web-work"
Set-Location "$env:USERPROFILE\Desktop\web-work"
Get-Location
```

| 命令 | 为什么执行 | 成功标志 |
|---|---|---|
| `mkdir` / `New-Item` | 在桌面建立唯一的项目总目录；以后学生知道去哪里找代码 | 桌面出现 `web-work` |
| `2>nul` | CMD 中隐藏“目录已经存在”的多余提示，不会删除已有文件 | 命令继续执行 |
| `cd /d` | CMD 中进入目录；`/d` 允许同时切换盘符 | 提示符末尾为 `Desktop\web-work>` |
| `Set-Location` | PowerShell 中进入目录，与 `cd` 作用相同 | 当前路径改变 |
| `dir` / `Get-Location` | 检查当前文件列表或绝对路径，防止在错误目录执行 Git | 路径包含 `Desktop\web-work` |

### 克隆命令

```bash

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
git clone --branch 本课分支 --single-branch 仓库网址 本课文件夹
```

- `git clone`：下载代码以及 Git 版本历史。
- `--branch`：指定本课模板分支，防止拿错课次。
- `--single-branch`：只下载该课分支，减少无关内容。
- 最后的文件夹名：规定项目在桌面的保存位置，不覆盖其他课次。

### 统一启动命令

```bash

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
npx live-server --port=7000 --host=0.0.0.0
```

- `npx`：临时下载并运行工具，不需要在学生项目中保存 `node_modules`。
- `live-server`：把当前文件夹作为静态网站运行，保存代码后通常自动刷新。
- `--port=7000`：六次课统一使用 7000 端口。
- `--host=0.0.0.0`：监听本机网络接口；本机浏览器仍打开 `http://127.0.0.1:7000`。
- 第一次提示安装时输入 `y` 并回车；停止服务时按 `Ctrl+C`。

### Git 提交命令

```bash

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
git remote -v
git status
git add .
git commit -m "说明本次完成了什么"
git push
```

| 命令 | 含义 |
|---|---|
| `git remote -v` | 检查将要推送到哪个仓库，防止推到教师仓库 |
| `git status` | 查看修改、暂存和未跟踪文件 |
| `git add .` | 把当前项目中的修改加入下一次提交 |
| `git commit -m` | 建立带说明、可回退的本地版本 |
| `git push` | 把本地提交发送到个人远程仓库 |

从教师模板开始的学生先在 GitHub 或 Gitee 建立空仓库，再执行：

```bash

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
git remote rename origin teacher
git remote add origin <自己的空仓库网址>
git branch -M main
git push -u origin main
```

`rename` 保留教师地址供查看；`add origin` 把默认推送目标改成学生自己的仓库；`-u` 建立后续默认跟踪关系。

## 本课4个交付任务的前后变化与工程含义

1. **问题记录**：操作前只有“不能用”；补齐重现步骤、预期、实际、浏览器和文件后，别人可以复现。
2. **最小修复**：只改与问题直接相关的代码并写原因注释；便于测试、审查和回退。
3. **回归测试**：重新检查资料、图片、链接、手机布局、导航、作品数据和 Console；确保修复没有破坏旧功能。
4. **最终发布**：执行 add、commit、push，再刷新线上网址；操作后远程提交与部署页面一致。

本课不设置为了填空而填空的代码 TODO，重点是完整的软件测试、版本和交付闭环。

## 零基础测试、Git 与发布术语表

- “重现步骤”是让别人从同一起点稳定看到问题的操作顺序；只写“页面坏了”无法定位。
- “预期结果”是本来应该发生什么，“实际结果”是现在真正发生什么，两者差异就是待修问题。
- “最小修复”只修改与故障直接相关的代码，便于理解、测试和必要时撤销。
- “回归测试”是在修复后重新检查原有功能，确认新修改没有破坏以前正确的部分。
- `git status` 查看哪些文件改变；`git diff` 查看具体改了哪些行；二者都不会上传代码。
- `git add .` 把当前修改放入暂存区；`git commit` 建立本地版本；`git push` 才把提交发送到远程仓库。
- `commit` 是可追踪的版本记录，`push` 是传输动作，GitHub Pages 部署则把仓库内容发布成网站，三者不是同一步。
- 浏览器 Console 的红色信息通常包含文件名、行号和错误原因，记录完整信息再修改。
