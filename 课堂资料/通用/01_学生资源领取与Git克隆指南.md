# 学生资源按课领取与 Git 克隆指南

> 发放对象是学生。不要在开学时发整学期资源包，也不要让学生直接克隆仓库默认分支。教师每次课只发本课的一条命令，学生每次只领取“本课操作手册 + 本课 Starter”。

学生仓库主页：<https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit>

## 现在采用什么发放方式

仓库已经拆成 `lesson-01` 到 `lesson-18` 共 18 个按课分支。

- 默认分支只有一份领取说明，不再装入整学期的几百个文件。
- 每个 `lesson-XX` 分支只有 `README.md`、一份本课操作手册和一个 `starter`。
- 学生使用 `--single-branch --depth 1`，只下载本课最新内容，不会得到其他课资料。
- 第 16—18 课共用 Final Starter，但操作手册分别对应集成、产品答辩和工程答辩。
- 教师总仓库、Solution、导演脚本、密钥和真实数据库始终不对学生发放。

## 教师每次课怎样发

课前从下面模板把课次改成两位数字，例如第 1 课写 `01`，然后把整个代码块发到班群。不要只发仓库首页让学生自行寻找。

```powershell
# 本行由教师按当天课次填写，两位数字范围为 01 到 18。
$lesson = '01'

# 建立本课独立目录；--single-branch 表示只领本课，--depth 1 表示只取最新版本。
git clone --branch "lesson-$lesson" --single-branch --depth 1 https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git "ffd-lesson-$lesson"

# 进入本课目录。
Set-Location "ffd-lesson-$lesson"

# 确认当前只看到 README、操作手册和 starter。
Get-ChildItem
```

建议教师在上课前亲自复制运行一次。第 1 课实际发给学生的完整命令如下：

```powershell
# 进入当前 Windows 用户的“文档”目录。
Set-Location (Join-Path $env:USERPROFILE 'Documents')

# 只克隆第 01 次课分支，并只下载最新一次提交。
git clone --branch lesson-01 --single-branch --depth 1 https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git ffd-lesson-01

# 进入第 01 次课目录。
Set-Location 'ffd-lesson-01'

# 确认目录中只有本课必要资源。
Get-ChildItem
```

成功标志：能够看到 `README.md`、`操作手册`、`starter` 三项；看不到其他 17 次课，也看不到任何 `_solution`。

## 18 次课准确分支表

教师只需要找到当天这一行。网页链接用于课前检查内容，班群中仍建议发送上面带注释的 PowerShell 代码块。

> **第 12—15 课注意**：这四个分支目前装的还是旧版项目 3 与项目 4、5 的内容。项目 3 已改为「群像云图」四阶段工程演进，**开课前必须用 `04_项目3_群像云图_完整课堂包/学生起步/lesson-XX/` 覆盖这四个分支**，否则学生领到的是旧资料。覆盖前先打开上表的网页链接确认分支内容。

| 课次 | 当天分支 | 教师课前检查链接 |
| --- | --- | --- |
| 01 | `lesson-01` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-01> |
| 02 | `lesson-02` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-02> |
| 03 | `lesson-03` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-03> |
| 04 | `lesson-04` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-04> |
| 05 | `lesson-05` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-05> |
| 06 | `lesson-06` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-06> |
| 07 | `lesson-07` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-07> |
| 08 | `lesson-08` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-08> |
| 09 | `lesson-09` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-09> |
| 10 | `lesson-10` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-10> |
| 11 | `lesson-11` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-11> |
| 12 | `lesson-12` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-12> |
| 13 | `lesson-13` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-13> |
| 14 | `lesson-14` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-14> |
| 15 | `lesson-15` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-15> |
| 16 | `lesson-16` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-16> |
| 17 | `lesson-17` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-17> |
| 18 | `lesson-18` | <https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/tree/lesson-18> |

## 学生上课后怎样做

学生不要继续在领取仓库根目录中写代码，按以下顺序操作：

