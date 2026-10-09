# 项目 1 · CI/CD 快速体验（成品版）

> **这一份不是一次正式课，没有任何任务要做。**
> 它是第 06 课的**配套预演**：用一份**已经做完、确认没问题**的成品代码，
> 从零到线上完整跑一遍 CI/CD，**十五到二十分钟**就能看到自己的网址活起来。

## 这份文档解决什么问题

第 06 课的六个 TODO 里，有两个是**故意让你把东西弄坏**的：

|第 06 课|它在干什么|
|---|---|
|TODO 02|故意改坏一处，看自检脚本打出红色 `[X]`|
|TODO 07|**故意推一个坏引用上去**，看 GitHub 上出现红叉和邮件通知|

这么设计是对的——**红叉长什么样、日志在哪里看，只有亲手弄坏一次才记得住**。

但它带来一个副作用：**你在课堂上看到的红叉，分不清是"故意弄的"还是"自己搞砸的"。**
第一次接触 CI/CD 的人很容易被这一路的红色劝退，
最后也没能完整看到「推代码 → 自动检查 → 自动发布 → 网址能打开」这条链路跑通的样子。

**所以先用这一份**：

```text
这一份（成品版）：从头到尾全绿，先看清楚"顺利的时候是什么样"
        ↓
第 06 课：自己动手，故意弄坏再修好，看清楚"出问题的时候是什么样"
```

**先见过对的，才认得出错的。**

## 你会得到什么

- 一个**属于你自己的公网网址**，形如 `https://你的用户名.github.io/p1-homepage/`，
  手机上也能打开，可以直接发给别人；
- 仓库页面上每条提交旁边的**绿色对勾**；
- 一次完整的「改一个字 → 推上去 → 自动重新发布」的体验。

**本课程效果参考**：<https://ffd-p1-web-v2-20260918.netlify.app/lesson-06/>

## 什么时候做

|时机|怎么用|
|---|---|
|**第 05 课下课前的最后 15 分钟**|教师演示一遍，学生跟着做，第 06 课上来就不陌生（**推荐**）|
|第 06 课开头|作为热身，做完再进正课的六个 TODO|
|课后自己补|缺课、或者课上被红叉卡住了，回来重走一遍顺利的路|

**做完这一份不影响第 06 课**——它用的是一个**单独的文件夹**，
不会动你自己那份正在做的工程。

## 0. 开课前先自检

**Windows CMD**

```bat
REM 这一份需要 Git（推代码）和 Node（跑自检脚本）
git --version
node -v
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`node` 在终端运行 JavaScript；后接文件路径就是执行该文件；`-v` 只显示版本；`-e` 执行后面引号内的代码；`--check` 只检查语法；`--watch` 监测文件变化并重启。`console.log(...)` 把括号内的结果打印出来，函数调用的参数写在括号里，多个参数用逗号分开。

`git` 管理版本；`status` 查看改动；`diff` 查看逐行差异；`add` 选择待提交文件；`commit -m` 创建本地版本并写说明；`push` 发到远端；`clone` 下载仓库，`--branch` 选择分支，`--single-branch` 只取该分支历史；`remote` 管理远端别名，`fetch` 只取回记录。命令中的 `.` 表示当前目录，`--` 后面是文件路径。推送前用 `git remote -v` 核实 origin 是自己的仓库。
<!-- COMMAND_HELP:END -->


**Windows PowerShell**

```powershell
git --version
node -v
```

|命令|要看到什么|打不出来怎么办|
|---|---|---|
|`git --version`|版本号|到 <https://git-scm.com/> 安装，**装完关掉所有终端重开**|
|`node -v`|**`v24.` 开头**|到 <https://nodejs.org/> 装 Node 24 LTS，同样要重开终端|

还要确认两件事：

- **GitHub 账号已注册并登录**（没有就去 <https://github.com/> 注册，一分钟）；
- **Git 里配好了自己的名字和邮箱**，否则提交会被拒：

```bat
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 1. 领取成品代码

这一份用的是**专门的成品分支 `p1-final-cicd`**：
它就是第 06 课全部做完之后的样子，**里面没有任何要你填的空，也没有埋任何坑**。

> 下面 CMD 和 PowerShell 两套命令**效果完全一样，选一套执行就行**。
> Trae IDE 内置终端默认是 PowerShell，Windows 的"命令提示符"是 CMD。
> 不确定自己在哪一个：输入 `$PSVersionTable`，
> **能打印出表格的是 PowerShell，报错的是 CMD**。

**Windows CMD**

