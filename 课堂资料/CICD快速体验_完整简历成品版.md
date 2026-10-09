# 项目 1 · CI/CD 快速体验（完整简历成品版）

> **这一份不是一次正式课，没有任何任务要做，也没有任何坑。**
> 它和[CI/CD 快速体验（成品版）](<CICD快速体验_成品版.md>)是**同一件事、换一份案例**：
> 那一份用的是课堂练习页，这一份用的是**教师本人真实在用的完整简历**。
>
> 十五到二十分钟，从零到线上完整跑一遍 CI/CD。

## 两份快速体验，选哪一份

|  |[成品版](<CICD快速体验_成品版.md>)|**完整简历成品版（本篇）**|
|---|---|---|
|用的代码|课堂练习页（第 06 课做完的样子）|**教师真实在用的个人学术主页**|
|分支|`p1-final-cicd`|**`p1-final-resume`**|
|体量|`index.html` 约 200 行|**约 730 行，assets 有 2MB**|
|内容|示例文字和占位图|**真实的经历、论文、获奖、作品、照片**|
|适合|第 05 课下课前，跟着课堂练习页走一遍|**想看"真东西长什么样"，或者直接拿它当自己简历的底子**|

**两份的 CI/CD 流程完全一样。** 做过一份，另一份十分钟就能走完。

**只做一份的话，推荐这一份**——因为你最后要交的是**自己的简历**，
拿一份真实的完整简历当参照，比看练习页有用得多。

## 这份代码有什么不一样

它是一份**真的在用**的学术主页，不是为了教学编出来的：

|部分|里面有什么|
|---|---|
|`index.html`|**约 730 行**。八个栏目：关于、经历、项目、技能、作品、教学、论文、联系|
|`styles.css`|210 行。**自定义字体**（思源宋体子集）、响应式布局、打印样式|
|`app.js`|28 行。导航当前项高亮 + `aria-current` 无障碍标注|
|`assets/`|**2MB**。照片、四张作品截图、两个字体文件、字体许可证|
|`_headers`|`noindex, nofollow` 等安全响应头|
|`tools/check-page.mjs`|自检脚本（CI 要跑它）|
|`.github/workflows/pages.yml`|**工作流配置，整件事的核心**|

### 三个值得看一眼的细节

**1. `assets/OFL-NotoSerifSC.txt` —— 字体的许可证也要带上**

这个目录里躺着一份字体许可证原文。**不是多余的**：
思源宋体用的是 SIL OFL 协议，**允许你免费商用，但要求随字体附上许可证**。

> 用别人的字体、图片、图标，**第一件事是看它的许可证允许你做什么**。
> 「网上能搜到」不等于「可以用」。这一条在
> [评分量规与通用清单](<通用/07_评分量规与通用清单.md>)的版权检查里也有。

**2. `_headers` —— 这份页面不想被搜索引擎收录**

```text
/*
  X-Robots-Tag: noindex, nofollow
```

个人简历带着照片和联系方式，**教师本人选择不让它进搜索结果**。

**注意一件事**：`_headers` 是 **Netlify 的写法，GitHub Pages 不认它**。
在 GitHub Pages 上要靠 `index.html` 里那行 `<meta name="robots" content="noindex, nofollow">`——
**这一份两样都写了**。

> 你自己的简历要不要 `noindex`，自己决定。
> 想让招聘的人搜到就去掉，只想发给特定的人就留着。
> **但要知道它在哪里、怎么改。**

**3. `app.js` 只有 28 行，但每一段都有注释**

```js
// 3. 监听事件：点击锚点、浏览器前进或后退改变 # 时，重新更新。
window.addEventListener('hashchange', updateNavigation);

// 4. 首次打开也执行一次，支持直接访问带 # 的链接。
updateNavigation();
```

**第 4 步最容易漏**：只监听 `hashchange` 的话，
别人把 `...#publications` 这个链接直接发给你，打开时导航是不高亮的。
**第 04 课的 TODO 04 讲的就是这件事**，这里是它在真实页面里的样子。

## 你会得到什么

- 一个**属于你自己的公网网址**，形如 `https://你的用户名.github.io/my-resume/`；
- 仓库页面上每条提交旁边的**绿色对勾**；
- 一份**可以直接改成自己简历**的完整底子。

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

