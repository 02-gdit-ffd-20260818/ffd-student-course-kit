## 从模板到远程提交的完整跟做入口

初次操作请先阅读 [实操手册](实操手册.md)：领取模板、打开运行、找到原文并修改、检查、首次推送及再次推送均有步骤。[Word 阅读版](实操手册.docx) 可下载后打开。starter 仍保留 TODO，示范代码在手册里供课堂带做。

# P1第05课 主题记忆与请求 v1.2

[按PPT页码操作](操作命令.md) · [本课学生任务](starter/课堂任务.md)

本分支与操作详解版PPT配套。Windows使用PowerShell与npm.cmd。第6课的Ubuntu内容是可选部署参考。

仓库：https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit

分支：`p1-guide-05-v1.2`

## 领取

```powershell
$workRoot = Join-Path $env:USERPROFILE 'web-work'
New-Item -ItemType Directory -Force $workRoot
Set-Location $workRoot
$repo = "https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git"
git clone --single-branch --depth 1 --branch p1-guide-05-v1.2 $repo kit-05-v12
```

每条命令含义见操作命令第7—9页。ZIP备用下载后，将解压所得目录整理为web-work/kit-05-v12，再按PPT继续。不要克隆教师总仓库。
