# 项目 1 · 第 02 课独立启动

本课主题：CSS 字体配色与盒模型

本课支持两种入口：继续上次自己的作品，或从教师本课模板开始。先阅读 `START-MODES.md` 选择路线。

本目录是完整、可运行的课堂快照。没有参加前面的课程，也可以直接从本课开始。不要从上一课复制工程；每次课使用独立目录、独立 Git 仓库和独立 Pages 网址。

## Windows CMD 下载

```bat
cd /d "%USERPROFILE%\web-work"
git clone --branch p1-l02-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-02
cd /d "p1-lesson-02"
git remote rename origin course
git branch -M main
code .
```

## Windows PowerShell 下载

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone --branch p1-l02-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-02
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-lesson-02')
git remote rename origin course
git branch -M main
code .
```

命令说明：

- `git clone` 下载只属于本课的完整起步工程。
- `--branch p1-l02-standalone-v3.0` 固定本课版本。
- `p1-lesson-02` 是本课独立目录，不覆盖其他课程。
- `git remote rename origin course` 防止误推送到教师仓库。
- `git branch -M main` 把学生开发分支统一为 main。

## 本地运行与开发

双击 `index.html`；修改后按 `Ctrl+S`，浏览器按 `Ctrl+R`。也可运行 `node tools/serve.mjs` 后打开 http://127.0.0.1:5173/。打开 `课堂任务.md` 完成任务 A、B。本课主要修改：lesson-02-task.css。起步工程已经包含本课需要的前置效果。

## 保存版本

```text
git status
git diff
git add .
git commit -m "完成项目1第02课"
```

## 推送到自己的仓库

在 GitHub 新建空的公开仓库 `p1-lesson-02-学号`，不要勾选 README。把下面占位符换成真实信息：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-02-学号.git
git push -u origin main
git remote -v
```

`course` 应指向教师模板；`origin` 应指向学生自己的仓库。

## 独立部署

进入自己的仓库：`Settings → Pages → Deploy from a branch → main → /(root) → Save`。本课使用独立仓库和 Pages 网址，不会覆盖其他课程。

## 交付

提交本课提交编号、GitHub 仓库地址、GitHub Pages 地址和一句代码解释。
