# 项目 1 · 第 01 课课堂操作手册

## HTML 内容与首次上线

课堂统一使用 Trae IDE。一次课共 3×45 分钟。第三个课时教师最多讲 15 分钟，至少留 30 分钟给学生完成、推送、部署和交作业。

效果参考：https://ffd-p1-web-v2-20260918.netlify.app/lesson-01/

本课主要文件：`index.html`。本课目标：填写个人资料、照片、经历和作品链接。

## 一、上课只使用这一个入口

学生进入本课工程后只阅读本 `README.md`。教师答案统一放在 `教师答案/lesson-01/README.md`。

## 二、3×45 分钟安排

| 课时 | 教师与学生安排 | 结果 |
|---|---|---|
| 第 1 个 45 分钟 | 教师展示效果和启动方法；学生选择路线、克隆、用 Trae 打开并本地运行 | 本地工程可用 |
| 第 2 个 45 分钟 | 教师讲核心代码；学生完成任务 A、B，建立本课仓库并开启 Pages | 主要功能完成 |
| 第 3 个 45 分钟前 15 分钟 | 教师只复盘验收、Git 和部署，不再增加新知识 | 学生明确交付 |
| 第 3 个 45 分钟后 30 分钟 | 学生补完、测试、commit、push、检查 Pages、交作业 | 完成线上交付 |

## 三、选择启动路线

# 项目 1 · 第 01 课双入口启动

无论从哪条路线开始，最终都在独立目录 `p1-lesson-01` 中开发，并推送到本课新仓库 `p1-lesson-01-学号`。

第 1 课没有上一课工程，所有学生都走路线 B。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
cd /d "%USERPROFILE%\Desktop\web-work"
git clone --branch p1-l01-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-01
cd /d "p1-lesson-01"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone --branch p1-l01-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-01
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-01')
git remote rename origin course
git branch -M main
```

教师模板已经包含本课所需的前置效果，不要求补做缺席课程。

## 两条路线共同的后续步骤

1. 在 GitHub 新建空的公开仓库 `p1-lesson-01-学号`，不要勾选 README。
2. 连接本课新仓库：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-01-学号.git
git push -u origin main
git remote -v
```

3. 开发完成后正常执行 `git add`、`git commit`、`git push`。
4. 在本课新仓库开启 GitHub Pages。

## 远程名称检查

- 路线 A：`previous` 指向学生上次仓库，`origin` 指向本课新仓库。
- 路线 B：`course` 指向教师模板仓库，`origin` 指向本课新仓库。

这样既能继承学生上次作品，也能保证每次课的代码、提交和部署互不覆盖。




## 四、使用 Trae IDE

1. 打开 Trae IDE，选择“打开文件夹 / Open Folder”。
2. 打开 `%USERPROFILE%\Desktop\web-work\p1-lesson-01`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

统一启动方式：`npx live-server --port=7000 --host=0.0.0.0`，打开 http://127.0.0.1:7000/，停止按 `Ctrl+C`。

## 五、本课任务

# 第01课任务：HTML内容与首次上线

本课效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-01/

## 任务 A：资料与照片（对应PPT第15页）

打开 index.html，搜索“请填写姓名”。

改成自己的姓名、学校、简介和联系方式。

将自己的照片放进 assets，更新 src 与 alt。

保存刷新，检查中文和图片。

成功标志：别人能看出你是谁；不用教师的论文和联系方式。

## 任务 B：经历与作品链接（对应PPT第18页）

增加一条真实经历，保留正确闭合标签。

搜索 portfolio，修改一个作品显示名称。

检查 href 能打开正确网页。

自己的后续项目未完成，可保留已标注的教学示例。

成功标志：经历出现；链接打开；标题层级没有跳乱。

## 交付

运行截图、个人提交编号、线上网址（发布课）、一句代码解释。遇到故障写明命令、目录和完整错误，不只写“运行不了”。


## 六、保存、推送与部署

在 Trae 内置终端先运行 `git status` 和 `git diff`。确认没有密码、临时文件和无关文件后：