```bat
REM 1) 回到桌面，确保工作区文件夹存在再进去
cd /d "%USERPROFILE%\Desktop"
if not exist "web-work" mkdir "web-work"
cd /d "%USERPROFILE%\Desktop\web-work"

REM 2) 克隆成品分支
REM    --branch p1-final-cicd  只要这一个分支
REM    --single-branch         只下它的历史，不下仓库里其它几十个分支
REM    最后的 p1-cicd-demo     是新建的文件夹名
git clone --branch p1-final-cicd --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-cicd-demo
cd /d "%USERPROFILE%\Desktop\web-work\p1-cicd-demo"

REM 3) 把来源改名成 template
REM    origin 指的是全班共用的教师模板仓库，**不改名的话 git push 会默认推到那里去**
git remote rename origin template
git branch -M main

REM 4) 确认到位：这四样都要在
dir index.html
dir tools
dir /a .github
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`cd` / `Set-Location` 切换终端当前目录；含空格的路径用引号包起来。CMD 的 `/d` 同时切换盘符；PowerShell 用 `Set-Location "路径"`，不加 `/d`。
<!-- COMMAND_HELP:END -->


**Windows PowerShell**

```powershell
# 1) 回到桌面，确保工作区文件夹存在再进去
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop')
New-Item -ItemType Directory -Force -Path 'web-work' | Out-Null
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')

# 2) 克隆成品分支
git clone --branch p1-final-cicd --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-cicd-demo
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-cicd-demo')

# 3) 把来源改名成 template，它不能推
git remote rename origin template
git branch -M main

# 4) 确认到位
Get-ChildItem index.html
Get-ChildItem tools
Get-ChildItem .github -Force
```

> **`.github` 前面有个点，是隐藏目录**，所以要加 `/a`（CMD）或 `-Force`（PowerShell）
> 才看得见。很多人在这里以为没领到。

|要看到|说明|
|---|---|
|`index.html`|网页本身|
|`tools\check-page.mjs`|自检脚本（CI 要跑它）|
|`.github\workflows\pages.yml`|**工作流配置，整件事的核心**|

**四样有任何一样看不到，就不要往下走。**

### 领取失败怎么办

|现象|原因|处理|
|---|---|---|
|`系统找不到指定的路径`|工作区文件夹还没建|第 1 步的 `mkdir` 那行不能跳过|
|`fatal: destination path already exists`|文件夹已经建过了|换个名字，或先删掉原来那个|
|`couldn't find remote ref`|分支名打错了|对照 `p1-final-cicd`，一个字符都不能差|
|`dir .github` 说找不到|忘了加 `/a`，隐藏目录看不见|用 `dir /a .github`|
|`fatal: unable to access`|连不上 GitHub|换网络重试|

## 2. 先在本机看一眼：页面和自检

### 第一步：启动本地服务器，确认页面是好的

**Windows CMD**

```bat
npx live-server --port=7000 --host=0.0.0.0
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`npx` 运行项目或临时下载的命令行工具；第一次使用可能需要联网确认安装。`--port` 是监听端口，`--host` 是监听地址；0.0.0.0 允许网络接口接入，不能把它直接当成别人访问你电脑的网址。
<!-- COMMAND_HELP:END -->


**Windows PowerShell**

```powershell
npx live-server --port=7000 --host=0.0.0.0
```

看到 `Ready for changes` 就算起来了，浏览器访问 <http://localhost:7000>。
**页面应该是完整的**——导航、头像、作品卡片、页脚都在。

看完**按 `Ctrl + C` 停掉它**，下一步要在同一个终端里敲命令。

> **代码里还写着 `TODO 01`…`TODO 07`，是不是还有活要干？**
> **不是。** 那是**答案里的小标题**，用来标出第 04 课那七个功能各自写在哪一段
> （进度条、栏目徽标、导航高亮、滚动监听……），方便你回头对照。
> **每一段下面的代码都是完整的**，这一份没有任何要填的空。
> 不信就照着第 3 节推上去——CI 会全绿，网页也完全正常。

> 命令里每个参数的意思、局域网访问、启动失败怎么办，
> 见[第 01 课手册](关联资料/02_教学资源包/02_项目1_个人主页_完整课堂包/实操手册/第01课_课堂操作手册.md)第 3 节。

### 第二步：在本机跑一次自检

```bat
node tools/check-page.mjs
```

这就是 **CI 在云端会跑的同一条命令**。终端里会打出四段检查：

```text
== 1. 必须有的文件 ==      index.html / styles.css / app.js 在不在
== 2. index.html 引用的本地文件 ==   每个 src、href 指向的文件是否真的存在
== 3. 页内锚点 ==          导航里每个 #xxx 是否真有对应的区块
== 4. 图片的 alt ==        每张图有没有写替代文字，写得够不够具体

