# 第06课_测试发布与Vue过渡：CMD / PowerShell 统一实操

本课使用固定资源 p1-web-20260918-v2.0。学生正常路线继续修改自己的 p1-homepage；各课 starter 是补课参考状态，不直接覆盖个人工程。

效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-06/

## 使用方法

CMD 与 PowerShell 的页只选一种；其余通用步骤只做一次。命令的说明写在代码框前，注释行以 CMD 的 rem 或 PowerShell 的 # 开头。代码框中的引号保持英文。网页代码只写到明确标出的文件中。Word 适合阅读，复制代码推荐打开本 Markdown 文件。

### PPT 第 1 页：第 06 课  测试发布与Vue过渡

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

P1 一页知我

每次 3×45 分钟，共 6 次课

本课完成效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-06/

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 2 页。

### PPT 第 2 页：本课目标与课堂节奏

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

0—10 分钟：看效果、检查上次版本

10—25：最小讲解与示范

25—50：任务 A；50—60：检查与补讲

60—100：任务 B；100—120：检查、Git

120—135：展示、解释与复盘

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 3 页。

### PPT 第 3 页：当天资源与个人工程

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

教师资源：p1-kit-v2/starter/lesson-06

自己的工程：web-work/p1-homepage

本课素材：p1-kit-v2/resources

手册：p1-kit-v2/docs/lesson-06.md

教师答案留在教师包，课堂按任务推进。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 4 页。

### PPT 第 4 页：打开已有工程：CMD

运行平台：**Windows CMD**。位置：**任意目录**。

cd /d 进入第一课建立的个人工程。不要重新 git init，不要覆盖自己的资料。

```bat
cd /d "%USERPROFILE%\web-work\p1-homepage"
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：提示符末尾是 p1-homepage

完成后回到第 6 页。

### PPT 第 5 页：打开已有工程：PowerShell

运行平台：**Windows PowerShell**。位置：**任意目录**。

Set-Location 进入同一个个人工程；Join-Path 适应用户名含空格。

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work/p1-homepage')
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：提示符末尾是 p1-homepage

完成后回到第 6 页。

### PPT 第 6 页：先检查上次版本

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

第一行检查是否有未保存到 Git 的改动，第二行查看最近提交。

```text
git status
git log -1 --oneline
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：知道从哪个版本开始；有未提交改动先保存与提交。

完成后回到第 7 页。

### PPT 第 7 页：运行网页与打开编辑器

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

文件资源管理器打开 p1-homepage。

双击 index.html，在浏览器查看。

VS Code：文件 → 打开文件夹 → p1-homepage。

改完 Ctrl+S 保存，浏览器 Ctrl+R 刷新。

此路线不安装 npm，不需要两个终端。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：网页可见，编辑器左侧列出工程文件。

完成后回到第 8 页。

### PPT 第 8 页：本课交付物

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

个人网址、源代码、README。

一份电脑与手机验收记录。

至少一次可解释的修复提交。

一次版本恢复练习。

理解 Vue 列表与原生 DOM 的对应关系。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 9 页。

### PPT 第 9 页：打开本地 Vue 对照

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

把 resources/vue-demo 复制到个人工程。

双击 vue-demo/index.html 即可运行。

Vue 3.5.13 文件已本地附带。

此页是独立对照，不覆盖自己的主页。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：四个作品显示；不需要 npm，也不依赖外网CDN。

完成后回到第 10 页。

### PPT 第 10 页：Vue 的数据和模板（1）

运行平台：**VS Code 文件编辑区**。位置：**vue-demo/vue-app.js 与 index.html**。

先看数据来源，再看 v-for、:href 与双大括号。

