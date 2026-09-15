## 本课主流程：Git clone 领取，带注释命令逐步执行

先打开本课实操手册，按领取、备份、导入和开发步骤继续。[全流程手册](实操手册.md) / [Word 版](实操手册.docx)。每个可执行命令框都注明平台、输入位置、当前目录、执行方法，并附 # 注释。初学先使用一个终端。ZIP 作为网络故障时的备用领取方式。

## 从模板到远程提交的完整跟做入口

初次操作请先阅读 [实操手册](实操手册.md)：领取模板、打开运行、找到原文并修改、检查、首次推送及再次推送均有步骤。[Word 阅读版](实操手册.docx) 可下载后打开。starter 仍保留 TODO，示范代码在手册里供课堂带做。

# P1第04课 筛选与排序 v1.2

[按PPT页码操作](操作命令.md) · [本课学生任务](starter/课堂任务.md)

本分支与操作详解版PPT配套。Windows使用PowerShell与npm.cmd。第6课的Ubuntu内容是可选部署参考。

仓库：https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit

分支：`p1-guide-04-v1.2`

## 领取

```powershell
$workRoot = Join-Path $env:USERPROFILE 'web-work'
New-Item -ItemType Directory -Force $workRoot
Set-Location $workRoot
$repo = "https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git"
git clone --single-branch --depth 1 --branch p1-guide-04-v1.2 $repo kit-04-v12
```

每条命令含义见操作命令第7—9页。ZIP备用下载后，将解压所得目录整理为web-work/kit-04-v12，再按PPT继续。不要克隆教师总仓库。