- **GitHub 账号已注册并登录**（没有就去 <https://github.com/> 注册）；
- **Git 里配好了自己的名字和邮箱**，否则提交会被拒：

```bat
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 1. 领取完整简历

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

REM 2) 克隆完整简历分支
REM    --branch p1-final-resume  只要这一个分支
REM    --single-branch           只下它的历史，不下仓库里其它几十个分支
REM    最后的 my-resume          是新建的文件夹名
git clone --branch p1-final-resume --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git my-resume
cd /d "%USERPROFILE%\Desktop\web-work\my-resume"

REM 3) 把来源改名成 template
REM    origin 指的是全班共用的教师模板仓库，**不改名的话 git push 会默认推到那里去**
git remote rename origin template
git branch -M main

REM 4) 确认到位：这四样都要在
dir index.html
dir assets
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

# 2) 克隆完整简历分支
git clone --branch p1-final-resume --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git my-resume
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\my-resume')

# 3) 把来源改名成 template，它不能推
git remote rename origin template
git branch -M main

# 4) 确认到位
Get-ChildItem index.html
Get-ChildItem assets
Get-ChildItem tools
Get-ChildItem .github -Force
```

> **`.github` 前面有个点，是隐藏目录**，所以要加 `/a`（CMD）或 `-Force`（PowerShell）
> 才看得见。很多人在这里以为没领到。

**这一份带着 2MB 的图片和字体，克隆会比前几课慢一些**，等十几秒是正常的。

`assets` 里应该有 **9 个文件**：照片 1、作品截图 4、字体 2、字体许可证 1、网站图标 1。

**四样有任何一样看不到，就不要往下走。**

### 领取失败怎么办

|现象|原因|处理|
|---|---|---|
|`系统找不到指定的路径`|工作区文件夹还没建|第 1 步的 `mkdir` 那行不能跳过|
|`fatal: destination path already exists`|文件夹已经建过了|换个名字，或先删掉原来那个|
|`couldn't find remote ref`|分支名打错了|对照 `p1-final-resume`，一个字符都不能差|
|`dir .github` 说找不到|忘了加 `/a`，隐藏目录看不见|用 `dir /a .github`|
|克隆很慢或中断|这份有 2MB 素材|换网络重试；`--single-branch` 已经把下载量压到最小了|

## 2. 先在本机看一眼：页面和自检

### 第一步：启动本地服务器

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

**花两分钟把这个页面从头翻到尾**，八个栏目都看一遍。
**这就是你这门课最后要交出来的东西的样子。**

再试三件事：

1. **点顶部导航的不同栏目** → 当前那一项会高亮（`app.js` 干的活）；
2. **把窗口拉到很窄** → 布局会变成单列（`styles.css` 里的响应式）；
3. **按 `Ctrl+P` 打开打印预览** → **排版是干净的**，没有导航条和多余背景。
   这是 `styles.css` 末尾那段 `@media print` 的功劳——
   **简历是会被打印出来的**，这一段值得看一眼。

看完**按 `Ctrl + C` 停掉服务**，下一步要在同一个终端里敲命令。

> 命令里每个参数的意思、局域网访问、启动失败怎么办，
> 见[第 01 课手册](本课操作手册.md)第 3 节。

### 第二步：在本机跑一次自检

```bat
node tools/check-page.mjs
```

这就是 **CI 在云端会跑的同一条命令**。它检查四件事：

```text
== 1. 必须有的文件 ==      index.html / styles.css / app.js 在不在
== 2. index.html 引用的本地文件 ==   每个 src、href 指向的文件是否真的存在
== 3. 页内锚点 ==          导航里每个 #xxx 是否真有对应的区块
== 4. 图片的 alt ==        每张图有没有写替代文字，写得够不够具体

自检通过。
```

**这份简历引用的文件比练习页多得多**——照片、四张截图、两个字体文件，
**少一个就发不出正确的页面**。这正是第 2 项要替你盯住的事。

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

## 3. 推到你自己的 GitHub 仓库

### 第一步：在 GitHub 上新建一个空仓库

