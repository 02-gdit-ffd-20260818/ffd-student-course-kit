# 第04课_JavaScript导航交互：CMD / PowerShell 统一实操

本课使用固定资源 p1-web-20260918-v2.0。学生正常路线继续修改自己的 p1-homepage；各课 starter 是补课参考状态，不直接覆盖个人工程。

效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-04/

## 使用方法

CMD 与 PowerShell 的页只选一种；其余通用步骤只做一次。命令的说明写在代码框前，注释行以 CMD 的 rem 或 PowerShell 的 # 开头。代码框中的引号保持英文。网页代码只写到明确标出的文件中。Word 适合阅读，复制代码推荐打开本 Markdown 文件。

### PPT 第 1 页：第 04 课  JavaScript导航交互

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

P1 一页知我

每次 3×45 分钟，共 6 次课

本课完成效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-04/

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

教师资源：p1-kit-v2/starter/lesson-04

自己的工程：web-work/p1-homepage

本课素材：p1-kit-v2/resources

手册：p1-kit-v2/docs/lesson-04.md

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

### PPT 第 8 页：JavaScript 只增加一个交互

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

HTML 锚点负责跳转。

CSS 的 is-current 类负责选中外观。

JavaScript 判断哪个链接匹配当前锚点。

先操作一个链接，再循环全部链接。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 9 页。

### PPT 第 9 页：找到导航并读取锚点（1）

运行平台：**VS Code 文件编辑区**。位置：**新建 app.js**。

先复制起步骨架，TODO 注释处是本课需要补的代码。

```javascript
// 第 4 课任务：补全选中状态与事件；HTML 锚点仍可正常跳转。
const navLinks = document.querySelectorAll('nav a');
function updateNavigation() {
  const currentSection = window.location.hash || '#about';
  navLinks.forEach(function (link) {
    // TODO-JS-A：比较 href 与 currentSection，然后切换 is-current。
  });
}
// TODO-JS-B：监听 hashchange，并在首次打开时调用函数。
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 10 页。

### PPT 第 10 页：任务 A：让一个链接高亮

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

复制 resources/app-starter.js，改名 app.js。

在 HTML 的 head 加入脚本引用。

在函数中 currentSection 下一行写 console.log(currentSection)。

文件末尾写 updateNavigation();，保存并打开 F12 的 Console。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：刷新后控制台显示当前栏目ID；事件监听在任务 B 完成。

完成后回到第 11 页。

### PPT 第 11 页：引入与条件（1）

运行平台：**VS Code 文件编辑区**。位置：**HTML head 与 app.js（分开填写）**。

defer 等文档解析后再运行；条件为真时添加类名。

```javascript
<script src="app.js" defer></script>

// 以下两行写在 app.js 的 forEach 内
const isCurrent = link.getAttribute("href") === currentSection;
link.classList.toggle("is-current", isCurrent);
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 12 页。

### PPT 第 12 页：检查 A：三种常见错误

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

#skills 与 skills 不相等。

脚本文件名和 HTML 引用必须一致。

文件中漏了括号或引号，先看 Console 第一条错误。

不要在终端粘贴 document.querySelectorAll。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 13 页。

### PPT 第 13 页：事件与首次运行（1）

运行平台：**VS Code 文件编辑区**。位置：**app.js 文件末尾**。

第一行处理之后的变化；第二行处理第一次打开。

```javascript
window.addEventListener("hashchange", updateNavigation);
updateNavigation();
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 14 页。

### PPT 第 14 页：任务 B：完成导航状态

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

填完条件与类名切换。

补 hashchange 监听，首次主动执行函数。

选中的链接添加 aria-current="location"。

不匹配时移除 aria-current。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：点击、后退、直接打开 #skills 都只高亮一个栏目。

完成后回到第 15 页。

### PPT 第 15 页：可访问的选中状态（1）

运行平台：**VS Code 文件编辑区**。位置：**app.js 的 forEach 内**。

读屏软件也能知道哪一项当前被选中。

```javascript
if (isCurrent) {
  link.setAttribute("aria-current", "location");
} else {
  link.removeAttribute("aria-current");
}
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 16 页。

### PPT 第 16 页：本课验收与提交

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

浏览器刷新后看到本课结果。

资料和已有功能没有被覆盖。

能指出修改文件并解释一处关键代码。

按本课检查单逐项记录。

随后回到终端保存版本。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 17 页。

### PPT 第 17 页：保存本课版本

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

完成后回到第 18 页。

### PPT 第 18 页：发布或更新 GitHub Pages

运行平台：**GitHub 网页**。位置：**自己的 p1-homepage 仓库**。

第一次：仓库 Settings → Pages。

Source 选 Deploy from a branch。

Branch 选 main，目录选 /(root)，点击 Save。

以后 git push 后等待部署结束，打开显示的网址。

网站与仓库链接不同，以 Pages 的 Visit site 为准。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：从 Pages 打开的网站可访问。

遇到问题：404：确认 main 已推送，根目录有 index.html；查看 Actions 中部署是否结束。

完成后回到第 19 页。

### PPT 第 19 页：展示与退出条

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

用网址展示今天的新结果。

指出修改的一个文件和一段代码。

说明一次错误是如何定位的。

记录提交编号与下一步计划。

完成后关闭编辑器前先确认文件已保存。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 19 页。

