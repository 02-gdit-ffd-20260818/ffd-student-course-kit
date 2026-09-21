# 第07课学生起步：博客阅读端

本目录是可以独立运行的课堂模板。缺课或上次项目不可用时，直接克隆 lesson-07 分支从零开始。

## 桌面领取

```bat
cd /d "%USERPROFILE%\Desktop"
if not exist web-work mkdir web-work
cd web-work
if not exist p2-blog mkdir p2-blog
cd p2-blog
git clone --branch lesson-07 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git lesson-07
cd lesson-07
npm.cmd ci
```

在Trae IDE中打开本文件夹。第07—08课只启动网页；第09—11课还需要启动Express API。

## 本课两个TODO

1. 显示文章摘要。
2. 触发阅读全文事件。

主要修改文件：`src/components/ArticleCard.vue`。完整步骤、答案解释、测试、Git提交和部署方法看教师发放的本课《统一实操手册》。
