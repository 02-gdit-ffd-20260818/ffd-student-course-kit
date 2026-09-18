# 第05课_数组对象与作品数据化：CMD / PowerShell 统一实操

本课使用固定资源 p1-web-20260918-v2.0。学生正常路线继续修改自己的 p1-homepage；各课 starter 是补课参考状态，不直接覆盖个人工程。

效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-05/

## 使用方法

CMD 与 PowerShell 的页只选一种；其余通用步骤只做一次。命令的说明写在代码框前，注释行以 CMD 的 rem 或 PowerShell 的 # 开头。代码框中的引号保持英文。网页代码只写到明确标出的文件中。Word 适合阅读，复制代码推荐打开本 Markdown 文件。

### PPT 第 1 页：第 05 课  数组对象与作品数据化

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

P1 一页知我

每次 3×45 分钟，共 6 次课

本课完成效果：https://ffd-p1-web-v2-20260918.netlify.app/lesson-05/

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

教师资源：p1-kit-v2/starter/lesson-05

自己的工程：web-work/p1-homepage

本课素材：p1-kit-v2/resources

手册：p1-kit-v2/docs/lesson-05.md

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

### PPT 第 8 页：数据与页面结构分开

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

一个对象表示一个作品。

数组保存多个作品。

forEach 遍历数据。

createWorkCard 生成一张卡片。

renderWorks 把卡片放到作品列表。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 9 页。

### PPT 第 9 页：作品对象（1）

运行平台：**VS Code 文件编辑区**。位置：**works-data.js**。

在已复制的 works-data.js 中修改字段值；此处只展示一个对象。

```javascript
// 摘录：works 数组中的一个对象；保留模板其余对象。
{
  title: "长风成卷 · 博客应用",
  description: "文章展示、接口与数据库。",
  image: "assets/work-blog.png",
  url: "https://ffd-p2-blog.netlify.app/"
}
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：保留数组的方括号、对象之间的逗号和其余三个作品。

遇到问题：代码写在文件中，不输入终端。

完成后回到第 10 页。

### PPT 第 10 页：任务 A：准备数据与文件

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

从 resources 复制两份模板到个人工程。

works-data-template.js 改名 works-data.js。

works-render-starter.js 改名 works-render.js。

填好四个作品，检查图片路径与网址。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：works 是含4个对象的数组；先用控制台核对。

完成后回到第 11 页。

### PPT 第 11 页：脚本的加载顺序（1）

运行平台：**VS Code 文件编辑区**。位置：**index.html 的 head**。

用下面三行替换原有 app.js 引用，不能重复引入；顺序是数据、渲染、导航。

```text
<script src="works-data.js" defer></script>
<script src="works-render.js" defer></script>
<script src="app.js" defer></script>
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 12 页。

### PPT 第 12 页：检查 A：避免四项变成八项

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

不要在已有列表末尾反复 append 全部作品。

使用 replaceChildren 一次替换列表。

title.textContent 写入标题，避免把文字当成 HTML。

本课数据来自自己维护的可信文件。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 13 页。

### PPT 第 13 页：任务 B：填完渲染骨架

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

打开 works-render.js，完成三个 TODO。

标题使用 work.title，说明使用 work.description。

最后调用 renderWorks(works)。

下面几页逐段解释老师提供的骨架，不要求盲抄。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：四项仍完整；加一条变五项，空数组有说明。

完成后回到第 14 页。

### PPT 第 14 页：作品生成函数（1）

运行平台：**VS Code 文件编辑区**。位置：**works-render.js**。

对照自己文件阅读，理解 createElement、textContent、append 的分工。

```javascript
// 原生 DOM 渲染：数据和布局分离；用 textContent 写入文字。
function createWorkCard(work) {
  const item = document.createElement('li');
  item.className = 'work-card';
  const link = document.createElement('a');
  link.href = work.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const cover = document.createElement('div');
  cover.className = 'work-cover';
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 15 页。

### PPT 第 15 页：作品生成函数（2）

运行平台：**VS Code 文件编辑区**。位置：**works-render.js**。

对照自己文件阅读，理解 createElement、textContent、append 的分工。

```javascript
  const image = document.createElement('img');
  image.src = work.image;
  image.alt = work.title + '的网页截图';
  image.width = 1200;
  image.height = 800;
  cover.append(image);
  const copy = document.createElement('div');
  copy.className = 'work-copy';
  const title = document.createElement('h3');
  title.textContent = work.title;
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 16 页。

### PPT 第 16 页：作品生成函数（3）

运行平台：**VS Code 文件编辑区**。位置：**works-render.js**。

对照自己文件阅读，理解 createElement、textContent、append 的分工。

```javascript
  const description = document.createElement('p');
  description.textContent = work.description;
  copy.append(title, description);
  link.append(cover, copy);
  item.append(link);
  return item;
}

function renderWorks(items) {
  const list = document.querySelector('.portfolio-list');
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 17 页。

### PPT 第 17 页：作品生成函数（4）

运行平台：**VS Code 文件编辑区**。位置：**works-render.js**。

对照自己文件阅读，理解 createElement、textContent、append 的分工。

```javascript
  const fragment = document.createDocumentFragment();
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = '暂时没有作品，请稍后补充。';
    fragment.append(empty);
  } else {
    items.forEach(function (work) {
      fragment.append(createWorkCard(work));
    });
  }
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 18 页。

### PPT 第 18 页：作品生成函数（5）

运行平台：**VS Code 文件编辑区**。位置：**works-render.js**。

对照自己文件阅读，理解 createElement、textContent、append 的分工。

```javascript
  // 一次替换，重复调用也不会把四个作品变成八个。
  list.replaceChildren(fragment);
}
renderWorks(works);
```

运行方法：在指定文件定位后编辑；Ctrl+S 保存，再刷新浏览器。

成功标志：按完整手册顺序写入同一文件后保存

遇到问题：代码写在文件中，不输入终端。

完成后回到第 19 页。

### PPT 第 19 页：本课验收与提交

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

浏览器刷新后看到本课结果。

资料和已有功能没有被覆盖。

能指出修改文件并解释一处关键代码。

按本课检查单逐项记录。

随后回到终端保存版本。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 20 页。

### PPT 第 20 页：保存本课版本

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

完成后回到第 21 页。

### PPT 第 21 页：发布或更新 GitHub Pages

运行平台：**GitHub 网页**。位置：**自己的 p1-homepage 仓库**。

第一次：仓库 Settings → Pages。

Source 选 Deploy from a branch。

Branch 选 main，目录选 /(root)，点击 Save。

以后 git push 后等待部署结束，打开显示的网址。

网站与仓库链接不同，以 Pages 的 Visit site 为准。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

成功标志：从 Pages 打开的网站可访问。

遇到问题：404：确认 main 已推送，根目录有 index.html；查看 Actions 中部署是否结束。

完成后回到第 22 页。

### PPT 第 22 页：展示与退出条

运行平台：**浏览器 / VS Code**。位置：**个人工程 p1-homepage**。

用网址展示今天的新结果。

指出修改的一个文件和一段代码。

说明一次错误是如何定位的。

记录提交编号与下一步计划。

完成后关闭编辑器前先确认文件已保存。

运行方法：按本页顺序操作；课堂任务完成后回到 PPT 的下一检查页。

完成后回到第 22 页。