1. 打开 <https://github.com/new>；
2. Repository name 填 **`my-resume`**（已经做过另一份快速体验的话，别和那个重名）；
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
git remote add origin https://github.com/你的用户名/my-resume.git

REM -u 的意思是"记住这个对应关系"，以后直接 git push 就行
git push -u origin main

REM 确认一下现在有哪几个远程仓库
git remote -v
```

**Windows PowerShell**

```powershell
git remote add origin https://github.com/你的用户名/my-resume.git
git push -u origin main
git remote -v
```

`git remote -v` 应该看到两个：
**`origin` 指向你自己的仓库**，`template` 指向公共模板仓库。

**这一份要推 2MB 素材，会比练习页慢几秒**，进度条走完就好。

### 推送失败怎么办

|现象|原因|处理|
|---|---|---|
|`remote origin already exists`|之前加过了|`git remote set-url origin 你的地址` 改掉它|
|`rejected ... fetch first`|**建仓库时勾了 README**|删掉那个仓库重建，一个勾都别打|
|`Authentication failed`|没登录，或密码方式已废弃|用弹出的浏览器窗口授权；不要输 GitHub 密码|
|`repository not found`|地址里的用户名或仓库名打错了|`git remote -v` 看一眼实际登记的是什么|
|推到一半卡住|2MB 素材 + 网络慢|等一会儿；实在不行换网络重试|

## 4. 打开 Pages 开关

**这一步只做一次，但不做的话后面一定失败。**

1. 打开你的仓库页面 → **Settings**（仓库自己的设置，不是账号设置）；
2. 左边栏找到 **Pages**；
3. **Source** 这一项，从 `Deploy from a branch` 改成 **`GitHub Actions`**；
4. 改完不用点保存，它自动生效。

> **为什么要改这一项？**
> 默认的 `Deploy from a branch` 是"直接把某个分支的文件当网站发出去"，
> 那样**不会经过任何检查**。
> 改成 `GitHub Actions` 之后，发布交给我们的工作流——
> **先跑自检，通过了才发布**。这正是 CI/CD 的意义所在。

## 5. 看着它跑起来

### 第一步：触发一次运行

刚才推代码时其实已经触发过一次了。如果那时 Pages 开关还没打开，
现在手动再跑一次：

1. 仓库页面 → **Actions** 标签；
2. 左边点 **「检查并发布完整简历」**；
3. 右边点 **Run workflow** → 再点绿色的 **Run workflow** 按钮。

> 能手动触发，是因为工作流里写了 `workflow_dispatch:` 这一行。

### 第二步：看它一步步走完

点进正在跑的那条记录，**左边是两个任务**：

```text
check    ← 自检：跑 node tools/check-page.mjs
  ↓  needs: check（必须它成功，下面才开始）
deploy   ← 发布：打包整个目录，发到 GitHub Pages
```

点开 `check`，展开最后一步，
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
https://你的用户名.github.io/my-resume/
```

**点开它，再用手机打开一次。** 一份带照片、带字体、带作品截图的完整简历，
现在真的在公网上了。

> **第一次发布可能要多等一两分钟**才能访问，打开是 404 就等等再刷新。

## 6. 把它改成你自己的

**这一步才是这份文档真正的价值。**

代码里凡是要改的地方都留了注释，比如：

```html
<!-- HTML 练习：修改姓名、研究方向、照片路径和联系方式。 -->
```

**按这个顺序改，每改一处就推一次，看着它自动重新发布**：

|第几步|改什么|改哪里|
|---|---|---|
|1|**姓名**|`index.html` 里的 `<title>`、页首 `brand`、页脚|
|2|**联系方式**|搜 `mailto:` 和 `tel:`，换成自己的|
|3|**照片**|把自己的照片放进 `assets/`，改 `<img src=...>`|
|4|**关于我 / 研究方向**|`id="about"` 那一段|
|5|**经历、项目、技能**|`id="experience"`、`id="projects"`、`id="skills"`|
|6|**作品**|`id="portfolio"`，换成自己这门课做的四个项目截图|
|7|删掉用不上的栏目|比如本科生可以删掉 `id="publications"`（论文）|

**每改一步都要做的两件事**：

