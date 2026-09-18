# 第15课｜P5 星声音乐站｜统一实操手册

日期：2026-09-18。每次3×45分钟。CMD与PowerShell合并，选择一种终端。功能基础完整，主文件：`src/stores/queueCore.js`。

## 课前环境准备

Windows 安装 Git、VS Code、Node.js 24.x（Windows Installer .msi），安装后关闭原终端重新打开。Win+R输入cmd回车；PowerShell从开始菜单搜索打开。命令不含提示符，逐行粘贴后回车。Node安装用官方页面选24.x，不使用Ubuntu默认旧版包。

[Node 官方下载](https://nodejs.org/en/download) / [Git 下载](https://git-scm.com/downloads) / [npm ci 说明](https://docs.npmjs.com/cli/v11/commands/npm-ci/)

## PPT 第1页：第15课 · 音乐队列与播放

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

相同曲目只加入一次；下一首可循环；合成音默认可播

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：按本页要求完成后，进入下一页。

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 2 页

## PPT 第2页：本课目标与时间安排

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

0—10：看效果、检查上次成果
10—25：必要概念与最小示范
25—60：任务 A、检查与补讲
60—100：任务 B，独立实操
100—135：验证、Git、发布与展示

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：按曲目ID去重；计算下一首索引

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 3 页

## PPT 第3页：今天的资源与修改位置

运行平台：**浏览器 / VS Code**。当前位置：**公开学生资源**。

领取目录：next-kit-v2/starter/lesson-15
个人工程：web-work/p5-work
重点文件：src/stores/queueCore.js
学生指南：next-kit-v2/docs/lesson-15.md
完整功能基础已提供，重点完成两项任务。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：按本页要求完成后，进入下一页。

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 4 页

## PPT 第4页：准备工程：CMD 路线

运行平台：**Windows CMD**。当前位置：**任意目录**。

Win+R → 输入 cmd → 回车。逐行执行；已有领取目录跳过 clone。

```bat
rem 下列命令在 CMD 逐行执行；先核对当前位置。
cd /d "%USERPROFILE%"
if not exist web-work mkdir web-work
cd web-work
if not exist p5-work xcopy "next-kit-v2\starter\lesson-15" "p5-work\" /E /I /H
cd p5-work
```

运行方法：命令逐行执行，检查结果后再继续。

成功标志：提示符末尾是 p5-work

排错：只选 CMD 或 PowerShell；原工程有未提交改动先保存提交。

CMD 完成后回到第 6 页

## PPT 第5页：准备工程：PowerShell 路线

运行平台：**Windows PowerShell**。当前位置：**任意目录**。

开始菜单 → 搜索 PowerShell → 打开。逐行执行；已有领取目录跳过 clone。

```powershell
# 下列命令在 PowerShell 逐行执行；先核对当前位置。
$courseRoot = Join-Path $env:USERPROFILE 'web-work'
New-Item -ItemType Directory -Force -Path $courseRoot
Set-Location -LiteralPath $courseRoot
if (!(Test-Path 'p5-work')) { Copy-Item 'next-kit-v2/starter/lesson-15' 'p5-work' -Recurse }
Set-Location 'p5-work'
```

运行方法：命令逐行执行，检查结果后再继续。

成功标志：当前位置是 p5-work

排错：只选当前终端路线；补丁检查失败停止，不强行覆盖。

PowerShell 完成后回到第 6 页

## PPT 第6页：安装依赖：只在个人工程运行

运行平台：**Windows CMD / PowerShell 通用**。当前位置：**自己的工程 p5-work**。

node 查看运行时；npm.cmd 避开 PowerShell 脚本策略；ci 按锁文件安装。

```text
node --version
npm.cmd --version
npm.cmd ci
```

运行方法：命令逐行执行，检查结果后再继续。

成功标志：Node 为24.x，ci退出无错误

排错：缺少 package.json：先检查当前位置；不要删锁文件改用 install。

完成后回到第 7 页

## PPT 第7页：终端 A：启动网页

运行平台：**Windows CMD / PowerShell 通用**。当前位置：**自己的工程 p5-work**。

VS Code 文件 → 打开文件夹；选自己的工程。终端 → 新建终端。

```text
npm.cmd run dev
```

运行方法：命令逐行执行，检查结果后再继续。

成功标志：浏览器打开 http://127.0.0.1:5173/

排错：A 保持运行；显示端口占用先 Ctrl+C 关闭旧项目。

完成后回到第 8 页

## PPT 第8页：本课只需网页终端

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

本课不启动独立 API。
终端 A 持续运行 Vite。
终端 B 用来测试、构建和 Git。
VS Code 文件修改后 Ctrl+S，浏览器自动更新。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：网页打开，编辑器显示自己的工程

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 9 页

## PPT 第9页：只讲三组核心知识

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

Pinia 共享状态
队列规则
来源适配与失败回退

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：学生能说出数据输入、关键变化和可见结果

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 10 页

## PPT 第10页：任务 A：按曲目ID去重

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

打开 src/stores/queueCore.js
搜索 TODO-A 或任务 A 的注释。
找到占位实现，修改其对应内容。
保存，运行下面的成功检查。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：相同曲目只加入一次

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 11 页

## PPT 第11页：关键代码 A：写在文件中

运行平台：**VS Code 文件编辑区**。当前位置：**src/stores/queueCore.js**。

这是修改位置的准确代码；替换占位实现，保留周围结构。

```text
if (queue.some((track) => track.id === item.id)) return { queue, added: false }
```

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：代码保存在文件里，终端不输入 JS/Vue/SQL

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 12 页

## PPT 第12页：检查 A：用最小例子验证

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

目标：按曲目ID去重
先验证正常输入。
再检查空值或不匹配条件。
说明你修改了哪一行、为什么会改变结果。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：同桌能按步骤重现结果

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 13 页

## PPT 第13页：任务 B：计算下一首索引

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

继续编辑 src/stores/queueCore.js
搜索 TODO-B 或任务 B 的注释。
替换占位实现；保留任务 A 的成果。
做一个自己的内容或规则变式。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：相同曲目只加入一次；下一首可循环；合成音默认可播

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 14 页

## PPT 第14页：关键代码 B：写在文件中

运行平台：**VS Code 文件编辑区**。当前位置：**src/stores/queueCore.js**。

替换本任务对应代码；完成后验证两项功能没有互相破坏。

```text
return (currentIndex + 1) % length
```

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：任务 A/B 都完成，能够解释关键判断

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 15 页

## PPT 第15页：终端 B：验证与构建

运行平台：**Windows CMD / PowerShell 通用**。当前位置：**自己的工程 p5-work**。

check 检查结构；test 运行既有测试；build生成dist。逐条执行，前一条成功再继续。

```text
npm.cmd run check
npm.cmd test
npm.cmd run build
```

运行方法：命令逐行执行，检查结果后再继续。

成功标志：检查、测试、构建均通过

排错：起点中的任务测试可能失败；完成后应通过。不为过关删掉断言。

完成后回到第 16 页

## PPT 第16页：保存自己的工程版本

运行平台：**Windows CMD / PowerShell 通用**。当前位置：**自己的工程 p5-work**。

status 看文件；diff 看改动；add 暂存；commit 保存本地；push 上传自己的仓库。

```text
git status
git diff
git add .
git commit -m "第15课：按曲目ID去重与计算下一首索引"
git push
```

运行方法：命令逐行执行，检查结果后再继续。

成功标志：自己的远程提交记录更新

排错：首次 git init、身份和 origin 绑定详见统一手册；不要 push 教师资源仓库。

完成后回到第 17 页

## PPT 第17页：部署并检查同一个网址

运行平台：**浏览器 / VS Code**。当前位置：**自己的托管平台 / Ubuntu**。

静态页面：build 后部署 dist，网址以后继续更新。
动态接口：不能只上传 dist，按 Ubuntu 手册部署 API。
本项目教师示例是观察成品，不是学生交作业网址。
发布后检查主路径、失败路径和手机显示。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：提交自己的网址与功能说明

排错：确认改的是个人工程，保存后检查第一条错误。

完成后回到第 18 页

## PPT 第18页：展示、解释与退出条

运行平台：**浏览器 / VS Code**。当前位置：**自己的工程 p5-work**。

展示今天的一个真实变化。
指出文件和 Git 提交编号。
解释一处条件、数据或状态变化。
写下一个错误以及如何修复。
记录下一课从哪一个版本继续。

运行方法：按本页任务编辑指定文件，Ctrl+S保存，回浏览器检查。

成功标志：页面结果、关键代码解释、个人commit齐全

排错：确认改的是个人工程，保存后检查第一条错误。

本课完成，保存当前工程

## 每条命令的意思

- `cd /d`：CMD中同时切换盘符和目录；`Set-Location`：PowerShell切换目录；路径加引号支持空格。
- `mkdir` / `New-Item`：建立工作目录；不会删除已有内容。
- `git clone --branch 固定标签 --depth 1 地址 目录`：领取固定资源到独立目录；detached HEAD是正常领取提示。已有next-kit-v2不重复clone。
- `if not exist` / `Test-Path`：检查工程是否已存在；已有工程不重复复制。
- `xcopy /E /I /H`：复制子目录、按文件夹处理目标、包含隐藏文件；`Copy-Item -Recurse`作用相同。领取文件不含.git。
- `git apply --check`：只检查补丁是否适用；`git apply`：应用老师提供的下一课结构升级。检查失败先停止，再按升级附录定位差异。
- `node --version` / `npm.cmd --version`：检查运行时和包管理器。
- `npm.cmd ci`：按package-lock.json安装依赖。升级锁文件后必须重新ci。
- `npm.cmd run dev`：启动网页服务，A终端持续运行；`npm.cmd run dev:api`：启动后端，B终端持续运行。
- `node tools/prepare-env.mjs`：只在.env不存在时生成本机配置，随机生成会话密钥和初始密码；已有.env保持原样。
- `npm.cmd run check`：结构检查；`npm.cmd test`：自动验证；`npm.cmd run build`：生成dist静态目录。
- `git status`：状态；`git diff`：未暂存改动；`git add .`：暂存本工程；`git commit -m`：本地保存；`git push`：上传个人远程。

## 两个终端如何操作

VS Code顶部菜单“终端→新建终端”建立A，执行网页命令。再点“终端→新建终端”建立B。每个终端先核对提示符目录。动态课B启动API后，再新建C用于测试和Git。服务正在运行时不能直接输入其他命令；Ctrl+C结束服务，或使用C。结束一个项目再启动下一个，避免端口冲突。

## 首次创建自己的远程仓库

只在每个新项目第一次做。GitHub登录自己的账号→右上角+→New repository→填写项目名→Public→不勾README/.gitignore/license→Create。网页复制自己的HTTPS仓库URL，不用教师仓库URL。

Windows CMD：个人工程目录运行，输入自己的身份及URL：
```bat
rem 身份用于提交记录，并不是账号登录密码。
git init -b main
set /p studentName=Your name:
set /p studentEmail=Your email:
git config user.name "%studentName%"
git config user.email "%studentEmail%"
git add .
git commit -m "建立个人项目工程"
set /p studentRepo=Your repository HTTPS URL:
git remote add origin "%studentRepo%"
git push -u origin main
```

Windows PowerShell：
```powershell
# 身份用于提交记录；浏览器登录由Git Credential Manager处理。
git init -b main
$studentName = Read-Host 'Your name'
$studentEmail = Read-Host 'Your email'
git config user.name $studentName
git config user.email $studentEmail
git add .
git commit -m "建立个人项目工程"
$studentRepo = Read-Host 'Your repository HTTPS URL'
git remote add origin $studentRepo
git push -u origin main
```

init建立个人仓库；config只配置本工程；remote绑定自己的地址；push -u首次绑定main上游。弹出浏览器时登录本人GitHub账号。不把密码写进命令。已有.git或origin时先git remote -v检查，不重复初始化、不强行覆盖。

## 完整代码与修改范围

本课完整学生工程：`starter/lesson-15`；教师完整答案在教师包。差异文件只列今天两处变化。学习者只补任务对应实现，其他模块逐步调用与理解。

