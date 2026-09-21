# 第11课学生起步：登录评论与部署

本目录是可以独立运行的课堂模板。缺课或上次项目不可用时，直接克隆 lesson-11 分支从零开始。

## 桌面领取

```bat
cd /d "%USERPROFILE%\Desktop"
if not exist web-work mkdir web-work
cd web-work
if not exist p2-blog mkdir p2-blog
cd p2-blog
git clone --branch lesson-11 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git lesson-11
cd lesson-11
npm.cmd ci
```

在Trae IDE中打开本文件夹。第07—08课只启动网页；第09—11课还需要启动Express API。

## 本课两个TODO

1. 判断令牌是否有效。
2. 提取Bearer令牌。

主要修改文件：`src/services/authSession.js`。完整步骤、答案解释、测试、Git提交和部署方法看教师发放的本课《统一实操手册》。
