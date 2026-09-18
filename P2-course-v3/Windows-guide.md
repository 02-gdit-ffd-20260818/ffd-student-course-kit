# P2课程博客：Windows实操手册（CMD / PowerShell共用）

本版是独立预览开发分支，不覆盖已固定的v1.8.0。功能为课程文章、注册登录、文字评论、文章管理和真实SQL数据库；评论不是评分。

## 1. 打开命令窗口

安装Git及Node.js 24。按Win+R，输入cmd，回车，即打开CMD。习惯PowerShell的同学也可打开PowerShell。以下统一用`npm.cmd`，两种窗口均可运行。代码框里的命令逐行复制；不要复制标题或解释。

检查环境（Windows CMD / PowerShell）：

```bat
git --version
node --version
npm.cmd --version
```

分别检查Git、Node及npm；Node版本应为v24或更高。提示“不是内部或外部命令”时，安装对应软件后重新打开窗口。

## 2. 通过git clone领取模板

将电脑上的E盘作为示例；没有E盘可以使用D盘，将路径中的E改为D。不要在已有同名文件夹里重复clone。

Windows CMD：

```bat
cd /d E:\
git clone --branch p2-course-v3 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p2-course-work
cd /d E:\p2-course-work\P2-course-v3\complete
```

Windows PowerShell：

```powershell
Set-Location E:\
git clone --branch p2-course-v3 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p2-course-work
Set-Location E:\p2-course-work\P2-course-v3\complete
```

第一行进入E盘根目录；第二行下载指定分支到p2-course-work；第三行进入完整工程。CMD跨盘符使用`cd /d`；PowerShell使用`Set-Location`。这是两种终端在本手册中主要的区别。

## 3. 准备自己的开发工程

clone已经获得一份可以编辑的本机工程，不需要再复制一次。用VS Code“文件→打开文件夹”选择`E:\p2-course-work`。展开`P2-course-v3/complete`；右击这个目录，选择“在集成终端中打开”。确认终端末尾路径是`complete`。

以下命令Windows CMD / PowerShell共用：

```bat
npm.cmd install
npm.cmd run setup:course
```

第一行安装依赖；第二行创建仅属于本机的.env。数据库在首次启动后端时自动创建；不需要先安装MySQL，也不需要手动运行旧版迁移脚本。.env里的teacher账号用于自己的本机文章管理；随机密码打开.env查看ADMIN_PASSWORD，不发给别人，不提交Git。网站中的注册账号只获得读者权限。

## 4. 开两个终端，运行初稿

VS Code中“终端→新建终端”；进入complete目录后运行下面第一条命令，这是终端A，负责后端。保持窗口运行，不关闭。

```bat
npm.cmd run start:api
```

作用：启动Node接口，监听本机3000端口，创建真实数据库并写入六篇课程文章。看到“课程博客API”表示后端开始监听。

再次选择“终端→新建终端”，这是终端B。若目录不是complete，先按上面的CMD或PowerShell进入目录，再运行：

```bat
npm.cmd run dev
```

作用：启动Vite前端，监听5173端口。浏览器打开`http://127.0.0.1:5173`。浏览器的/api请求由Vite转发到3000，两个终端承担不同工作。

不用VS Code也可以：按Win+R两次分别打开两个cmd窗口，每个窗口都先执行`cd /d E:\p2-course-work\P2-course-v3\complete`，再分别执行后端、前端命令。运行过程中不能在同一个被占用的窗口直接执行另一条命令；停止服务按Ctrl+C。

## 5. 开发：在哪个文件改什么

