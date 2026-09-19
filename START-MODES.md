# 项目 1 · 第 06 课双入口启动

无论从哪条路线开始，最终都在独立目录 `p1-lesson-06` 中开发，并推送到本课新仓库 `p1-lesson-06-学号`。

## 路线 A：以上次自己的作品为基础

适合已经完成第 05 课并希望保留个人修改的学生。下面以学生上次仓库 `p1-lesson-05-学号` 为例。

### Windows CMD

```bat
cd /d "%USERPROFILE%\web-work"
git clone https://github.com/你的用户名/p1-lesson-05-学号.git p1-lesson-06
cd /d "p1-lesson-06"
git remote rename origin previous
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone https://github.com/你的用户名/p1-lesson-05-学号.git p1-lesson-06
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-lesson-06')
git remote rename origin previous
git branch -M main
```

`previous` 保留上次仓库来源。不要把本课结果推回 `previous`，这样第 05 课的网站和提交不会被覆盖。

## 路线 B：从教师本课模板开始

适合缺课补做、没有个人项目、上次工程损坏，或希望使用统一起点的学生。

### Windows CMD

```bat
cd /d "%USERPROFILE%\web-work"
git clone --branch p1-l06-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-06
cd /d "p1-lesson-06"
git remote rename origin course
git branch -M main
```

### Windows PowerShell

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone --branch p1-l06-standalone-v3.0 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-lesson-06
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-lesson-06')
git remote rename origin course
git branch -M main
```

教师模板已经包含本课所需的前置效果，不要求补做缺席课程。

## 两条路线共同的后续步骤

1. 在 GitHub 新建空的公开仓库 `p1-lesson-06-学号`，不要勾选 README。
2. 连接本课新仓库：

```text
git remote add origin https://github.com/你的用户名/p1-lesson-06-学号.git
git push -u origin main
git remote -v
```

3. 开发完成后正常执行 `git add`、`git commit`、`git push`。
4. 在本课新仓库开启 GitHub Pages。

## 远程名称检查

- 路线 A：`previous` 指向学生上次仓库，`origin` 指向本课新仓库。
- 路线 B：`course` 指向教师模板仓库，`origin` 指向本课新仓库。

这样既能继承学生上次作品，也能保证每次课的代码、提交和部署互不覆盖。