自检通过。
```

**全是绿色的 `[OK]`，最后一行「自检通过」。**

**再确认一下退出码**——这是 CI 判断成败的唯一依据：

**Windows CMD**

```bat
echo %ERRORLEVEL%
```

**Windows PowerShell**

```powershell
$LASTEXITCODE
```

**应该打印 `0`。** `0` 表示成功，非 0 表示失败。

> **这是理解 CI 的关键一步。**
> GitHub 不看你打印了什么漂亮的文字，**它只看退出码**：
> 0 就算通过，非 0 就算失败、立刻停下、标红叉。
> 第 06 课 TODO 02 会让你亲眼看到它变成 1。

## 3. 推到你自己的 GitHub 仓库

### 第一步：在 GitHub 上新建一个空仓库

1. 打开 <https://github.com/new>；
2. Repository name 填 **`p1-homepage`**；
3. 选 **Public**（**必须公开**，免费账号的私有仓库不能用 GitHub Pages）；
4. **不要**勾选 "Add a README file"、"Add .gitignore"、"Choose a license"——
   **一个都不要勾**；
5. 点 Create repository。

> **为什么一个都不能勾？** 勾了之后远端就已经有了一条提交，
> 和你本地的历史对不上，推的时候会报 `rejected ... fetch first`。
> 新手最常卡在这一步。

### 第二步：关联并推送

**Windows CMD**

```bat
REM 把你自己的仓库地址登记成 origin
git remote add origin https://github.com/你的用户名/p1-homepage.git

REM -u 的意思是"记住这个对应关系"，以后直接 git push 就行
git push -u origin main

REM 确认一下现在有哪几个远程仓库
git remote -v
```

**Windows PowerShell**

```powershell
git remote add origin https://github.com/你的用户名/p1-homepage.git
git push -u origin main
git remote -v
```

`git remote -v` 应该看到两个：
**`origin` 指向你自己的仓库**，`template` 指向公共模板仓库。

第一次推送会弹出登录窗口，用浏览器授权一次就行。

### 推送失败怎么办

|现象|原因|处理|
|---|---|---|
|`remote origin already exists`|之前加过了|`git remote set-url origin 你的地址` 改掉它|
|`rejected ... fetch first`|**建仓库时勾了 README**|删掉那个仓库重建，一个勾都别打|
|`Authentication failed`|没登录，或密码方式已废弃|用弹出的浏览器窗口授权；不要输 GitHub 密码|
|`repository not found`|地址里的用户名或仓库名打错了|`git remote -v` 看一眼实际登记的是什么|
|一直卡着不动|网络问题|换网络重试|

## 4. 打开 Pages 开关

**这一步只做一次，但不做的话后面一定失败。**

1. 打开你的仓库页面 → **Settings**（仓库自己的设置，不是账号设置）；
2. 左边栏找到 **Pages**；
3. **Source** 这一项，从 `Deploy from a branch` 改成 **`GitHub Actions`**；
4. 改完不用点保存，它自动生效。

> **为什么要改这一项？**
> 默认的 `Deploy from a branch` 是"直接把某个分支的文件当网站发出去"，
> 那样**不会经过任何检查**。
> 改成 `GitHub Actions` 之后，发布这件事交给我们的工作流——
> **先跑自检，通过了才发布**。这正是 CI/CD 的意义所在。

## 5. 看着它跑起来

### 第一步：触发一次运行

刚才推代码时其实已经触发过一次了。如果那时 Pages 开关还没打开，
现在手动再跑一次：

1. 仓库页面 → **Actions** 标签；
2. 左边点 **「检查并发布个人主页」**；
3. 右边点 **Run workflow** → 再点绿色的 **Run workflow** 按钮。

> 能手动触发，是因为工作流里写了 `workflow_dispatch:` 这一行。

### 第二步：看它一步步走完

点进正在跑的那条记录，**左边是两个任务**：

```text
check    ← 自检：跑 node tools/check-page.mjs
  ↓  needs: check（必须它成功，下面才开始）
