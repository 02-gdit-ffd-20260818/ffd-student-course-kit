# Windows 终端选择与命令对照

学生熟悉 CMD 时，请选各课“CMD 实操”。熟悉 PowerShell 的同学可以继续使用原“全流程实操”。两套手册操作同一个 p1-portfolio，不需要重复领取、重复复制或再建一个仓库。

## 怎样选择终端

CMD：Windows 开始菜单搜索 cmd，打开“命令提示符”。VS Code 中点击“终端 → 新建终端”，从右上方“+”旁的小箭头选择 Command Prompt。提示符通常是 C:\Users\…>。

PowerShell：VS Code 的同一菜单选择 PowerShell，提示符通常是 PS C:\Users\…>。不要根据窗口背景颜色区分，要看名称和提示符。

下方两框做的是同一件事，只执行自己终端对应的那一框。工程文件夹必须已按领取手册创建。

## CMD 示例

运行平台：Windows CMD。运行位置：任意目录，代码会切换到个人工程。运行方法：粘贴本框并按回车。

```bat
rem 进入个人工程，d 参数允许从其他盘符切换过来。
cd /d "%USERPROFILE%\web-work\p1-portfolio"
rem 查看当前完整路径。
cd
rem 按工程锁文件安装依赖。
npm.cmd ci
```

成功标志：路径以 p1-portfolio 结尾，依赖安装成功。

## PowerShell 示例

运行平台：Windows PowerShell。运行位置：任意目录，代码会切换到个人工程。运行方法：粘贴本框并按回车。

```powershell
# 进入个人工程，自动使用本人的 Windows 用户目录。
Set-Location (Join-Path $env:USERPROFILE 'web-work/p1-portfolio')
# 查看当前完整路径。
Get-Location
# 按工程锁文件安装依赖。
npm.cmd ci
```

成功标志：路径以 p1-portfolio 结尾，依赖安装成功。

## 最容易混淆的地方

CMD 的注释是 rem，PowerShell 的注释是 #。CMD 的用户目录是 %USERPROFILE%，PowerShell 的用户目录是 $env:USERPROFILE。CMD 用 set 和 set /p，PowerShell 用变量赋值与 Read-Host。

Git 和 npm 的常用命令基本相同，但涉及变量、切换目录、复制文件和条件检查时，必须使用当前终端对应的版本。完整命令请从同一份手册复制，不自行逐词混搭。

CMD 中本课程统一使用 npm.cmd；在交互式 CMD 中可以直接运行。若以后自行写批处理，npm.cmd 等批处理调用需使用 call，for 循环的百分号变量也要相应调整。当前课堂按手册直接在终端操作即可。

## 从 Windows 进入 Ubuntu

在 CMD 或 PowerShell 中运行 ssh 并成功登录后，输入位置虽然还是 VS Code 下方，但后面的命令已经运行在 Ubuntu 服务器。Ubuntu 使用 Bash 与 # 注释。执行 exit 返回 Windows 后，才继续使用原来 CMD 或 PowerShell 的语法。第六课提供两种 Windows 本机入口对应的 Ubuntu 附录。

操作依据：[Microsoft CMD](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cmd)、[xcopy](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/xcopy)、[for](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/for)、[set](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/set_1)。
