# 学生资源按课领取与 Git 克隆指南

> 每次只领取老师指定的课次。先阅读根目录 `README.md` 和 `课堂资料/本课操作手册.md`；项目代码就在领取目录中，**不要再进入 starter 子目录**。本课参考答案和必要通用文档随包提供。

学生仓库：<https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit>。教师总仓库不作为学生领取入口。

## 1. 先选对分支，不按课次猜名字

当前登记26个分支：21个项目课分支、3个期末课分支和2个项目一展示分支。项目二至五共15课。项目四、五各有自己的第1—3课，不占用主线第12—15课。

<!-- COURSE_BRANCH_TABLE:BEGIN -->
|项目|课次|准确分支名|
|---|---|---|
|项目一|01|`p1-l01-standalone-v3.0`|
|项目一|02|`p1-l02-standalone-v3.0`|
|项目一|03|`p1-l03-standalone-v3.0`|
|项目一|04|`p1-l04-standalone-v3.0`|
|项目一|05|`p1-l05-standalone-v3.0`|
|项目一|06|`p1-l06-standalone-v3.0`|
|项目二|07|`lesson-07`|
|项目二|08|`lesson-08`|
|项目二|09|`lesson-09`|
|项目二|10|`lesson-10`|
|项目二|11|`lesson-11`|
|项目三|12|`lesson-12`|
|项目三|13|`lesson-13`|
|项目三|14|`lesson-14`|
|项目三|15|`lesson-15`|
|项目四|1|`p4-lesson-01`|
|项目四|2|`p4-lesson-02`|
|项目四|3|`p4-lesson-03`|
|项目五|1|`p5-lesson-01`|
|项目五|2|`p5-lesson-02`|
|项目五|3|`p5-lesson-03`|
|期末|16|`lesson-16`|
|期末|17|`lesson-17`|
|期末|18|`lesson-18`|
|项目一展示|CI完成态|`p1-final-cicd`|
|项目一展示|完整简历|`p1-final-resume`|
<!-- COURSE_BRANCH_TABLE:END -->

展示分支用于观察效果，不代替课堂练习起点。第12—15课已经对应群像云图四阶段，不需要教师再手工覆盖旧项目。

## 2. 从零领取：路线 B（新目录）

在自己保存课程的文件夹中打开终端，确认新目录名尚未使用。下面领取项目二第07课；其他课替换成上表对应分支和自己的新目录名。**克隆报错就先停止，不继续执行目录切换。**

**Windows PowerShell**

```powershell
# 变量保存本课分支和本机新目录名；不要覆盖已有个人作品。
$courseBranch = 'lesson-07'
$courseFolder = 'ffd-lesson-07-new'
# clone 下载；--branch 选分支；--single-branch 只取该分支；--depth 1 只取最新一层历史。
git clone --branch $courseBranch --single-branch --depth 1 https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git $courseFolder
# 仅克隆成功后继续：Set-Location 切换目录，Get-ChildItem 列出文件，-Force 也显示隐藏项。
Set-Location $courseFolder
Get-ChildItem -Force
# 查看当前分支；第07课应输出 lesson-07。
git branch --show-current
```

**Windows CMD**

```bat
REM 领取第07课到新目录；看到克隆成功后再执行 cd。
git clone --branch lesson-07 --single-branch --depth 1 https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git ffd-lesson-07-new
REM cd 切换目录；/d 允许同时切换盘符。
cd /d ffd-lesson-07-new
REM dir 列出文件；/a 包含隐藏项。
dir /a
REM 输出应是 lesson-07。
git branch --show-current
```

项目四第一课应选 `p4-lesson-01`，项目五第一课应选 `p5-lesson-01`，不要写成 `lesson-01`。

### 成功后应该看到什么

- `README.md`：本课入口。
- `课堂资料/本课操作手册.md`：任务顺序、修改位置、验证方法。
- `课堂资料/本项目运行与排错.md`：运行和部署补充说明。
- `课堂资料/参考答案/阅读说明.md`：项目课参考答案用法；按任务对照，不整体覆盖个人工程。
- `课堂资料/通用/`：随包通用资料，包括本指南。这不是误下载了所有课程。
- 项目源码、`course-manifest.json` 和 `course-tools/`：代码与续课配套；清单记录本课分支与前置课。

第16—18课是集成与答辩文档包，继续使用自己的项目，不要求这些文档分支包含另一套源码或 `package.json`。项目一只用HTML/CSS/JavaScript，不照搬其他项目的npm命令。

