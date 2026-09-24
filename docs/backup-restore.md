# 备份、异地副本与恢复：小白操作手册

备份的目标不是“磁盘里有几个文件”，而是发生故障后能把数据库、上传文件和日志恢复出来。本项目提供小时数据库备份、每日完整备份和加密异地副本。

如果不熟悉命令参数，先看 [命令速查](command-reference.md)。特别注意：`backup-all.sh` 会创建并加密备份；`restore.sh` 会替换当前数据库，属于高风险操作。

## 备份内容和保留时间

| 类型 | 执行方式 | 内容 | 默认保留 |
| --- | --- | --- | --- |
| PostgreSQL custom dump | 每小时 `backup-db.sh` | 数据库逻辑备份 | 7 天 |
| 每日完整备份 | 每日 `backup-all.sh` | 数据库、uploads、logs、SHA-256 校验值 | 30 天 |
| 加密月度副本 | 每月 1 日由完整备份生成 | 加密的每日完整归档 | 12 个月 |

`pg_dump -Fc` 生成可跨机器恢复的逻辑备份；上传文件和日志单独压缩。`SHA256SUMS` 用来检查文件是否损坏或传输不完整。

## 1. 配置备份密码

在生产服务器执行。备份密码必须和项目 `.env` 中的数据库/JWT/管理员密码不同，并在服务器之外的密码管理器再保存一份。

```bash
cd /srv/personalink  # 进入项目目录
sudo mkdir -p /etc/personalink  # 创建系统级备份配置目录
sudo cp .backup.env.example /etc/personalink/backup.env  # 复制备份配置模板
PERSONALINK_BACKUP_PASSWORD="$(openssl rand -hex 32)"  # 生成随机加密密码
sudo sed -i "s|replace-with-a-different-long-random-password|${PERSONALINK_BACKUP_PASSWORD}|" /etc/personalink/backup.env  # 写入加密密码
printf '\n备份解密密码（请在服务器之外保存）：%s\n\n' "$PERSONALINK_BACKUP_PASSWORD"  # 显示一次密码，立即保存
sudo chmod 600 /etc/personalink/backup.env  # 只允许 root 读写备份配置
```

`common.sh` 会读取 `/etc/personalink/backup.env`，并把密码传给 OpenSSL 和 rclone 子进程。不要把真实 `backup.env` 加入 Git。

## 2. 配置异地存储（可选但推荐）

项目通过 rclone 把 `.enc` 加密文件上传到异地存储。先在服务器安装并配置 rclone，再编辑配置：

```env
OFFSITE_REMOTE=remote:PersonaLink
```

其中 `remote` 是你在 `rclone config` 中创建的 remote 名称，`PersonaLink` 是远端目录。`upload-offsite.sh` 只接受 `.enc` 文件，因此即使上传链路被看到，也不会直接暴露明文业务数据。

百度网盘、OSS、COS、OneDrive 和 S3 的 rclone 配置会随客户端和服务商变化；本项目不保存任何网盘凭据。更换存储时只修改 rclone remote，不修改备份核心脚本。

## 3. 手动测试两种备份

```bash
cd /srv/personalink  # 进入生产目录
sudo ./scripts/backup-db.sh  # 立即生成 PostgreSQL 小时备份；成功时会输出 dump 路径
sudo ./scripts/backup-all.sh  # 生成完整备份、SHA-256、加密归档并尝试上传异地
```

备份输出目录通常是：

```text
backups/hourly/       # 小时数据库 dump
backups/daily/<时间>/  # database.dump、uploads.tar.gz、logs.tar.gz、SHA256SUMS
backups/daily/*.enc   # 加密完整归档
backups/monthly/      # 每月保留的加密副本
```

`backup-all.sh` 如果发现加密密码为空会失败，即使本地临时文件已经生成，也不能把它当作完整备份成功。

## 4. 安装自动备份定时任务

```bash
cd /srv/personalink  # 确认脚本在固定生产目录运行
sudo ./scripts/install-systemd-timers.sh  # 安装 service/timer，并启用小时和每日任务
sudo systemctl list-timers 'personalink-*' --no-pager  # 查看下次执行时间和上次执行时间
sudo systemctl start personalink-backup-daily.service  # 不等到定时点，立即手动触发一次完整备份
sudo systemctl status personalink-backup-daily.service --no-pager -l  # 查看最近一次执行结果，期望 status=0/SUCCESS
```

timer 显示 `active` 只代表“计划任务已启用”，不代表备份内容可恢复；必须查看 service 日志并定期做恢复演练。

## 5. 每月恢复演练

恢复会替换当前 PostgreSQL 数据库，并将当前 `uploads`、`logs` 移到带时间戳的安全目录。正式操作前先确认备份目录和数据库当前状态。

```bash
cd /srv/personalink  # 进入生产目录
sudo ./scripts/backup-all.sh  # 恢复前先保存当前最新数据
sudo find backups/daily -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -n | tail -n 5  # 列出最近 5 个完整备份目录
sudo ./scripts/restore.sh /srv/personalink/backups/daily/20260822_030000 --yes  # 用指定目录恢复；--yes 才允许覆盖当前库
sudo ./scripts/health-check.sh  # 恢复后检查前端、后端和数据库链路
```

把示例中的 `20260822_030000` 换成实际存在且经过确认的备份目录。恢复脚本会先校验 `SHA256SUMS`，再执行 `pg_restore`；旧文件会移动到 `uploads.before-restore.<时间>` 和 `logs.before-restore.<时间>`，不会立即删除。

## 6. 从加密归档恢复

如果只有异地下载的 `.enc` 文件，先把它安全传到服务器，并确认 `/etc/personalink/backup.env` 中的 `BACKUP_ENCRYPTION_PASSWORD` 正确：

```bash
cd /srv/personalink  # 进入项目目录
sudo ./scripts/restore.sh /srv/personalink/backups/daily/personalink_20260822_030000.tar.gz.enc --yes  # 解密、校验并恢复
sudo ./scripts/health-check.sh  # 确认恢复后的服务正常
```

密码错误、归档损坏或缺少 `database.dump`、`uploads.tar.gz`、`logs.tar.gz`、`SHA256SUMS` 时，脚本会停止，不要删除原有数据。

## 7. 常见问题

| 问题 | 原因 | 处理 |
| --- | --- | --- |
| `No environment variable BACKUP_ENCRYPTION_PASSWORD` | 配置文件不存在、路径不对或没有读权限 | 检查 `/etc/personalink/backup.env`，执行 `sudo chmod 600` |
| 本地有备份但异地没有 | rclone remote 未配置或上传失败 | 查看 `backup-all.sh` 输出和 rclone 配置，重新手动运行 |
| `SHA256SUMS` 校验失败 | 文件损坏或传输不完整 | 重新上传/复制同一个完整备份，不要强行跳过校验 |
| 恢复后页面打不开 | 容器尚未 healthy 或 Nginx 未 reload | 查看 Compose 状态和 backend 日志，再执行 health check |
| 忘记备份解密密码 | 密码没有异地保存 | 无法解密原有加密归档；这也是为什么必须使用密码管理器 |

官方参考：[PostgreSQL 17 SQL Dump](https://www.postgresql.org/docs/17/backup-dump.html) 和 [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html)。