```javascript
Vue.createApp({
  data() { return { works }; }
}).mount("#vue-works");

<!-- 以下写在 Vue 页面模板内 -->
<li v-for="work in works" :key="work.url">
  <a :href="work.url">{{ work.title }}</a>
</li>
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 11 页。

### PPT 第 11 页：任务 A：交叉测试与修复

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

两人交换网址，按 CHECKLIST.md 检查。

检查资料、图片、链接、窄屏、导航、数组。

记录一个可重现问题：步骤、现象、文件。

修复后按同样步骤重测。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：问题记录具体；修复提交说明原因和结果。

完成后回到第 12 页。

### PPT 第 12 页：检查 A：验收依据

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

网页好看不是唯一标准。

链接必须真实可打开，代码必须能解释。

README 写清运行方式、修改位置和自己的网址。

关闭 JavaScript 仍能阅读静态后备内容。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 13 页。

### PPT 第 13 页：任务 B：完整发布

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

完成 README 与检查单。

检查 git diff，提交并推送 main。

打开 Pages 确认部署成功。

换设备查看；再发布一个可辨认的小改动。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：同一个网址更新；最终提交有日期和功能说明。

完成后回到第 14 页。

### PPT 第 14 页：恢复练习：先建分支

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

在练习分支操作，不影响 main。若同名分支已存在，换 practice-restore-2。

```text
git switch -c practice-restore
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：git branch --show-current 显示 practice-restore

完成后回到第 15 页。

### PPT 第 15 页：制造可恢复的小改动

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

先在 README 末尾添加“恢复练习”，保存，再逐条执行这两行。

```text
git add README.md
git commit -m "练习：增加一行说明"
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：产生一个只修改 README 的练习提交

完成后回到第 16 页。

### PPT 第 16 页：撤销练习并回主线

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

revert 新建反向提交；log 查看记录；最后回 main。不使用 reset --hard。

```text
git revert --no-edit HEAD
git log -3 --oneline
git switch main
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：练习分支有撤销记录，main 保持原成果。

完成后回到第 17 页。

### PPT 第 17 页：后续课程承接

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

P2：Vue、接口、数据库、登录与 Ubuntu 部署。

P3—P5：社区、祝福卡片、音乐站。

P1 持续作为四个作品的入口。

Ubuntu 的逐条命令见本课手册附录。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 18 页。

### PPT 第 18 页：本课验收与提交

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

浏览器刷新后看到本课结果。

资料和已有功能没有被覆盖。

能指出修改文件并解释一处关键代码。

按本课检查单逐项记录。

随后回到终端保存版本。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 19 页。

### PPT 第 19 页：保存本课版本

运行平台：**Windows CMD / PowerShell 通用**。位置：**个人工程 p1-homepage**。

git status 看状态；git diff 看改动；git add 暂存；git commit 保存本地版本；git push 推送远程。逐条执行，不带提示符。

```text
git status
git diff
git add .
git commit -m "完成本课个人主页改动"
git push
```

运行方法：终端命令逐行执行，检查结果后继续。CMD / PowerShell 二选一，不重复执行。

成功标志：推送完成，远程提交记录更新。

遇到问题：nothing to commit 表示没有新差异；推送拒绝先检查分支与权限，不用 --force。

完成后回到第 20 页。

### PPT 第 20 页：发布或更新 GitHub Pages

运行平台：**GitHub 网页**。位置：**自己的 p1-homepage 仓库**。

第一次：仓库 Settings → Pages。

Source 选 Deploy from a branch。

Branch 选 main，目录选 /(root)，点击 Save。

以后 git push 后等待部署结束，打开显示的网址。

网站与仓库链接不同，以 Pages 的 Visit site 为准。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：从 Pages 打开的网站可访问。

遇到问题：404：确认 main 已推送，根目录有 index.html；查看 Actions 中部署是否结束。

完成后回到第 21 页。

### PPT 第 21 页：展示与退出条

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

用网址展示今天的新结果。

指出修改的一个文件和一段代码。

说明一次错误是如何定位的。

记录提交编号与下一步计划。

完成后关闭编辑器前先确认文件已保存。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 21 页。


## Ubuntu 的完整操作入口

[打开 Ubuntu 部署附录](Ubuntu部署附录.md)：Windows SSH 登录 → Ubuntu 领取个人工程 → Nginx 配置 → 更新与恢复。此部分供教师演练与后续部署课使用。
