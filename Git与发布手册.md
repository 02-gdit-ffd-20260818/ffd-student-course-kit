# P1 Git与发布手册

## 先区分四个结果

commit是本地版本记录；push把记录传到远程；Actions执行检查与构建；Pages部署成功后仍需打开页面检查。每名学生使用自己的独立仓库与固定网址。不要在教师总仓库根目录执行下面命令。

代码使用Node 24和npm。第1—5课提供无需额外依赖的本地服务器；第6课使用已锁定依赖的Vite。网站主路径沿用GitHub Pages，其他平台按原课程备用手册使用。

## 第01课：首次初始化

先把学生起步/lesson-01复制到自己的工作目录，例如 E:/web-work/my-portfolio。用编辑器打开该目录，完成核心任务后运行全部验证。

```powershell
npm run check:lesson
npm run check
npm test
npm run build
git init -b main
```

只在本仓库设置个人显示身份，按实际信息替换文字。邮箱可使用GitHub提供的noreply邮箱。

```powershell
git config user.name "你的显示名"
git config user.email "你的Git提交邮箱"
git status
git diff
git add .
git commit -m "feat: publish my first portfolio"
```

首次暂存前检查.gitignore已排除node_modules和dist，确认只包含学生自己的项目文件。若目录已是个人Git仓库，不要重新初始化，也不要删除.git。

## 在GitHub建立个人仓库

1. 登录自己的GitHub账号，创建例如my-portfolio的仓库。课堂默认使用可公开展示的内容；GitHub Free的Pages课堂主路径使用公开仓库。
2. 为避免首次历史冲突，创建时不额外生成README、.gitignore和LICENSE；本地已具备必要文件。
3. 复制GitHub展示的HTTPS仓库地址，替换下方示例中的用户名与仓库名。

```powershell
git remote add origin https://github.com/你的用户名/my-portfolio.git
git push -u origin main
```

登录认证按GitHub/Git Credential Manager提示完成。不要把token或密码写入PPT、代码或仓库URL。若origin已存在，先git remote -v确认，不重复添加或擅自改成教师仓库。

## 启用Pages并检查首次部署

1. 在仓库Settings中打开Pages。
2. Build and deployment的Source选择GitHub Actions。
3. 打开Actions，找到test-and-deploy-pages工作流。如果首次推送早于Pages设置导致失败，设置好后重跑失败任务，或使用Run workflow手动运行main。
4. 查看verify任务：安装、检查、测试、课堂验收、构建、上传产物。
5. 查看deploy任务与部署产生的URL。普通项目站点通常形如 https://用户名.github.io/my-portfolio/，最终以GitHub显示地址为准。
6. 用同桌设备或未登录窗口打开，点击作品链接，确认页面显示本次提交内容。

仓库已提供.github/workflows/deploy-pages.yml，不要求学生首次课手写YAML。学生必须知道红色步骤在哪里、部署的是哪个commit。

官方说明：[配置发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[自定义Pages工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。核对日期：2026-09-14。

## 第02—06课：继续同一个仓库

先将上一课工作提交并保证git status干净，然后创建本课分支；课次数字按实际替换。

```powershell
git switch main
git switch -c lesson-02
```

按版本衔接表加入本课新增骨架与TODO，保留.git和个人内容。实现后先测试，再选择相关文件暂存、提交。

```powershell
git status
git diff
git add styles.css index.html
git commit -m "feat: improve responsive and print layouts"
```

上面add的文件适用于第02课示例。其他课以实际改动为准；检查脚本、package.json、锁文件或工作流有变化也应一并记录。检查干净后合并回主线并推送。

```powershell
git switch main
git merge --ff-only lesson-02
git push origin main
```

个人串行开发、main未同时变化时通常可快进合并。若报不能快进，先保留工作、查看git log --oneline --graph --all，由教师协助处理分叉，不运行强制重置。本课程可后续练习Pull Request，但普通初学课不强制每次走完整协作流程。

## 第06课：Vue里程碑

Vue项目构建命令仍为npm run build，输出dist。本包使用base:'./'适配当前无路由P1的仓库子路径。个人数据迁入public/projects.json，同时更新src/data/projects.js中的回退数据。

在公开页面完成正常、空态、失败回退、主题、手机和打印回归后，给已验证版本建立标签。

```powershell
git tag -a p1-v2.0 -m "P1 Vue milestone verified"
git push origin p1-v2.0
```

标签标记版本，不替代部署，也不会覆盖已存在的同名标签。已有标签需先检查，不强制移动。

## 出现问题时

| 问题 | 先检查 | 处理 |
| --- | --- | --- |
| npm找不到package.json | 终端当前目录 | 回到个人项目目录 |
| 端口被占用 | 前一课服务器是否仍在运行 | 在原终端Ctrl+C停止，或按终端新地址访问 |
| Git无法提交 | 报错是否要求姓名邮箱 | 设置仓库级身份后重试 |
| push被拒绝 | 远程地址、登录身份、历史是否分叉 | 读取错误，不使用force覆盖历史 |
| Actions失败 | 第一个失败步骤与对应commit | 本地复现并修复后提交 |
| Pages设置不可用 | 仓库权限、可见性及账号计划 | 教师课前确认，不在课堂临时改共享权限 |
| 网站404 | Pages来源、deploy状态、网址子路径 | 使用部署显示的地址，确认index.html进入dist |
| 页面旧内容 | 推送commit与部署commit是否一致 | 等待对应部署完成，再刷新 |

平台或网络排错连续10分钟仍无进展：保留本地构建与故障记录，继续功能练习；课后补公网证据。原课程的EdgeOne备用部署手册由教师统一选择一次验证，不要求全班同课新学两个平台。

## 查看历史与恢复练习

先用git log --oneline找到已知版本。查看旧文件可用git show 提交号:文件路径。恢复练习应在单独练习分支进行，先保存当前工作，不使用reset --hard清空未提交内容。

对于一个普通、非合并的错误提交，教师可演示git revert 提交号，通过新提交撤销它，然后复测与重新发布。恢复成功仍需要页面验证。
