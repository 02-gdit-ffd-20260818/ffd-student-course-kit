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
cd /d "%USERPROFILE%\web-work"
git clone --branch p1-l01-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-01
cd /d "p1-lesson-01"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone --branch p1-l01-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-01
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-lesson-01')
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
2. 打开 `%USERPROFILE%\web-work\p1-lesson-01`。
3. 在 Trae 左侧确认 `index.html`、`styles.css` 和本课主要文件存在。
4. 打开 Trae 内置终端，后续 Git 命令全部在这里运行。
5. 双击 `index.html` 本地运行；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。

可选本地服务：`node tools/serve.mjs`，打开 http://127.0.0.1:5173/，停止按 `Ctrl+C`。

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
