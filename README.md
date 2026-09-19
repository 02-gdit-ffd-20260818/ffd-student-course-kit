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
cd /d "%USERPROFILE%\web-work"
git clone https://github.com/你的用户名/p1-lesson-04-学号.git p1-lesson-05
cd /d "p1-lesson-05"
git remote rename origin previous
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone https://github.com/你的用户名/p1-lesson-04-学号.git p1-lesson-05
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-lesson-05')
git remote rename origin previous
git branch -M main
```

`previous` 保留上次仓库来源。不要把本课结果推回 `previous`，这样第 04 课的网站和提交不会被覆盖。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
cd /d "%USERPROFILE%\web-work"
git clone --branch p1-l05-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-05
cd /d "p1-lesson-05"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone --branch p1-l05-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-05
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-lesson-05')
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
2. 打开 `%USERPROFILE%\web-work\p1-lesson-05`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

可选本地服务：`node tools/serve.mjs`，打开 http://127.0.0.1:5173/，停止按 `Ctrl+C`。

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