deploy   ← 发布：打包整个目录，发到 GitHub Pages
```

点开 `check`，右边能看到每一步的日志，**展开最后一步**，
你会看到**和你在本机跑出来的一模一样的那串 `[OK]`**。

> **这一点值得停下来想一想**：
> 云端那台机器**从来没见过你的电脑**，它只有仓库里的代码，
> 却跑出了和你本机完全一样的结果。
>
> 这就是 CI 的全部意义——**"在我电脑上是好的"这句话从此失效。**

两个任务都变成**绿色对勾**，大约需要一到两分钟。

### 第三步：打开你的网址

`deploy` 任务跑完后，它下面会直接显示一个网址：

```text
https://你的用户名.github.io/p1-homepage/
```

**点开它。** 这就是你自己的公网页面了——
发给同学、发到群里、用手机打开，都能看。

> **第一次发布可能要多等一两分钟**才能访问，
> 打开是 404 就等等再刷新，这是正常的。

## 6. 体验完整的一次改动

**这一步才是 CI/CD 真正的日常。**

1. 用 Trae 打开 `p1-cicd-demo`，在 `index.html` 里**随便改一句自我介绍的文字**；
2. 提交并推送：

**Windows CMD**

```bat
git add .
git commit -m "改一句自我介绍，试一次自动发布"
git push origin main
```

**Windows PowerShell**

```powershell
git add .
git commit -m "改一句自我介绍，试一次自动发布"
git push origin main
```

3. 回到 **Actions** 标签——**一条新的运行自动开始了**，你什么都没点；
4. 等它两个任务都变绿（一到两分钟）；
5. **刷新你的网址**，刚才改的那句话已经在线上了。

```text
你改一个字 → git push → 自动检查 → 自动发布 → 公网上就是新的
```

**整个过程你没有碰过任何服务器，也没有手动上传过任何文件。**

> 线上没更新？**按 `Ctrl+F5` 强制刷新**，浏览器缓存了旧页面。

## 7. 自检清单

做完这一份，下面每一条都应该能打勾：

**本机**
- [ ] `node tools/check-page.mjs` 全绿，最后一行「自检通过」
- [ ] **退出码是 0**（`echo %ERRORLEVEL%` 或 `$LASTEXITCODE`）
- [ ] 本地服务器能打开完整的页面

**仓库**
- [ ] 代码推到了**自己的** `p1-homepage` 仓库
- [ ] `git remote -v` 里 `origin` 是自己的、`template` 是公共模板仓库
- [ ] Settings → Pages 的 Source 是 **GitHub Actions**

**流水线**
- [ ] Actions 页面有一条**全绿**的运行记录
- [ ] `check` 的日志里看得到和本机一样的 `[OK]`
- [ ] **两个任务的先后关系看明白了**：`deploy` 等 `check` 成功才开始

**线上**
- [ ] 自己的网址能打开，页面完整
- [ ] **手机上也能打开**（用手机流量试，证明它真的在公网上）
- [ ] 改一句话推上去，**网址上的内容自动变了**

**理解**
- [ ] 能说出 GitHub 凭什么判断一次检查是成功还是失败（**看退出码**）
- [ ] 能说出 Pages 的 Source 为什么要改成 GitHub Actions
- [ ] 能说出 `needs: check` 这一行去掉会有什么后果

## 8. 交给谁看

这一份**不单独计分**，但请留着，第 06 课交作业时一起交：

|项目|要求|
|---|---|
|本机证据|自检全绿 + 退出码为 0 的截图|
|流水线证据|Actions 页面**全绿**那条运行记录的截图（能看到 check 和 deploy 两个任务）|
|线上证据|**你自己的网址**，以及页面打开的截图|
|自动发布证据|改一句话之后，Actions 自动跑起来的截图|

## 接下来做什么

这一份看完，你已经见过**顺利的时候是什么样**了。

**接着去做[第 06 课](本课操作手册.md)**，那里会让你：

- 故意弄坏一处，**看红色的 `[X]` 和退出码 1**（TODO 02、03）；
- **给自检脚本加一条新检查**，让它能发现更多问题（TODO 04）；
- 故意推一个坏引用上去，**看 GitHub 的红叉和邮件通知**，再修好变绿（TODO 07）。

**这一份告诉你"对的时候长什么样"，第 06 课告诉你"错了怎么办"。
两样都会了，CI/CD 才算真的学会。**

## 本课课堂节奏与检查点

> 这一节是给教师控节奏用的，学生可以跳过。

### 十五分钟怎么分（推荐放在第 05 课下课前）

|时间（分钟）|做什么|
|---|---|
|0—2|**先打开教师自己的那个网址给全班看**，说一句"下课前你们每人都会有一个这样的地址"|
|2—5|学生克隆成品分支、本机跑一次自检（第 1、2 节）|
|5—9|建空仓库、推上去（第 3 节）。**这一段最容易卡，教师要巡场**|
|9—11|改 Pages 的 Source（第 4 节）。**全班一起做，逐个确认**|
|11—14|看着 Actions 跑完，打开自己的网址（第 5 节）|
|14—15|**当场把网址发到班级群里**，互相点开看|

**时间不够就砍第 6 节**（改一句话再推一次），让学生课后自己试。

### 三个最容易卡住的地方

|卡点|表现|提前说这一句|
|---|---|---|
|**建仓库时勾了 README**|推送报 `rejected ... fetch first`|"**一个勾都不要打**，Create repository 直接点"|
|**Pages 的 Source 没改**|`deploy` 任务报权限错误|"Settings → Pages → Source 改成 **GitHub Actions**，全班一起改，我一个个看"|
|**`.github` 没推上去**|Actions 页面是空的|"`.github` 前面有个点，是隐藏目录，`git status` 确认它在里面"|

**这三条在学生动手之前先讲，比事后救火省一半时间。**

### 逐段检查点

- [ ] 每个学生都克隆到了 `p1-final-cicd`，四样文件都在（含隐藏的 `.github`）
- [ ] 本机自检全绿，**并且看过退出码是 0**
- [ ] 学生能说出"GitHub 凭什么判断成败"——**看退出码，不看打印的文字**
- [ ] 每个人的仓库都是 **Public**（私有仓库免费账号发不了 Pages）
- [ ] **每个人的 Pages Source 都改成了 GitHub Actions**（逐个确认，这条最容易漏）
- [ ] Actions 里有一条**全绿**的运行，两个任务都有对勾
- [ ] 学生能说出 `needs: check` 的作用
- [ ] **每个人都打开过自己的网址**，最好用手机流量试一次
- [ ] 学生知道下一课会**故意弄坏东西看红叉**，那是设计好的，不是自己出错

### 教师自己要先做一遍

第一次带这个环节之前，**教师务必自己完整走一遍**，尤其是：

- 确认 `p1-final-cicd` 分支能正常克隆；
- 确认自己有一个**能当场展示的成品网址**（开场那两分钟要用）；
- 熟悉 Pages Source 那个下拉框在哪里——**学生一半的问题都在这一步**。

## 常见问题

### Actions 相关

|现象|原因|处理|
|---|---|---|
|Actions 页面是空的|**`.github` 目录没推上去**|`git status` 看有没有漏；`.github` 是隐藏目录，容易被忽略|
|`deploy` 报权限错误|**Pages 的 Source 没改成 GitHub Actions**|回第 4 节，改完重新 Run workflow|
|`deploy` 显示 skipped|`check` 失败了|`needs: check` 决定的，先把 check 修绿|
|`check` 失败但本地是好的|**有文件没提交**|CI 上只有仓库里的东西，`git status` 看漏了什么|
|一直排队不开始|GitHub 偶尔繁忙|等几分钟；或者点 Re-run|

### 网址相关

|现象|原因|处理|
|---|---|---|
|网址打开是 404|第一次发布还没生效|等一两分钟再刷新|
|一直 404|仓库是私有的|免费账号的私有仓库不能用 Pages，**改成 Public**|
|页面有内容但没有样式|路径大小写不对|**Linux 区分大小写，Windows 不区分**——`Styles.css` 和 `styles.css` 在线上是两个文件|
|图片裂了|同上，或者图片没提交|F12 → Network 看那条请求是不是 404|
|改了但线上没变|浏览器缓存|按 `Ctrl+F5` 强制刷新|

### 和自己那份工程的关系

|问题|回答|
|---|---|
|这个文件夹会影响我第 06 课的工程吗|**不会**，它是单独的 `p1-cicd-demo` 文件夹|
|做完能删掉吗|能。但建议留到第 06 课做完，可以对照着看|
|第 06 课还要再建一个仓库吗|**不用**，第 06 课用你自己那份工程和它已有的仓库|
|`p1-homepage` 这个仓库名会冲突吗|如果你自己的工程已经用了这个名字，这一份就换一个，比如 `p1-cicd-demo`|

更多通用排错见 [通用附录_运行与排错.md](本项目运行与排错.md)；
CI/CD 的完整入门见 [CI-CD 与部署配置](<通用/05_CI-CD与部署配置.md>)；
命令和参数的逐条解释见 [命令参数逐个拆开](<通用/04_命令参数逐个拆开.md>)。
