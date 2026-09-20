# 项目 1 · 第 05 课课堂操作手册

## 数组对象与作品数据化

课堂统一使用 Trae IDE。一次课共 3×45 分钟。第三个课时教师最多讲 15 分钟，至少留 30 分钟给学生完成、推送、部署和交作业。

效果参考：https://ffd-p1-web-v2-20260918.netlify.app/lesson-05/

本课主要文件：`works-data.js、works-render.js`。本课目标：完成作品数组、DOM 卡片生成和渲染调用。

## 一、上课只使用这一个入口

学生进入本课工程后只阅读本 `README.md`。教师答案统一放在 `教师答案/lesson-05/README.md`。

## 二、3×45 分钟安排

| 课时 | 教师与学生安排 | 结果 |
|---|---|---|
| 第 1 个 45 分钟 | 教师展示效果和启动方法；学生选择路线、克隆、用 Trae 打开并本地运行 | 本地工程可用 |
| 第 2 个 45 分钟 | 教师讲核心代码；学生完成任务 A、B，建立本课仓库并开启 Pages | 主要功能完成 |
| 第 3 个 45 分钟前 15 分钟 | 教师只复盘验收、Git 和部署，不再增加新知识 | 学生明确交付 |
| 第 3 个 45 分钟后 30 分钟 | 学生补完、测试、commit、push、检查 Pages、交作业 | 完成线上交付 |

## 三、选择启动路线

# 项目 1 · 第 05 课双入口启动

无论从哪条路线开始，最终都在独立目录 `p1-lesson-05` 中开发，并推送到本课新仓库 `p1-lesson-05-学号`。

## 路线 A：以上次自己的作品为基础

适合已经完成第 04 课并希望保留个人修改的学生。下面以学生上次仓库 `p1-lesson-04-学号` 为例。

### Windows CMD

```bat
cd /d "%USERPROFILE%\Desktop\web-work"
git clone https://github.com/你的用户名/p1-lesson-04-学号.git p1-lesson-05
cd /d "p1-lesson-05"
git remote rename origin previous
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone https://github.com/你的用户名/p1-lesson-04-学号.git p1-lesson-05
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-05')
git remote rename origin previous
git branch -M main
```

`previous` 保留上次仓库来源。不要把本课结果推回 `previous`，这样第 04 课的网站和提交不会被覆盖。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
cd /d "%USERPROFILE%\Desktop\web-work"
git clone --branch p1-l05-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-05
cd /d "p1-lesson-05"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone --branch p1-l05-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-05
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-05')
git remote rename origin course
git branch -M main
```

教师模板已经包含本课所需的前置效果，不要求补做缺席课程。

## 两条路线共同的后续步骤

1. 在 GitHub 新建空的公开仓库 `p1-lesson-05-学号`，不要勾选 README。
2. 连接本课新仓库：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-05-学号.git
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
git fetch course p1-l05-standalone-v3.0
git checkout course/p1-l05-standalone-v3.0 -- works-data.js works-render.js
```

确认 `index.html` 已按模板顺序引用 `works-data.js` 和 `works-render.js`。

## 四、使用 Trae IDE

1. 打开 Trae IDE，选择“打开文件夹 / Open Folder”。
2. 打开 `%USERPROFILE%\Desktop\web-work\p1-lesson-05`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

统一启动方式：`npx live-server --port=7000 --host=0.0.0.0`，打开 http://127.0.0.1:7000/，停止按 `Ctrl+C`。

## 五、本课任务

# 第05课任务：数组对象与作品数据化

本课效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-05/

## 任务 A：准备数据与文件（对应PPT第10页）

模板根目录已经准备好 works-data.js 和 works-render.js，直接打开，不需要从其他课程或 resources 目录复制。

填好四个作品，检查图片路径与网址。

成功标志：works 是含4个对象的数组；先用控制台核对。

## 任务 B：填完渲染骨架（对应PPT第13页）

打开 works-render.js，完成三个 TODO。

标题使用 work.title，说明使用 work.description。

最后调用 renderWorks(works)。

下面几页逐段解释老师提供的骨架，不要求盲抄。

成功标志：四项仍完整；加一条变五项，空数组有说明。

## 交付

运行截图、个人提交编号、线上网址（发布课）、一句代码解释。遇到故障写明命令、目录和完整错误，不只写“运行不了”。


## 六、保存、推送与部署

在 Trae 内置终端先运行 `git status` 和 `git diff`。确认没有密码、临时文件和无关文件后：

```text
git add .
git commit -m "完成项目1第05课"
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
- Trae 看不到文件：确认打开的是 `p1-lesson-05`。
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
## 3 个数据渲染 TODO 的前后变化与代码解释

1. `title.textContent = work.title;`：操作前创建了 h3 但没有文字；右侧读取对象 title，左侧写入 DOM；操作后显示标题。
2. `description.textContent = work.description;`：点号访问对象属性，`textContent` 安全写入文字；操作后显示作品说明。
3. `renderWorks(works);`：操作前只定义函数却没有调用，作品区为空；该调用把数组传给渲染函数；操作后每个对象生成一张卡片。

教师可临时把 `works` 改为空数组演示空状态，再恢复，帮助学生理解条件分支。

## 零基础数据与 DOM 术语表

- `work` 是当前作品对象；对象把一组相关数据放在一起，例如 `title`、`description`、`url`。
- `work.title` 使用点号读取对象的 `title` 属性；点号可理解为“这个对象里面的”。
- `document.createElement('h3')` 在内存中新建一个 h3 元素，此时它还没有显示到页面上。
- `title.textContent = work.title`：右边读取数据，等号把数据赋给左边元素的纯文字内容。
- `textContent` 按纯文字写入；即使数据含有 `<b>`，也会显示字符，不会把它当标签执行。
- `append` 把元素放进父元素；只有接入页面 DOM 后，浏览器才会显示它。
- `items.forEach(...)` 对数组中的每一个作品对象执行一次，因此一个对象生成一张卡片。
- `DocumentFragment` 是临时容器，先在内存中装好全部卡片，再一次放入页面，减少反复更新页面。
- `renderWorks(works)` 中，`renderWorks` 是函数名，`works` 是传入的数组，圆括号表示现在调用函数。

