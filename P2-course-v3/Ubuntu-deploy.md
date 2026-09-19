# Ubuntu部署与验收说明（已验证）

验证时间：2026-09-19。服务器：Ubuntu 24.04.4、Node.js 24.20.0、Nginx 1.24.0。

## 已上线地址

- 完整网页：<http://47.120.73.69/ffd-p2-v31/>
- 媒体文章：<http://47.120.73.69/ffd-p2-v31/articles/html5-media>
- 注册：<http://47.120.73.69/ffd-p2-v31/register>
- 登录：<http://47.120.73.69/ffd-p2-v31/login>
- 健康检查：<http://47.120.73.69/ffd-p2-v31-api/health>
- 文章接口：<http://47.120.73.69/ffd-p2-v31-api/api/articles>

当前地址使用HTTP，适合课堂演示和服务器部署学习。正式长期开放登录功能前应绑定已备案域名并启用HTTPS，学生不要在此演示站使用其他网站的相同密码。

## 与旧版隔离

| 项目 | 原P2生产服务 | P2 v3.1课堂服务 |
|---|---|---|
| systemd | `ffd-p2-api` | `ffd-p2-v31` |
| 内部端口 | 3010 | 3040 |
| 程序 | `/srv/ffd-p2/app` | `/srv/ffd-p2-v31/current` |
| 数据 | 原MySQL生产库 | `/srv/ffd-p2-v31/data/course-blog.sqlite` |
| 上传媒体 | 原服务配置 | `/srv/ffd-p2-v31/media` |
| 备份 | `/srv/ffd-p2/backups` | `/srv/ffd-p2-v31/backups` |

部署没有覆盖或停止旧P2。验收结束时，`ffd-p2-api`、`ffd-p2-v31`和`nginx`均为`active`；旧接口仍有3篇文章，新接口有7篇文章。

## 服务配置要点

生产环境变量位于`/etc/ffd-p2-v31.env`，权限为root与服务组可读，不进入Git。systemd以`ffd-p2`低权限用户运行Node 24，启用`NoNewPrivileges`、只读系统目录，并仅允许写入数据、媒体和备份目录。

Nginx完成四类路由：

```text
/ffd-p2-v31/       -> 静态Vue页面
/ffd-p2-v31-api/   -> 127.0.0.1:3040
/media/            -> 课程自带媒体
/media/uploads/    -> Node上传媒体
```

上传限制为41MB，应用层限制为40MB；WAV显式返回`audio/wav`，MP4支持Range请求。

## 日常检查命令

以下命令在Ubuntu服务器运行：

```bash
systemctl is-active ffd-p2-v31 ffd-p2-api nginx
curl -fsS http://127.0.0.1:3040/health
curl -fsS http://127.0.0.1/ffd-p2-v31-api/health
journalctl -u ffd-p2-v31 --since '-10 min' --no-pager
```

公开检查可在Windows CMD或PowerShell运行：

```bat
curl.exe http://47.120.73.69/ffd-p2-v31-api/health
curl.exe http://47.120.73.69/ffd-p2-v31-api/api/articles
```

## 一致性备份

先停止新服务，加载受保护的服务器环境变量，再执行备份：

```bash
sudo systemctl stop ffd-p2-v31
set -a
. /etc/ffd-p2-v31.env
set +a
cd /srv/ffd-p2-v31/current
PATH=/opt/node24/bin:$PATH npm run db:backup -- --confirmed-stopped
sudo systemctl start ffd-p2-v31
```

生产环境指定：

```text
BACKUP_PATH=/srv/ffd-p2-v31/backups
CONFIG_ENV_PATH=/etc/ffd-p2-v31.env
```

因此备份包同时包含数据库、WAL、上传媒体和受保护环境配置。最终验证备份：`/srv/ffd-p2-v31/backups/course-2026-09-19T09-45-29-603Z`；数据库逐字节SHA-256校验通过，独立只读检查得到7篇文章、1个教师账号、0条测试评论。

## 已完成验收

- 注册、登录、密码摘要和Bearer令牌：通过。
- 匿名评论拒绝、登录评论、其他用户不能删除、本人删除：通过。
- 图片、WAV音频、MP4视频和MP4字节范围请求：通过。
- 管理员真实上传PNG，经Nginx读取后与原文件逐字节一致，测试文件已清理。
- 服务PID真实变化后，重启前评论仍能读取并按权限删除：通过。
- 测试账号与评论已清理，生产库只保留教师账号和7篇课程文章。
- 旧MySQL在部署前完成一致性备份：`/srv/ffd-p2/backups/pre-p2-v31-20260919-173403.sql`。

## SSH临时恢复通道

服务器22端口对部分来源仍在SSH握手前关闭。为完成部署，新增仅限教师当前出口IP的2222临时SSH服务`ssh-recovery.service`。在22端口彻底恢复并从教师电脑验证前，不要删除该通道；恢复后应关闭安全组2222规则并执行：

```bash
sudo systemctl disable --now ssh-recovery.service
sudo rm /etc/systemd/system/ssh-recovery.service
sudo systemctl daemon-reload
```