```text
git add .
git commit -m "完成项目1第01课"
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
- Trae 看不到文件：确认打开的是 `p1-lesson-01`。
- 页面没变化：确认 `Ctrl+S`，再按 `Ctrl+F5`。
- `git push` 没有上游：运行 `git push -u origin main`。
- Pages 404：检查 Public、main、`/(root)` 和根目录 `index.html`。

## 命令逐项解释（课堂必须讲清楚）

所有项目统一放在桌面：`C:\Users\当前用户名\Desktop\web-work`。例如用户名是 HUAWEI，实际路径就是 `C:\Users\HUAWEI\Desktop\web-work`。命令使用 `%USERPROFILE%` 或 `$env:USERPROFILE`，可以自动适应不同用户名。

### 建立桌面工作区

CMD：

```bat
mkdir "%USERPROFILE%\Desktop\web-work" 2>nul
cd /d "%USERPROFILE%\Desktop\web-work"
dir
```

PowerShell 或 Trae 终端：

```powershell
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
git clone --branch 本课分支 --single-branch 仓库网址 本课文件夹
```

- `git clone`：下载代码以及 Git 版本历史。
- `--branch`：指定本课模板分支，防止拿错课次。
- `--single-branch`：只下载该课分支，减少无关内容。
- 最后的文件夹名：规定项目在桌面的保存位置，不覆盖其他课次。

### 统一启动命令

```bash
npx live-server --port=7000 --host=0.0.0.0
```

- `npx`：临时下载并运行工具，不需要在学生项目中保存 `node_modules`。
- `live-server`：把当前文件夹作为静态网站运行，保存代码后通常自动刷新。
- `--port=7000`：六次课统一使用 7000 端口。
- `--host=0.0.0.0`：监听本机网络接口；本机浏览器仍打开 `http://127.0.0.1:7000`。
- 第一次提示安装时输入 `y` 并回车；停止服务时按 `Ctrl+C`。

### Git 提交命令

```bash
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
git remote rename origin teacher
git remote add origin <自己的空仓库网址>
git branch -M main
git push -u origin main
```

`rename` 保留教师地址供查看；`add origin` 把默认推送目标改成学生自己的仓库；`-u` 建立后续默认跟踪关系。
## 本课任务点的前后变化与代码解释

### 任务点1：姓名和身份

- 操作前：页面仍显示“请填写姓名”。
- 为什么：个人主页必须先明确“这是谁”。
- 操作：修改 `<h1>`、`.hero-role`、`.hero-school` 中的文字。
- 代码含义：`h1` 是最高级标题；`p` 是段落；class 供 CSS 选中元素。
- 操作后：顶部显示学生自己的姓名、专业和班级。

### 任务点2：头像

- 操作前：使用统一的 `assets/avatar.svg`。
- 操作：把照片放进 `assets`，修改 `<img src="assets/照片名.jpg" alt="姓名的个人照片">`。
- 代码含义：`src` 是图片路径；`alt` 是图片失效及屏幕阅读器使用的说明。
- 操作后：显示个人照片，并保留可访问性说明。

### 任务点3：经历和作品链接

- 操作前：经历和链接仍是示例。
- 操作：修改 `.experience-item`；把作品 `<a>` 的 `href` 改成完整的 `https://...`。
- 代码含义：相同 class 复用统一样式；`href` 是链接目标。
- 操作后：经历可阅读，作品卡片可正确打开。

## 零基础代码术语表

- `<h1>文字</h1>`：`<h1>` 是开始标签，`</h1>` 是结束标签，中间才是页面显示的文字；`/` 表示标签结束。
- `<p>`：paragraph（段落）的缩写，用于普通文字段落。
- `class="hero-role"`：给元素添加可复用的类别名，CSS 可用 `.hero-role` 选中它；同一个 class 可以用于多个元素。
- `id="about"`：元素在本页的唯一标识，CSS 用 `#about` 选中，链接 `href="#about"` 可跳到这里。
- `<img>`：图片元素；`src` 是图片路径，`alt` 是图片无法显示或屏幕阅读器读取时使用的替代文字。
- `assets/avatar.jpg`：相对路径，表示从当前 HTML 所在目录进入 `assets` 文件夹，再寻找 `avatar.jpg`。
- `<a href="网址">`：`a` 是链接元素，`href` 是点击后打开的目标；完整外部网址应从 `https://` 开始。
- `<div>`：通用容器，本身不说明内容含义，主要用于分组和布局。
- 修改原则：只替换文字和属性值，不删除尖括号、引号及成对的结束标签；每完成一处就保存并刷新检查。

