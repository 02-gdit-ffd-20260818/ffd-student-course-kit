# 项目 1 · 六次课独立启动索引

六次课属于同一个个人主页项目的六个阶段，但课堂工程完全独立。学生可以从任意一次课开始，不需要补做前面的课程。

| 课程 | 主题 | 固定模板分支 | 本地目录建议 | 学生仓库建议 |
|---|---|---|---|---|
| 01 | HTML 内容与首次上线 | `p1-l01-standalone-v3.0` | `p1-lesson-01` | `p1-lesson-01-学号` |
| 02 | CSS 字体配色与盒模型 | `p1-l02-standalone-v3.0` | `p1-lesson-02` | `p1-lesson-02-学号` |
| 03 | 响应式布局与作品图像 | `p1-l03-standalone-v3.0` | `p1-lesson-03` | `p1-lesson-03-学号` |
| 04 | JavaScript 导航交互 | `p1-l04-standalone-v3.0` | `p1-lesson-04` | `p1-lesson-04-学号` |
| 05 | 数组对象与作品数据化 | `p1-l05-standalone-v3.0` | `p1-lesson-05` | `p1-lesson-05-学号` |
| 06 | 测试、修复与最终发布 | `p1-l06-standalone-v3.0` | `p1-lesson-06` | `p1-lesson-06-学号` |

统一下载格式：

```text
git clone --branch 本课固定分支 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git 本课独立目录
```

下载后先把教师远程仓库改名，再建立学生自己的开发分支：

```text
git remote rename origin course
git branch -M main
```

学生在 GitHub 新建本课空仓库后运行：

```text
git remote add origin 学生自己的仓库地址
git push -u origin main
```

这种结构同时保留项目递进关系和课堂灵活性：第 04 课模板已经包含前三课完成状态，第 05 课模板已经包含前四课完成状态，但每次课的本地目录、学生提交、远程仓库和 Pages 网址互相独立。
