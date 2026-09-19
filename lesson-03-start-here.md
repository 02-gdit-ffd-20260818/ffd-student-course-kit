# 项目 1 · 第 3 课：从领取资源到部署上线

本课终点：在自己的个人主页中完成作品卡片的桌面两列、手机单列和悬停反馈，提交到 Git，并让 GitHub Pages 更新线上网页。

效果参考：https://ffd-p1-web-v2-20260918.netlify.app/lesson-03/

课程资源仓库和个人项目是两个不同文件夹：

- `p1-kit-v2`：教师提供的只读课程资源，用来领取文件。
- `p1-homepage`：学生自己的开发工程，用来修改、提交和部署。

全课只需要一个终端。HTML 和 CSS 写在 VS Code 中，不写在终端中。

## 一、领取课程资源

### Windows CMD

打开方式：按 `Win+R`，输入 `cmd`，按回车。

```bat
mkdir "%USERPROFILE%\web-work"
cd /d "%USERPROFILE%\web-work"
git clone --branch p1-lesson3-v2.1 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-kit-v2
```

- `mkdir`：创建统一的开发目录。若目录已经存在，可忽略提示。
- `cd /d`：进入指定目录，同时允许切换磁盘。
- `%USERPROFILE%`：当前学生的用户目录，例如 `C:\Users\Student`。
- `git clone`：把远程课程仓库下载到本机。
- `--branch p1-lesson3-v2.1`：领取本课固定版本。
- `--single-branch`：只下载本课分支，减少干扰。
- 最后的 `p1-kit-v2`：本地课程资源文件夹名称。

如果 `p1-kit-v2` 已存在，不要再次 clone，改为：

```bat
cd /d "%USERPROFILE%\web-work\p1-kit-v2"
git pull
```

### Windows PowerShell

打开方式：开始菜单搜索 `PowerShell`，按回车。

```powershell
New-Item -ItemType Directory -Force -Path (Join-Path $env:USERPROFILE 'web-work') | Out-Null
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work')
git clone --branch p1-lesson3-v2.1 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git p1-kit-v2
```

- `New-Item`：目录不存在时创建，已经存在也不会报错。
- `Set-Location`：进入开发目录。
- `$env:USERPROFILE`：当前学生的用户目录。

已有 `p1-kit-v2` 时运行：

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-kit-v2')
git pull
```

## 二、把本课任务文件复制到自己的项目

正常跟班学生已经有 `p1-homepage`。本课只复制一个 CSS 文件，不覆盖前两课成果。

### Windows CMD

```bat
copy /Y "%USERPROFILE%\web-work\p1-kit-v2\resources\lesson-03-task.css" "%USERPROFILE%\web-work\p1-homepage\lesson-03-task.css"
cd /d "%USERPROFILE%\web-work\p1-homepage"
code .
```

- `copy /Y`：复制文件；目标已存在时直接覆盖本课任务文件。
- `code .`：用 VS Code 打开当前项目。若系统提示找不到 `code`，就在 VS Code 中选“文件 → 打开文件夹”。

### Windows PowerShell

```powershell
Copy-Item -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-kit-v2\resources\lesson-03-task.css') -Destination (Join-Path $env:USERPROFILE 'web-work\p1-homepage\lesson-03-task.css') -Force
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'web-work\p1-homepage')
code .
```

## 三、在 HTML 中连接本课 CSS

打开 `index.html`，找到：

```html
<link href="styles.css" rel="stylesheet">
```

在它的下一行加入：

```html
<link href="lesson-03-task.css" rel="stylesheet">
```

浏览器先读取前两课的 `styles.css`，再读取本课文件。后面的规则可以补充或覆盖前面的同名规则，因此旧成果会保留。

## 四、本地运行并开发

最简单的运行方式：在文件资源管理器中双击 `p1-homepage\index.html`。每次修改后：

1. VS Code 按 `Ctrl+S` 保存。
2. 浏览器按 `Ctrl+R` 刷新。

打开 `lesson-03-task.css`，按 `Ctrl+F` 搜索 `TODO`，只修改 5 行：

```css
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
transition: transform 180ms ease, box-shadow 180ms ease;
transform: translateY(-4px);
grid-template-columns: 1fr;
```

最后一行必须写在 `@media (max-width: 640px)` 内，让手机显示一列。

检查方法：按 `F12` 打开开发者工具，按 `Ctrl+Shift+M` 切换设备工具栏，选择手机尺寸。桌面两列、手机一列、没有横向滚动条即完成。

## 五、保存到 Git 并推送

CMD 和 PowerShell 命令相同，在 `p1-homepage` 目录运行：

```text
git status
git diff
git add index.html lesson-03-task.css
git commit -m "完成第3课响应式作品布局"
git push
```

- `git status`：确认当前目录和改动文件。
- `git diff`：提交前查看具体修改。
- `git add`：只把本课两个文件放入暂存区。
- `git commit`：生成本课版本记录。
- `git push`：把提交发送到自己的远程仓库。

如果 `git push` 提示没有上游分支，运行：

```text
git push -u origin main
```

## 六、第一次开启 GitHub Pages

1. 浏览器进入自己 GitHub 上的 `p1-homepage` 仓库。
2. 点击 `Settings`。
3. 左侧点击 `Pages`。
4. `Source` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/(root)`，点击 `Save`。
6. 等待页面显示实际网址，再点击 `Visit site`。

网址通常形如 `https://你的用户名.github.io/p1-homepage/`，以 Pages 页面显示的地址为准。以后每次 `git push` 都会自动重新部署。

## 七、缺课补做：没有个人项目

CMD：

```bat
cd /d "%USERPROFILE%\web-work"
xcopy "p1-kit-v2\starter\lesson-03" "p1-homepage" /E /I /H
cd /d "p1-homepage"
git init
git branch -M main
git add .
git commit -m "建立项目1个人主页"
```

随后在 GitHub 新建一个空的公开仓库 `p1-homepage`，不要勾选 README，再按 GitHub 页面给出的地址运行：

```text
git remote add origin https://github.com/你的用户名/p1-homepage.git
git push -u origin main
```

## 八、常见问题

- `fatal: not a git repository`：当前不在 `p1-homepage`，先 `cd` 进入项目。
- `destination path ... already exists`：课程资源已下载，进入 `p1-kit-v2` 后运行 `git pull`。
- 页面没变化：确认保存文件、HTML 已连接 `lesson-03-task.css`，再按 `Ctrl+F5` 强制刷新。
- 图片不显示：保留 `assets` 文件夹，不要改 `src="assets/..."`。
- Pages 显示 404：确认仓库公开、分支为 `main`、目录为 `/(root)`，并等待部署完成。
- `git push` 要求登录：按浏览器提示登录 GitHub；不要把密码写进命令或文件。

## 九、课堂交付

提交四项：Git 提交编号、GitHub 仓库地址、GitHub Pages 地址、用一句话解释媒体查询如何让手机变成单列。
