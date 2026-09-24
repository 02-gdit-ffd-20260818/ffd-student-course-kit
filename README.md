# 项目 1 · 第 04 课课堂操作手册

## JavaScript 导航交互

课堂统一使用 Trae IDE。一次课共 3×45 分钟。第三个课时教师最多讲 15 分钟，至少留 30 分钟给学生完成、推送、部署和交作业。

效果参考：https://ffd-p1-web-v2-20260918.netlify.app/lesson-04/

本课主要文件：`app.js`。本课目标：完成栏目判断、类名切换、aria-current 和 hashchange。

## 一、上课只使用这一个入口

学生进入本课工程后只阅读本 `README.md`。教师答案统一放在 `教师答案/lesson-04/README.md`。

## 二、3×45 分钟安排

| 课时 | 教师与学生安排 | 结果 |
|---|---|---|
| 第 1 个 45 分钟 | 教师展示效果和启动方法；学生选择路线、克隆、用 Trae 打开并本地运行 | 本地工程可用 |
| 第 2 个 45 分钟 | 教师讲核心代码；学生完成任务 A、B，建立本课仓库并开启 Pages | 主要功能完成 |
| 第 3 个 45 分钟前 15 分钟 | 教师只复盘验收、Git 和部署，不再增加新知识 | 学生明确交付 |
| 第 3 个 45 分钟后 30 分钟 | 学生补完、测试、commit、push、检查 Pages、交作业 | 完成线上交付 |

## 三、选择启动路线

# 项目 1 · 第 04 课双入口启动

无论从哪条路线开始，最终都在独立目录 `p1-lesson-04` 中开发，并推送到本课新仓库 `p1-lesson-04-学号`。

## 路线 A：以上次自己的作品为基础

适合已经完成第 03 课并希望保留个人修改的学生。下面以学生上次仓库 `p1-lesson-03-学号` 为例。

### Windows CMD

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
cd /d "%USERPROFILE%\Desktop\web-work"
git clone https://github.com/你的用户名/p1-lesson-03-学号.git p1-lesson-04
cd /d "p1-lesson-04"
git remote rename origin previous
git branch -M main
```

### Windows PowerShell

```powershell

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone https://github.com/你的用户名/p1-lesson-03-学号.git p1-lesson-04
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-04')
git remote rename origin previous
git branch -M main
```

`previous` 保留上次仓库来源。不要把本课结果推回 `previous`，这样第 03 课的网站和提交不会被覆盖。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
cd /d "%USERPROFILE%\Desktop\web-work"
git clone --branch p1-l04-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-04
cd /d "p1-lesson-04"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell

# 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work')
git clone --branch p1-l04-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-04
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Desktop\web-work\p1-lesson-04')
git remote rename origin course
git branch -M main
```

教师模板已经包含本课所需的前置效果，不要求补做缺席课程。

## 两条路线共同的后续步骤

1. 在 GitHub 新建空的公开仓库 `p1-lesson-04-学号`，不要勾选 README。
2. 连接本课新仓库：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-04-学号.git
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
git fetch course p1-l04-standalone-v3.0
git checkout course/p1-l04-standalone-v3.0 -- app.js
```

确认 `index.html` 已引用 `app.js`。

## 四、使用 Trae IDE

1. 打开 Trae IDE，选择“打开文件夹 / Open Folder”。
2. 打开 `%USERPROFILE%\Desktop\web-work\p1-lesson-04`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

统一启动方式：`npx live-server --port=7000 --host=0.0.0.0`，打开 http://127.0.0.1:7000/，停止按 `Ctrl+C`。

## 五、本课任务

# 第04课任务：JavaScript导航交互

本课效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-04/

## 任务 A：让一个链接高亮

模板根目录已经准备好 app.js，直接打开，不需要从其他目录复制或改名。

确认 HTML 的 head 已经引用 app.js。

在函数中 currentSection 下一行写 console.log(currentSection)。

文件末尾写 updateNavigation();，保存并打开 F12 的 Console。

成功标志：刷新后控制台显示当前栏目ID；事件监听在任务 B 完成。

## 任务 B：完成导航状态

填完条件与类名切换。

补 hashchange 监听，首次主动执行函数。

选中的链接添加 aria-current="location"。

不匹配时移除 aria-current。

成功标志：点击、后退、直接打开 #skills 都只高亮一个栏目。

## 交付

运行截图、个人提交编号、线上网址（发布课）、一句代码解释。遇到故障写明命令、目录和完整错误，不只写“运行不了”。

## 六、保存、推送与部署

在 Trae 内置终端先运行 `git status` 和 `git diff`。确认没有密码、临时文件和无关文件后：

```text
git add .
git commit -m "完成项目1第04课"
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
- Trae 看不到文件：确认打开的是 `p1-lesson-04`。
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

## 2 组 JavaScript TODO 的前后变化与代码解释

### TODO JS-A：判断当前导航

- 操作前：链接可以跳转，但没有高亮。
- 添加比较：`link.getAttribute('href') === currentSection`。
- 添加切换：`link.classList.toggle('is-current', isCurrent)`。
- 含义：`getAttribute` 读取 href；严格相等得到 true/false；`toggle` 根据布尔值添加或删除类。
- 同时设置或删除 `aria-current`，让屏幕阅读器知道当前位置。
- 操作后：只有当前栏目高亮。

### TODO JS-B：监听并首次执行

- 操作前：函数已定义但没有运行。
- 添加 `window.addEventListener('hashchange', updateNavigation);` 和 `updateNavigation();`。
- 含义：事件监听器在网址 hash 改变时重新执行；最后一行保证首次打开也执行。
- 操作后：点击、刷新、前进和后退都保持正确高亮。

## 零基础 JavaScript 术语表

- `const` 声明不重新赋值的变量；等号右边先计算，再把结果保存到左边变量。
- `document.querySelectorAll('nav a')` 查找 `nav` 中的所有链接，返回一个可遍历的集合。
- `function updateNavigation() { ... }` 是定义函数；定义只保存步骤，写 `updateNavigation()` 才是立即执行。
- `forEach(function (link) { ... })` 对集合中的每个链接各执行一次；`link` 表示本轮处理的链接。
- `window.location.hash` 是地址栏中从 `#` 开始的部分；`|| '#about'` 表示前者为空时使用默认值。
- `===` 是严格相等比较，结果只有布尔值 `true` 或 `false`。
- `classList.toggle('is-current', isCurrent)`：第二个参数为 true 时添加类，为 false 时删除类。
- `setAttribute` 设置 HTML 属性，`removeAttribute` 删除属性；`aria-current` 帮助辅助技术识别当前位置。
- `addEventListener('hashchange', updateNavigation)` 登记监听器，hash 改变后由浏览器调用函数；这里函数名后不加括号。
- JavaScript 区分大小写，括号、引号、花括号和分号应按答案完整输入。
