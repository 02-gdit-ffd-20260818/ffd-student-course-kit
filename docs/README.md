# 运维文档导航：按顺序照着做

如果你是第一次部署，不要一次打开所有文件。按下面顺序阅读即可：

1. [命令速查：从不会到会](command-reference.md)：解释 `sudo`、`cd`、`git clone`、`npm ci`、Docker 参数和 Shell 写法。
2. [Ubuntu 私有仓库零基础部署](deploy-ubuntu.md)：从一台空 Ubuntu 服务器部署第一套环境。
3. [CI/CD 与日常发布](cicd.md)：开发、提交、等待 CI、发布到生产。
4. [备份、异地副本与恢复](backup-restore.md)：配置加密备份并做恢复演练。
5. [更换服务器：小白实操手册](server-migration.md)：把旧服务器 A 迁移到新服务器 B。
6. [架构与持续开发](architecture.md)：需要修改代码或数据库结构时查阅。

## 阅读规则

- 代码块中的 `#` 后面是命令备注；复制命令时保留或删除备注都可以。
- 每个步骤开头会写“在本地电脑 / A / B / 生产服务器执行”，不要在另一台机器执行。
- `/srv/personalink` 是生产目录；`compose.yaml` 和 `compose.prod.yaml` 必须一起使用。
- 本项目从创建起即使用 PostgreSQL 17，不提供 SQLite 数据导入或兼容流程。
- `.env`、备份密码、数据库 dump、上传文件和真实数据不进入 Git，也不要发到聊天工具。

## 仓库下载示例

通用 GitHub 操作是：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 把远程仓库复制到本地
cd <仓库名>                                         # 进入项目目录
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`git` 管理版本；`status` 查看改动；`diff` 查看逐行差异；`add` 选择待提交文件；`commit -m` 创建本地版本并写说明；`push` 发到远端；`clone` 下载仓库，`--branch` 选择分支，`--single-branch` 只取该分支历史；`remote` 管理远端别名，`fetch` 只取回记录。命令中的 `.` 表示当前目录，`--` 后面是文件路径。推送前用 `git remote -v` 核实 origin 是自己的仓库。

`cd` / `Set-Location` 切换终端当前目录；含空格的路径用引号包起来。CMD 的 `/d` 同时切换盘符；PowerShell 用 `Set-Location "路径"`，不加 `/d`。
<!-- COMMAND_HELP:END -->


实际仓库示例：

仓库页面：[PersonaLink_NoDB_20260828](https://github.com/Abner199/PersonaLink_NoDB_20260828)

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载指定的实际仓库
cd PersonaLink_NoDB_20260828                                         # 进入该仓库目录
```

这两个命令用于学习 clone 流程。部署 Docker 版时，还要确认仓库内存在 `compose.yaml`、`docker/` 和 `scripts/`；详见部署文档中的说明。

## 一句话理解整个上线过程

```text
准备 Ubuntu → 安装 Docker → 下载代码 → 配置 .env → 启动 Compose → 配 Nginx/HTTPS → 配备份
```