1. 打开 `README.md`，确认课次。
2. 打开 `操作手册` 中唯一的一份本课手册。
3. 进入 `starter`，先阅读 `START_HERE.md`。
4. 在 `starter` 中运行基线命令、完成项目并建立自己的 Git 提交。
5. 按教师要求把个人项目推送到个人仓库，提交测试、CI 和部署 URL。

学生进入 Starter 的通用命令：

```powershell
# 进入本次领取目录中的 starter；请先确保终端当前位于 ffd-lesson-XX。
Set-Location 'starter'

# 显示普通文件和隐藏文件，确认 package.json、.gitignore 等是否齐全。
Get-ChildItem -Force

# 用记事本打开本课起步说明；也可以在 VS Code 中打开。
notepad '.\START_HERE.md'
```

具体安装、运行、测试和构建命令，以本课 `START_HERE.md` 为准，不要从上一课照抄。

## 网络不好时怎样只下载本课 ZIP

Git 不可用时，不发整学期 ZIP。教师把当天分支号代入下面地址：

```text
https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/archive/refs/heads/lesson-01.zip
```

例如下载第 01 次课：

```powershell
# 设置当天课次，必须是两位数字。
$lesson = '01'

# 把本课 ZIP 保存到当前用户的“下载”目录。
$zipPath = Join-Path $env:USERPROFILE "Downloads\ffd-lesson-$lesson.zip"

# 组合本课分支的 ZIP 地址，只下载当天分支。
$zipUrl = "https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/archive/refs/heads/lesson-$lesson.zip"

# 下载本课 ZIP。
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

# 解压到“文档”目录下的本课独立文件夹。
$unpackPath = Join-Path $env:USERPROFILE "Documents\ffd-lesson-$lesson-zip"
Expand-Archive -LiteralPath $zipPath -DestinationPath $unpackPath -Force

# 显示解压结果。
Get-ChildItem -LiteralPath $unpackPath
```

## 教师班群公告模板

```text
第 XX 次课资源现在发放。本次只领取本课，不下载整学期资料。

请把老师发出的 PowerShell 命令整块复制运行。成功后只能看到：
1. README.md
2. 操作手册
3. starter

先读操作手册，再进入 starter 阅读 START_HERE.md。不要寻找后续课程，也不要复制教师 Solution。
下课前提交个人仓库、关键 commit、测试、CI、可访问 URL 和三句话复盘。
```

## 常见错误

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `git` 无法识别 | 未安装 Git，或安装后没有重开终端 | 按环境准备安装 Git，关闭并重新打开 PowerShell |
| `Remote branch lesson-XX not found` | 课次没有写成 `01`—`18` 两位数字 | 核对教师当天发出的原命令，不要自行修改 |
| `destination path ... already exists` | 本课目录已经领取过 | 不要覆盖；先打开已有目录，确需重领时换一个新目录名 |
| 看到很多课次和公共资料 | 错误地克隆了默认分支的旧版本或旧 ZIP | 停止使用，重新执行带 `--branch lesson-XX --single-branch --depth 1` 的命令 |
| 看到了 `_solution` | 领取来源错误 | 立即停止使用并通知教师；学生分支中不应存在 Solution |
| 不知道从哪个文件开始 | 没有阅读本课入口 | 依次打开 `README.md`、操作手册、`starter/START_HERE.md` |

## 教师维护规则

1. 每课只更新对应 `lesson-XX` 分支，不把全课程资料重新塞回默认分支。
2. 学生已经领取后如需修订，教师发布新的目录名，例如 `ffd-lesson-07-fix1`，避免覆盖学生代码。
3. 每次推送前检查分支根目录只能有 README、操作手册和 starter。
4. 每次推送前搜索并确认没有 `_solution`、`.env`、私钥、服务器账号和真实数据。
5. 完整资料仍保留在教师总仓库，学生仓库只承担按课领取。
6. 所有 README 必须保存为 UTF-8；推送后必须在 GitHub 网页确认中文标题和正文正常，不得以本地显示正常代替远程检查。
7. 自动生成 Git 内容时不要让中文正文经过 Windows PowerShell 的默认文本管道；应从已经保存为 UTF-8 的文件创建 Git Blob，并再次读取远程文件验证。
