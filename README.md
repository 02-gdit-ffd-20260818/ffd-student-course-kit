# 《前端框架应用开发》学生按课领取入口

这里不提供整学期大资源包。教师每次课只发当次课的一条领取命令，学生每次只得到本课操作手册与 Starter。

## 学生怎样使用

1. 只复制教师当天发出的命令，不提前领取后续课程。
2. 每次课建立独立目录，例如 `ffd-lesson-01`。
3. 进入本课目录后，依次阅读 `README.md`、操作手册和 `starter/START_HERE.md`。
4. 按本课说明完成代码和验证；先达到成功标准，再做选做挑战。
5. 不在公共资料仓库中提交作业，按教师要求推送到自己的个人项目仓库。普通课提交可运行结果、个人关键提交和 Exit Ticket；第 06、08、16 次课再增加测试、绿色 CI 和可访问 URL；第 17、18 次课按答辩量规提交。

## 教师每课发放表

把当天课次写成两位数字。例如第 1 次课是 `01`，第 9 次课是 `09`。

| 课次 | 分支 | 克隆目录 |
| --- | --- | --- |
| 01 | `lesson-01` | `ffd-lesson-01` |
| 02 | `lesson-02` | `ffd-lesson-02` |
| 03 | `lesson-03` | `ffd-lesson-03` |
| 04 | `lesson-04` | `ffd-lesson-04` |
| 05 | `lesson-05` | `ffd-lesson-05` |
| 06 | `lesson-06` | `ffd-lesson-06` |
| 07 | `lesson-07` | `ffd-lesson-07` |
| 08 | `lesson-08` | `ffd-lesson-08` |
| 09 | `lesson-09` | `ffd-lesson-09` |
| 10 | `lesson-10` | `ffd-lesson-10` |
| 11 | `lesson-11` | `ffd-lesson-11` |
| 12 | `lesson-12` | `ffd-lesson-12` |
| 13 | `lesson-13` | `ffd-lesson-13` |
| 14 | `lesson-14` | `ffd-lesson-14` |
| 15 | `lesson-15` | `ffd-lesson-15` |
| 16 | `lesson-16` | `ffd-lesson-16` |
| 17 | `lesson-17` | `ffd-lesson-17` |
| 18 | `lesson-18` | `ffd-lesson-18` |

## 学生领取命令

以下示例领取第 01 次课。其他课次只需使用教师当天发出的完整命令。

```powershell
# 进入当前 Windows 用户的“文档”目录。
Set-Location (Join-Path $env:USERPROFILE 'Documents')

# 只克隆第 01 次课分支，并且只下载最新一次提交。
git clone --branch lesson-01 --single-branch --depth 1 https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git ffd-lesson-01

# 进入第 01 次课目录。
Set-Location 'ffd-lesson-01'

# 确认只看到 README.md、操作手册和 starter。
Get-ChildItem
```

完整教学资料、Solution、教师脚本、服务器资料不在本学生仓库中。