|课堂|打开文件|具体修改与验收|
|---|---|---|
|第7次|starter/lesson-07/src/components/ArticleCard.vue；complete/src/course.css|修改文章卡片结构、字号与间距；修改标题或新增数据后卡片正确更新。第7次使用stage-7工程独立运行npm install和npm run dev。|
|第8次|stage-8/src/router.js、src/views/ArticleFormView.vue|修改详情入口与必填提示；新增、修改、删除一篇本地文章并刷新验证。本阶段是浏览器本地存储，不是共享数据库。|
|第9次|complete/src/services/articleApi.js、src/stores/articles.js|在F12 Network观察GET；给加载、失败、空数据提供明确提示。停止后端观察错误，再重新启动重试。|
|第10次|complete/server/course-db.js、scripts/inspect-course-db.mjs|查找三张表、主外键、参数化SQL；注册及留言后运行npm.cmd run db:inspect，查看真实记录，重启后端再查。|
|第11次|complete/src/views/RegisterView.vue、src/components/ArticleComments.vue、server/course-app.js|修改注册提示、评论输入区；验证游客不可发言、用户只删自己的评论、教师可管理。每次只修改一处并立即验收。|

完整工程带有最终功能，用来对照与验证，不代替原有学生起步模板的开发任务。原有starter/lesson-07及lesson-08仍保留。stage-7、stage-8是本版阶段答案；第9—11共用complete工程，以不同任务查看工程演进，不声称是三个独立隔离后端。

新页面文章里也写有目标、文件位置、代码解释及验收方法。正文内容在server/data/seedArticles.js。已有数据库不会因修改种子自动覆盖文章：使用teacher登录后通过管理页编辑；public/articles.json只服务只读页面预览。

## 6. 验收真实功能

注册自己的账号→打开文章→留言→刷新→退出后仍能看到留言→用另一账号登录不能删除→切回本人可以删除。关闭并重新启动终端A后，数据库仍保存在var/course-blog.sqlite。

Windows CMD / PowerShell共用，打开第三个终端并进入complete：

```bat
npm.cmd run db:inspect
npm.cmd test
npm.cmd run build
```

第一行读取本机真实数据库结构、记录数量和评论关联结果；第二行执行数据库及组件测试；第三行生成dist前端文件。测试使用临时数据库，不修改课堂数据库。

## 7. 推送到自己的远程仓库

登录GitHub或Gitee→新建一个空仓库，不勾选README/许可证/gitignore→复制HTTPS仓库地址。以下命令在已clone的工程任何子目录均可运行。替换姓名、邮箱、仓库地址后再执行；不要照抄示例地址。

Windows CMD / PowerShell共用：

```bat
git config user.name "你的姓名"
git config user.email "你的邮箱"
git remote rename origin course
git remote add origin https://github.com/你的账号/你的仓库.git
git status
git add .
git diff --cached --stat
git commit -m "feat: complete course blog comments"
git push -u origin HEAD
```

依次表示：设置本仓库提交人；设置邮箱；把课程来源改名course保留；添加自己的远程origin；检查文件；暂存修改；检查将提交的文件；记录版本；推送当前分支并建立跟踪。rename和add只做第一次。若出现course已经存在，执行git remote -v检查，不重复添加。

确认提交中没有.env、var、node_modules、dist；这些已加入.gitignore。已有远程课堂代码的新仓库，即使你暂时没有修改，push也能上传clone获得的内容；若commit提示nothing to commit，跳过commit继续push。GitHub密码不能直接作Git认证密码，按Git Credential Manager弹出的登录流程完成认证；Gitee按平台的令牌说明认证。

以后每次修改使用git status→git add .→git commit -m "本次修改说明"→git push。网页刷新自己的仓库，确认最新提交和代码出现，才算完成远程保存。

## 8. 课堂时间建议

每次90分钟：10分钟看成品和验收目标；15分钟教师结合PPT讲核心概念、演示第一步；45分钟学生实现两项任务；10分钟交叉验收；10分钟Git提交与回顾。命令和文件路径应逐页回填PPT；本次先完成网页和实操说明，旧版PPT还没有同步到v3。

## 当前展示边界

公开网址的第7、8阶段可以操作；第9—11是明确标注的页面预览，没有在线写入功能。本机complete工程的注册、登录、评论和真实SQLite已验证。后续Ubuntu部署使用本机同一套持久化数据库代码；在线PostgreSQL适配已写，尚未拿到可用数据库，不能作为已验证部署。
