## Windows 第一次操作入口

如果还不会领取和运行初稿，先打开 [Windows鼠标入门_先把第一课运行起来](Windows鼠标入门_先把第一课运行起来.md)。只用一个工程文件夹、一个终端、两条运行命令。[下载直接打开的初稿包](P1_第一课_直接打开版.zip)，解压后得到 p1-portfolio。原来的 Git 领取流程等熟悉后再使用。

## 从模板到远程提交的完整跟做入口

初次操作请先阅读 [实操手册](实操手册.md)：领取模板、打开运行、找到原文并修改、检查、首次推送及再次推送均有步骤。[Word 阅读版](实操手册.docx) 可下载后打开。starter 仍保留 TODO，示范代码在手册里供课堂带做。

# P1第01课 名片上线 v1.2

[按PPT页码操作](操作命令.md) · [本课学生任务](starter/课堂任务.md)

本分支与操作详解版PPT配套。Windows使用PowerShell与npm.cmd。第6课的Ubuntu内容是可选部署参考。

仓库：https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit

分支：`p1-guide-01-v1.2`

## 领取

```powershell
$workRoot = Join-Path $env:USERPROFILE 'web-work'
New-Item -ItemType Directory -Force $workRoot
Set-Location $workRoot
$repo = "https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git"
git clone --single-branch --depth 1 --branch p1-guide-01-v1.2 $repo kit-01-v12
```

每条命令含义见操作命令第7—9页。ZIP备用下载后，将解压所得目录整理为web-work/kit-01-v12，再按PPT继续。不要克隆教师总仓库。
