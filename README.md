# 本次课学生领取包

本分支只包含本次课必需的三部分：本页说明、操作手册和 `starter`。这里没有教师答案，也没有其他课次资料。

## 请按顺序操作

1. 打开“操作手册”文件夹，其中只有本次课的一份操作手册。
2. 进入 `starter` 文件夹，先阅读 `START_HERE.md`。
3. 按 `START_HERE.md` 中带注释的命令检查基线。
4. 在 `starter` 中完成本课要求的代码和验证；先达到成功标准，再做选做挑战。
5. 本课是里程碑课：下课前提交可运行结果、个人关键提交、Exit Ticket、测试结果、绿色 CI 和可访问 URL。

## 确认自己领到了哪一次课

在 PowerShell 中整块复制：

```powershell
# 显示当前领取分支，例如 lesson-01。
git branch --show-current

# 显示本次课根目录，应只有 README.md、操作手册和 starter。
Get-ChildItem

# 进入 Starter。
Set-Location 'starter'

# 显示 Starter 中的普通文件和隐藏文件。
Get-ChildItem -Force

# 用记事本打开起步说明；也可以使用 VS Code 打开。
notepad '.\START_HERE.md'
```

如果分支号与教师当天公布的课次不一致，请停止操作并重新核对领取命令。

## 重要边界

- 不寻找、不索取、不复制教师 `Solution`。
- 不把密钥、`.env`、服务器账号或真实数据提交到 Git。
- 不直接克隆教师建设总仓库。
- 不提前领取后续课程。
- 安装、运行、测试和构建命令以本课 `START_HERE.md` 为准。