## 3. 保留个人作品：路线 A（继续自己的仓库）

不要在个人作品目录重新克隆、强制重置或覆盖整包答案。先用 `git status` 查看改动，按本课手册提交或备份，再执行续课预演。确认要新增和修改的文件后才正式应用；冲突时逐项保留个人内容。

项目三更换存储阶段时，必须按本课迁移与数据保留说明操作，不能把SQLite/MySQL/PostgreSQL直接互换。跟不上可走路线B，但旧作品和旧数据库先保留。

推送个人成果前执行 `git remote -v`：remote 管理远端，-v 显示地址。确认推送地址是自己的仓库；课程仓库是领取来源，不是个人作业提交目标。建立个人仓库与更换远端按本课手册执行。

## 4. 领取后的操作顺序

1. 读根目录README和本课手册，确认课次与路线。
2. 在项目根目录按手册准备环境、启动；不寻找旧版的 `starter/START_HERE.md`，不照抄上一课运行命令。
3. 按本课TODO顺序修改，每项完成就执行对应验证。“拒绝非法输入”也是正确结果，不是所有请求都应成功。
4. 卡住时先看具体修改范围、参考代码和阶段提示，再对照本课答案；不提前整体覆盖完成态。
5. 基础任务通过后再做AI复盘，提交个人Git记录，完成部署并记录真实结果。

`.env.example` 是可提交模板；`.env` 是真实本机配置，不能提交或随作业发送。下载包不带真实密钥和学生数据库是正常的。

## 5. Git暂时不可用：只下载本课ZIP

在学生仓库网页选择上表准确分支，再用 Code → Download ZIP。解压到新的空目录，打开包含README的那一层。ZIP没有Git历史，之后提交个人仓库需要按手册初始化Git；不能假定续课工具已有可用历史。

PowerShell示例（项目四第1课）：

```powershell
# 指定分支；Join-Path 拼接路径，. 表示当前目录。
$courseBranch = 'p4-lesson-01'
$courseZip = Join-Path . 'ffd-p4-lesson-01.zip'
$courseUnpack = Join-Path . 'ffd-p4-lesson-01-unpacked'
# Test-Path 检查存在性，-or 表示“或者”，throw 停止执行，防止覆盖个人文件。
if ((Test-Path $courseZip) -or (Test-Path $courseUnpack)) { throw '目标已存在，请换新文件名和目录名。' }
# 双引号将变量替换为实际分支名。
$courseUrl = "https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit/archive/refs/heads/$courseBranch.zip"
# -Uri 为地址，-OutFile 为保存路径，-ErrorAction Stop 表示失败立即停止。
Invoke-WebRequest -Uri $courseUrl -OutFile $courseZip -ErrorAction Stop
# -LiteralPath 按原样处理路径，-DestinationPath 指定解压目录；不加覆盖选项。
Expand-Archive -LiteralPath $courseZip -DestinationPath $courseUnpack -ErrorAction Stop
# 查看GitHub生成的顶层文件夹，进入其中才可看到README。
Get-ChildItem -LiteralPath $courseUnpack
```

## 6. 常见错误

|现象|检查与处理|
|---|---|
|`git` 无法识别|安装Git并重开终端，再用 `git --version` 查看版本。|
|`Remote branch ... not found`|核对上表；项目一、四、五不能套用 `lesson-XX`。|
|`destination path ... already exists`|保留旧目录，换新目录领取；个人作品按路线A继续。|
|找不到starter或START_HERE|使用根目录README与 `课堂资料/本课操作手册.md`。|
|看到参考答案和通用资料|这是正常交付内容，先学习再逐项核对答案。|
|找不到package.json|检查是否在工程根目录；项目一和期末文档包不要求该文件。|
|仍看到旧说明|用 `git branch --show-current` 和 `git log -1 --oneline` 核对分支与最近提交，将输出告知教师；不要先删个人成果。|

## 7. 教师发放与维护

班群通知包含项目、课次、准确分支、新目录名及手册路径；不要仅发仓库首页，不要求学生提交到课程仓库。

教师按 `工具/学生分支清单.json` 装配并检查实际学生包，发布后核对远端提交与日期标签。新版本用新标签，不移动旧标签，不强推学生历史。教师维护工具无需学生安装。

文档保存为UTF-8，领取后检查中文和链接。真实配置、私钥与个人数据不得发布；本课参考答案应随包提供，不能再按“发现答案就是领取错误”的旧规则处理。