```bat
REM 1) 本机先自检，别把坏页面推上去
node tools/check-page.mjs

REM 2) 通过了再推
git add .
git commit -m "换成自己的姓名和联系方式"
git push origin main
```

**删栏目的时候特别容易出错**：删了 `id="publications"` 那一段，
**但忘了删导航里指向它的那个链接**。
自检的第 3 项会立刻抓住你：

```text
[X]  导航指向 #publications，但页面里没有 id="publications"
```

> **这就是自检脚本存在的意义**——这种错人工检查很容易漏，
> 机器一秒就发现。**而且它在你推上去之前就发现了。**

### 换照片和字体时要注意

|要换的东西|注意什么|
|---|---|
|照片|**文件名别用中文和空格**；建议压到 500KB 以内，太大手机上加载慢|
|字体|`assets` 里那两个 woff2 是思源宋体子集。**换字体要连许可证一起换**|
|作品截图|用**自己真的做出来的页面**的截图，不要网上找图|

> **图片路径大小写要一致。**
> Windows 上 `Portrait.png` 和 `portrait.png` 是同一个文件，
> **Linux 上不是**——本机好好的，发到 Pages 上图就裂了。
> **这是 CI 帮你抓到的最常见的一类真 bug。**

## 7. 自检清单

**本机**
- [ ] `node tools/check-page.mjs` 全绿，最后一行「自检通过」
- [ ] **退出码是 0**（`echo %ERRORLEVEL%` 或 `$LASTEXITCODE`）
- [ ] 本地服务器能打开完整页面，八个栏目都在
- [ ] 点导航当前项会高亮
- [ ] 窗口拉窄会变单列
- [ ] **`Ctrl+P` 打印预览排版是干净的**

**仓库**
- [ ] 代码推到了**自己的**仓库
- [ ] `git remote -v` 里 `origin` 是自己的、`template` 是公共模板仓库
- [ ] Settings → Pages 的 Source 是 **GitHub Actions**

**流水线**
- [ ] Actions 页面有一条**全绿**的运行记录
- [ ] `check` 的日志里看得到和本机一样的 `[OK]`
- [ ] **两个任务的先后关系看明白了**：`deploy` 等 `check` 成功才开始

**线上**
- [ ] 自己的网址能打开，**照片和四张作品截图都显示出来了**
- [ ] **手机上也能打开**
- [ ] 改一处推上去，网址上的内容自动变了

**改成自己的（做到哪一步算哪一步）**
- [ ] 姓名换成自己的
- [ ] **联系方式换成自己的**
- [ ] 照片换成自己的
- [ ] 删掉用不上的栏目，**并且导航里对应的链接也删了**（自检会抓）

## 8. 交给谁看

这一份**不单独计分**，但改成自己的之后，它可以直接当第 06 课的交付：

|项目|要求|
|---|---|
|本机证据|自检全绿 + 退出码为 0 的截图|
|流水线证据|Actions 页面**全绿**那条运行记录的截图|
|线上证据|**你自己的网址**，以及页面打开的截图（照片和作品图都要显示出来）|
|个性化证据|至少改完姓名、联系方式、照片三样|

## 本课课堂节奏与检查点

> 这一节是给教师控节奏用的，学生可以跳过。

### 二十分钟怎么分

|时间（分钟）|做什么|
|---|---|
|0—3|**打开这份简历的线上版给全班看**，从头翻到尾，说"这是你们最后要交的东西"|
|3—6|学生克隆、本机打开、把八个栏目翻一遍（**这一步别省，看一遍比讲十遍管用**）|
|6—9|本机跑自检、看退出码|
|9—13|建空仓库、推上去。**这一段最容易卡，教师要巡场**|
|13—15|改 Pages 的 Source。**全班一起做，逐个确认**|
|15—18|看着 Actions 跑完，打开自己的网址|
|18—20|**当场把网址发到班级群里**；布置课后把姓名和照片换成自己的|

### 和另一份快速体验的关系

|  |什么时候用|
|---|---|
|[成品版](<CICD快速体验_成品版.md>)（练习页）|第 05 课下课前，跟着课堂练习页走一遍|
|**本篇（完整简历）**|**第 06 课之前或课后，看"真东西"并直接拿来改成自己的**|

