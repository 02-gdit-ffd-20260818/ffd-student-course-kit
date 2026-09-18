# P1 一页知我：学生课堂资源 v2.0

固定日期：2026-09-18；固定标签：`p1-web-20260918-v2.0`。

六阶段效果：https://ffd-p1-web-v2-20260918.netlify.app/

## 第一次领取

平台：Windows CMD 与 PowerShell 通用。先打开终端进入准备存放资料的文件夹，再执行下面完整的一行：

```text
git clone --branch p1-web-20260918-v2.0 --depth 1 https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-kit-v2
```

`git clone` 下载资源；`--branch` 指定固定版本；`--depth 1` 只领取所需历史；`p1-kit-v2` 是新建的资料目录。目录已存在时不要删除自己的作品，直接打开已有资源。

完全没操作过：打开 [第1课实操](docs/lesson-01.md)，从创建工作区开始。它分别给出 CMD / PowerShell，选择当前终端对应的一种。

## 每次上课

- 第 01 课 HTML内容与首次上线：[实操](docs/lesson-01.md) / [课前模板](starter/lesson-01/README.md) / [效果](https://ffd-p1-web-v2-20260918.netlify.app/lesson-01/)
- 第 02 课 CSS字体配色与盒模型：[实操](docs/lesson-02.md) / [课前模板](starter/lesson-02/README.md) / [效果](https://ffd-p1-web-v2-20260918.netlify.app/lesson-02/)
- 第 03 课 响应式布局与作品图像：[实操](docs/lesson-03.md) / [课前模板](starter/lesson-03/README.md) / [效果](https://ffd-p1-web-v2-20260918.netlify.app/lesson-03/)
- 第 04 课 JavaScript导航交互：[实操](docs/lesson-04.md) / [课前模板](starter/lesson-04/README.md) / [效果](https://ffd-p1-web-v2-20260918.netlify.app/lesson-04/)
- 第 05 课 数组对象与作品数据化：[实操](docs/lesson-05.md) / [课前模板](starter/lesson-05/README.md) / [效果](https://ffd-p1-web-v2-20260918.netlify.app/lesson-05/)
- 第 06 课 测试发布与Vue过渡：[实操](docs/lesson-06.md) / [课前模板](starter/lesson-06/README.md) / [效果](https://ffd-p1-web-v2-20260918.netlify.app/lesson-06/)

第一次复制 lesson-01 到自己的 p1-homepage，随后 git init 建立个人历史。第2—6课继续修改同一个 p1-homepage；不是每课重新复制覆盖。starter/lesson-02…06 用于单独补课，课堂任务写在各目录的“课堂任务.md”。

resources 是逐课需用的 CSS、JS 和离线 Vue 对照素材。只有手册要求的新文件才复制进自己的工程；保留自己的 index.html 和个人资料。

## 运行与提交

双击自己工程的 index.html；VS Code 编辑 → Ctrl+S → 浏览器刷新。HTML/CSS/JS 写进文件；Git 命令输到终端。

推送目标必须是自己的新建仓库，不是本课程资料仓库。认证使用本人账号。具体创建、身份配置、绑定 origin、push、GitHub Pages 步骤见第1课手册。

[运行与排错](docs/运行与排错.md)；[Ubuntu 扩展](docs/Ubuntu部署附录.md)。本仓库不附教师完整简历和教师答案。四个作品图片是课程项目效果示例，请保留示例说明，后续换成自己的真实作品。
