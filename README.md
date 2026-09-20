# 项目 1 · 第 02 课课堂操作手册

## CSS 字体配色与盒模型

课堂统一使用 Trae IDE。一次课共 3×45 分钟。第三个课时教师最多讲 15 分钟，至少留 30 分钟给学生完成、推送、部署和交作业。

效果参考：https://ffd-p1-web-v2-20260918.netlify.app/lesson-02/

本课主要文件：`lesson-02-task.css`。本课目标：修改颜色变量、字号、标题样式和内容间距。

## 一、上课只使用这一个入口

学生进入本课工程后只阅读本 `README.md`。教师答案统一放在 `教师答案/lesson-02/README.md`。

## 二、3×45 分钟安排

| 课时 | 教师与学生安排 | 结果 |
|---|---|---|
| 第 1 个 45 分钟 | 教师展示效果和启动方法；学生选择路线、克隆、用 Trae 打开并本地运行 | 本地工程可用 |
| 第 2 个 45 分钟 | 教师讲核心代码；学生完成任务 A、B，建立本课仓库并开启 Pages | 主要功能完成 |
| 第 3 个 45 分钟前 15 分钟 | 教师只复盘验收、Git 和部署，不再增加新知识 | 学生明确交付 |
| 第 3 个 45 分钟后 30 分钟 | 学生补完、测试、commit、push、检查 Pages、交作业 | 完成线上交付 |

## 三、选择启动路线

# 项目 1 · 第 02 课双入口启动

无论从哪条路线开始，最终都在独立目录 `p1-lesson-02` 中开发，并推送到本课新仓库 `p1-lesson-02-学号`。

## 路线 A：以上次自己的作品为基础

适合已经完成第 01 课并希望保留个人修改的学生。下面以学生上次仓库 `p1-lesson-01-学号` 为例。

### Windows CMD

```bat
cd /d "%USERPROFILE%\Desktop\web-work"
git clone https://github.com/你的用户名/p1-lesson-01-学号.git p1-lesson-02
cd /d "p1-lesson-02"
git remote rename origin previous
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone https://github.com/你的用户名/p1-lesson-01-学号.git p1-lesson-02
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-02')
git remote rename origin previous
git branch -M main
```

`previous` 保留上次仓库来源。不要把本课结果推回 `previous`，这样第 01 课的网站和提交不会被覆盖。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
cd /d "%USERPROFILE%\Desktop\web-work"
git clone --branch p1-l02-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-02
cd /d "p1-lesson-02"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone --branch p1-l02-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-02
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-02')
git remote rename origin course
git branch -M main
```

教师模板已经包含本课所需的前置效果，不要求补做缺席课程。

## 两条路线共同的后续步骤

1. 在 GitHub 新建空的公开仓库 `p1-lesson-02-学号`，不要勾选 README。
2. 连接本课新仓库：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-02-学号.git
git push -u origin main
git remote -v
```

3. 开发完成后正常执行 `git add`、`git commit`、`git push`。
4. 在本课新仓库开启 GitHub Pages。

## 远程名称检查

- 路线 A：`previous` 指向学生上次仓库，`origin` 指向本课新仓库。
- 路线 B：`course` 指向教师模板仓库，`origin` 指向本课新仓库。

这样既能继承学生上次作品，也能保证每次课的代码、提交和部署互不覆盖。


### 路线 A 领取本课文件

```text
git remote add course https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git
git fetch course p1-l02-standalone-v3.0
git checkout course/p1-l02-standalone-v3.0 -- lesson-02-task.css
```

在 `index.html` 的 `styles.css` 后确认已引用 `lesson-02-task.css`。

## 四、使用 Trae IDE

1. 打开 Trae IDE，选择“打开文件夹 / Open Folder”。
2. 打开 `%USERPROFILE%\Desktop\web-work\p1-lesson-02`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

统一启动方式：`npx live-server --port=7000 --host=0.0.0.0`，打开 http://127.0.0.1:7000/，停止按 `Ctrl+C`。

## 五、本课任务

# 第02课任务：CSS字体配色与盒模型

本课效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-02/

## 任务 A：字体与颜色（对应PPT第10页）

保留 styles.css 原有起步规则。

打开模板根目录已经准备好的 lesson-02-task.css，不需要从其他课程或 resources 目录复制文件。

修改 --heading、--body-size 后保存刷新。

成功标志：正文暖白背景，标题墨绿，字号变化可见。

## 任务 B：让长页面好读（对应PPT第13页）

调整标题与段落间距。

把项目经历之间的间距增大，再观察。

用开发者工具查看一个 h2 的样式。

用截图对比修改前后，解释一个选择。

成功标志：主标题、次标题、正文能区分；不靠空格凑布局。

## 交付

运行截图、个人提交编号、线上网址（发布课）、一句代码解释。遇到故障写明命令、目录和完整错误，不只写“运行不了”。


## 六、保存、推送与部署

在 Trae 内置终端先运行 `git status` 和 `git diff`。确认没有密码、临时文件和无关文件后：

```text
git add .
git commit -m "完成项目1第02课"
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
- Trae 看不到文件：确认打开的是 `p1-lesson-02`。
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
## 本课 TODO 的前后变化与代码解释

1. **标题颜色**：修改 `--heading`。操作前是模板颜色；CSS 自定义属性能被多个 `var(--heading)` 复用；操作后所有标题同时换色。
2. **正文字号**：修改 `--body-size`。`px` 是屏幕像素；操作后全站正文统一变大。
3. **栏目留白**：调整 `.section` 的 `margin-top` 与 `padding-top`。前者是元素外部距离，后者是边框以内距离；操作后栏目不再拥挤。
4. **标题盒模型**：观察 `h2` 的 `padding`、`border-left`、`background`。它们分别控制内边距、左边框和背景；操作后标题层级更清楚。

每修改一项都先展示旧页面，保存后刷新 `http://127.0.0.1:7000`，让学生说出变化。