**只带一份的话，带这一份**——学生最后要交的是自己的简历，
拿一份真实的完整简历当参照更实在。

### 三个最容易卡住的地方

|卡点|表现|提前说这一句|
|---|---|---|
|**建仓库时勾了 README**|推送报 `rejected ... fetch first`|"**一个勾都不要打**，Create repository 直接点"|
|**Pages 的 Source 没改**|`deploy` 任务报权限错误|"Settings → Pages → Source 改成 **GitHub Actions**，全班一起改，我一个个看"|
|**`.github` 没推上去**|Actions 页面是空的|"`.github` 前面有个点，是隐藏目录，`git status` 确认它在里面"|

**这三条在学生动手之前先讲，比事后救火省一半时间。**

### 逐段检查点

- [ ] 每个学生都克隆到了 `p1-final-resume`，`assets` 里有 9 个文件
- [ ] **每个学生都把八个栏目翻过一遍**
- [ ] 本机自检全绿，**并且看过退出码是 0**
- [ ] 每个人的仓库都是 **Public**
- [ ] **每个人的 Pages Source 都改成了 GitHub Actions**（逐个确认，最容易漏）
- [ ] Actions 里有一条**全绿**的运行
- [ ] **每个人都打开过自己的网址**，照片和作品截图都正常显示
- [ ] 学生知道课后要把姓名、联系方式、照片换成自己的
- [ ] 提醒过：**删栏目要连导航链接一起删**，自检会抓这个

### 关于这份简历的内容

这是**教师本人真实在用的主页**，里面的经历、论文、作品都是真的。

**要对学生说清楚两句话**：

1. **可以拿它当底子改成自己的**，这正是它放在这里的目的；
2. **但不要原样发布出去**——姓名、照片、联系方式、经历都要换成自己的。
   把别人的简历挂在自己的网址上，**是很严重的问题**。

## 常见问题

### Actions 相关

|现象|原因|处理|
|---|---|---|
|Actions 页面是空的|**`.github` 目录没推上去**|`git status` 看有没有漏；它是隐藏目录，容易被忽略|
|`deploy` 报权限错误|**Pages 的 Source 没改成 GitHub Actions**|回第 4 节，改完重新 Run workflow|
|`deploy` 显示 skipped|`check` 失败了|`needs: check` 决定的，先把 check 修绿|
|`check` 失败但本地是好的|**有文件没提交**|CI 上只有仓库里的东西，`git status` 看漏了什么|
|`check` 报"导航指向 #xxx 但没有 id"|删栏目时漏删了导航链接|把导航里那个 `<a href="#xxx">` 也删掉|

### 页面相关

|现象|原因|处理|
|---|---|---|
|网址打开是 404|第一次发布还没生效|等一两分钟再刷新|
|一直 404|仓库是私有的|免费账号的私有仓库不能用 Pages，**改成 Public**|
|**照片裂了**|路径大小写不对，或图片没提交|**Linux 区分大小写**；F12 → Network 看那条请求是不是 404|
|字体没生效，变成默认宋体|`assets` 里的 woff2 没提交|`git status` 确认；自检第 2 项也会抓|
|页面很慢|照片太大|把照片压到 500KB 以内|
|改了但线上没变|浏览器缓存|按 `Ctrl+F5` 强制刷新|

### 内容相关

|问题|回答|
|---|---|
|我没有论文 / 获奖，那些栏目怎么办|**删掉整段**，并且把导航里对应的链接也删掉|
|我还没做完四个项目，作品区放什么|先放已经做完的；每做完一个补一个|
|可以改版式和配色吗|**可以，鼓励改**。`styles.css` 开头有一组颜色变量，改那里最快|
|这份和我第 06 课的工程冲突吗|**不冲突**，是两个独立的文件夹和两个仓库|

更多通用排错见 [通用附录_运行与排错.md](本项目运行与排错.md)；
CI/CD 的完整入门见 [CI-CD 与部署配置](<通用/05_CI-CD与部署配置.md>)；
命令和参数的逐条解释见 [命令参数逐个拆开](<通用/04_命令参数逐个拆开.md>)。
