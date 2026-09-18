# 第02课_CSS字体配色与盒模型：CMD / PowerShell 统一实操

本课使用固定资源 p1-web-20260918-v2.0。学生正常路线继续修改自己的 p1-homepage；各课 starter 是补课参考状态，不直接覆盖个人工程。

效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-02/

## 使用方法

CMD 与 PowerShell 的页只选一种；其余通用步骤只做一次。命令的说明写在代码框前，注释行以 CMD 的 rem 或 PowerShell 的 # 开头。代码框中的引号保持英文。网页代码只写到明确标出的文件中。Word 适合阅读，复制代码推荐打开本 Markdown 文件。

### PPT 第 1 页：第 02 课  CSS字体配色与盒模型

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

P1 一页知我

每次 3×45 分钟，共 6 次课

本课完成效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-02/

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

教师资源：p1-kit-v2/starter/lesson-02

自己的工程：web-work/p1-homepage

本课素材：p1-kit-v2/resources

手册：p1-kit-v2/docs/lesson-02.md

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

### PPT 第 8 页：CSS 的选择器、属性和值

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

先只看 h2 { color: … }。

选择器决定改谁，属性决定改什么。

font-size 字号；font-weight 字重；line-height 行高。

margin 是外间距，padding 是内间距。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 9 页。

### PPT 第 9 页：主题变量（1）

运行平台：**VS Code 文件编辑区**。位置：**styles.css 文件末尾**。

第一行注释之后的 :root 集中保存变量。

```text
/* 第 2 课：基础样式保留。把下面的变量与规则加入 styles.css。 */
:root { --heading: #254a40; --subheading: #7c6348; --background: #fbfaf6; --body-size: 19px; }
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 10 页。

### PPT 第 10 页：任务 A：字体与颜色

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

保留 styles.css 原有起步规则。

打开 resources/lesson-02.css。

把内容追加到自己的 styles.css 文件末尾。

修改 --heading、--body-size 后刷新。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：正文暖白背景，标题墨绿，字号变化可见。

完成后回到第 11 页。

### PPT 第 11 页：检查 A：为什么没变化

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

是否 Ctrl+S 保存了正确文件？

index.html 是否引用 styles.css？

选择器拼写是否一致？

后面的同名规则会覆盖前面的规则。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 12 页。

### PPT 第 12 页：盒模型与层次（1）

运行平台：**VS Code 文件编辑区**。位置：**styles.css**。

栏目标题可有浅底；科研子项目标题保持无底纹。

```text
h2 {
  padding: 8px 14px;
  border-left: 3px solid #b8a27d;
  background: #edf1ea;
}
.research-item { margin-bottom: 24px; }
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 13 页。

### PPT 第 13 页：任务 B：让长页面好读

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

调整标题与段落间距。

把项目经历之间的间距增大，再观察。

用开发者工具查看一个 h2 的样式。

用截图对比修改前后，解释一个选择。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：主标题、次标题、正文能区分；不靠空格凑布局。

完成后回到第 14 页。

### PPT 第 14 页：本课验收与提交

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

浏览器刷新后看到本课结果。

资料和已有功能没有被覆盖。

能指出修改文件并解释一处关键代码。

按本课检查单逐项记录。

随后回到终端保存版本。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 15 页。

### PPT 第 15 页：保存本课版本

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

完成后回到第 16 页。

### PPT 第 16 页：发布或更新 GitHub Pages

运行平台：**GitHub 网页**。位置：**自己的 p1-homepage 仓库**。

第一次：仓库 Settings → Pages。

Source 选 Deploy from a branch。

Branch 选 main，目录选 /(root)，点击 Save。

以后 git push 后等待部署结束，打开显示的网址。

网站与仓库链接不同，以 Pages 的 Visit site 为准。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：从 Pages 打开的网站可访问。

遇到问题：404：确认 main 已推送，根目录有 index.html；查看 Actions 中部署是否结束。

完成后回到第 17 页。

### PPT 第 17 页：展示与退出条

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

用网址展示今天的新结果。

指出修改的一个文件和一段代码。

说明一次错误是如何定位的。

记录提交编号与下一步计划。

完成后关闭编辑器前先确认文件已保存。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 17 页。

