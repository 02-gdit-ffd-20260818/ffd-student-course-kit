# 更换服务器：小白实操手册

本手册用于把正在运行的 PersonaLink 从旧服务器 **A** 迁移到新服务器 **B**。总体思路是：先在 B 搭好空环境并做预演，切换当天短暂停止 A 写入，生成最终备份，恢复到 B，最后切换 DNS。

> 只有停止 A 写入后生成的最终备份，才能实现计划迁移的 0 数据丢失。切换完成后不能让 A、B 同时接受新数据。

不熟悉命令参数时先看 [命令速查](command-reference.md)。文中出现 **A** 或 **B** 的地方，表示命令只能在对应服务器执行；每次连接后先运行 `hostname`，防止操作错机器。

## 1. 迁移前一周：准备和检查

1. 购买新 Ubuntu 22.04/24.04 LTS 服务器 B，旧服务器 A 至少保留 7 天。
2. 把域名 DNS TTL 改为 300 秒。TTL 只决定缓存时间，不会自动迁移数据。
3. 确认 A 的小时备份、每日备份和恢复演练都成功，备份密码已保存在密码管理器。
4. 记录 A/B 公网 IP、域名和 DNS 服务商登录方式。

在 **A** 上执行健康巡检：

```bash
hostname  # 显示当前服务器名；把输出记为 A
sudo apt update  # 刷新软件索引
sudo apt install -y rsync  # 安装跨服务器复制工具
curl -fsS https://你的域名/health  # 检查当前线上站点
echo  # 换行，方便阅读 JSON
cd /srv/personalink  # 进入生产目录
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 检查容器状态
sudo systemctl list-timers 'personalink-*' --no-pager  # 检查备份定时任务
sudo ./scripts/backup-all.sh  # 立即生成一份完整备份，确认备份链路正常
```

任何一项失败都先修复，不要带病迁移。

## 2. 在新服务器 B 搭建空环境

先按 [Ubuntu 私有仓库零基础部署](deploy-ubuntu.md) 的第 1–4 节完成系统准备、Docker、Deploy Key 和 clone，然后停下：不要在 B 自行生成 `.env`，也不要先初始化正式 PostgreSQL 数据库。

通用 clone 写法：

```bash
git clone https://github.com/<用户名>/<仓库名>.git  # 从 GitHub 下载代码
cd <仓库名>                                         # 进入项目目录
```

实际仓库示例：

```bash
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git  # 下载指定的真实仓库示例
cd PersonaLink_NoDB_20260828                                         # 进入仓库目录
```

迁移 Docker 版时，B 必须克隆包含 `compose.yaml`、`docker/` 和 `scripts/` 的 Docker 仓库，并放在 `/srv/personalink`。

在 **B** 上执行：

```bash
hostname  # 显示当前服务器名；把输出记为 B
sudo apt update  # 刷新软件索引
sudo apt install -y rsync  # 安装接收备份所需的复制工具
cd /srv/personalink  # 进入项目目录
sudo git status --short  # 确认刚 clone 的仓库没有本地修改
sudo docker compose version  # 确认 Compose 可用
```

## 3. 从 A 复制生产配置到 B

GitHub 不保存生产 `.env`。为了保持数据库名、用户、密码和 JWT 不变，必须通过 SSH 从 A 复制到 B。

先在 **B** 创建目录：

```bash
sudo mkdir -p /etc/personalink  # 创建备份配置目录
sudo chmod 700 /etc/personalink  # 只有 root 可以访问目录
cd /srv/personalink  # 进入项目目录
if [[ -f .env ]]; then  # 如果 B 曾经初始化过临时环境，先清理它
  sudo docker compose -f compose.yaml -f compose.prod.yaml down --volumes  # 仅删除 B 上的空/预演库，绝不能在 A 执行
fi
```

然后在 **A** 上执行：

```bash
read -rp "请输入新服务器 B 的公网 IP: " PERSONALINK_NEW_IP  # 读取 B 的 IP，不要填域名
sudo scp /srv/personalink/.env "root@${PERSONALINK_NEW_IP}:/srv/personalink/.env"  # 加密复制生产配置
sudo scp /etc/personalink/backup.env "root@${PERSONALINK_NEW_IP}:/etc/personalink/backup.env"  # 复制备份加密配置
```

如果使用了 rclone 异地备份，也在 **A** 上复制 rclone 配置：

```bash
read -rp "请输入新服务器 B 的公网 IP: " PERSONALINK_NEW_IP  # 读取 B 的 IP
sudo ssh "root@${PERSONALINK_NEW_IP}" 'mkdir -p /root/.config/rclone && chmod 700 /root/.config/rclone'  # 在 B 创建 rclone 目录
sudo scp /root/.config/rclone/rclone.conf "root@${PERSONALINK_NEW_IP}:/root/.config/rclone/rclone.conf"  # 复制 rclone 授权配置
sudo ssh "root@${PERSONALINK_NEW_IP}" 'chmod 600 /root/.config/rclone/rclone.conf && apt-get update && apt-get install -y rclone'  # 在 B 安装 rclone 并收紧权限
```

没有使用 rclone 时跳过这一段。rclone 配置可能包含网盘授权，只通过 SSH 传输，不要发到聊天工具。

回到 **B** 设置权限，只启动 PostgreSQL，不要先启动 backend：

```bash
sudo chmod 600 /srv/personalink/.env /etc/personalink/backup.env  # 限制敏感配置只有 root 可读写
cd /srv/personalink  # 进入项目目录
sudo docker compose -f compose.yaml -f compose.prod.yaml config --quiet  # 校验配置
sudo docker compose -f compose.yaml -f compose.prod.yaml up -d postgres  # 只启动数据库服务，等待恢复数据
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 检查 postgres 状态
```

## 4. 做一次迁移预演

预演期间 A 继续对外服务，所以数据不是最终最新版本；预演的目的是提前发现权限、脚本和兼容问题。

在 **A** 生成完整备份并传给 B：

```bash
cd /srv/personalink  # 进入 A 的生产目录
sudo ./scripts/backup-all.sh  # 生成完整备份
PERSONALINK_LATEST_BACKUP="$(find /srv/personalink/backups/daily -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -n | tail -n 1 | cut -d' ' -f2-)"  # 找到最新备份目录
printf '将传输备份：%s\n' "$PERSONALINK_LATEST_BACKUP"  # 显示待传输路径
read -rp "请输入新服务器 B 的公网 IP: " PERSONALINK_NEW_IP  # 读取 B 的 IP
sudo rsync -aH --info=progress2 "$PERSONALINK_LATEST_BACKUP/" "root@${PERSONALINK_NEW_IP}:/srv/personalink/backups/daily/preflight/"  # 将预演备份复制到 B
```

在 **B** 恢复预演数据：

```bash
cd /srv/personalink  # 进入 B 的生产目录
sudo ./scripts/restore.sh /srv/personalink/backups/daily/preflight --yes  # 恢复预演数据；--yes 明确允许覆盖 B 的临时库
sudo ./scripts/health-check.sh  # 检查恢复后的服务
```

在 **B** 配置临时 HTTP 反向代理，先不申请正式证书：

```bash
cd /srv/personalink  # 进入项目目录
sudo cp infrastructure/nginx/personalink.conf.example /etc/nginx/sites-available/personalink  # 复制 Nginx 示例
sudo sed -i 's/app\.example\.com/你的域名/g' /etc/nginx/sites-available/personalink  # 把示例域名换成你的域名
sudo ln -sfn /etc/nginx/sites-available/personalink /etc/nginx/sites-enabled/personalink  # 启用站点配置
sudo rm -f /etc/nginx/sites-enabled/default  # 禁用默认欢迎页，不删除其他具名站点
sudo nginx -t  # 检查语法
sudo systemctl reload nginx  # 重新加载配置
```

暂时不改 DNS，从你的电脑测试 B 的 HTTP 路由：

```bash
read -rp "请输入新服务器 B 的公网 IP: " PERSONALINK_NEW_IP  # 读取 B 的 IP
curl -fsS -H 'Host: 你的域名' "http://${PERSONALINK_NEW_IP}/health"  # 通过 Host 头把请求送到目标站点
echo  # 换行
```

返回 `status: ok` 后，还要验证管理员登录、照片墙、用户搜索、班级、新建和修改功能。预演产生的测试数据会在最终恢复时被覆盖。

## 5. 切换当天：准备窗口

选择使用人数最少的时段，预留至少 30 分钟，并提前打开：

- A 的 SSH 窗口；
- B 的 SSH 窗口；
- DNS 控制台；
- 一个手机无痕浏览器。

两个窗口都执行 `hostname`，在纸上明确标注 A/B。

## 6. 停止 A 写入并生成最终备份

以下命令只在 **A** 执行。停止 frontend/backend 后，用户无法继续新增或修改数据，但 PostgreSQL 仍运行，可以生成最终 dump：

```bash
hostname  # 再次确认这是 A
cd /srv/personalink  # 进入 A 的生产目录
sudo docker compose -f compose.yaml -f compose.prod.yaml stop frontend backend  # 停止会写数据的前后端，不删除数据库
sudo ./scripts/backup-all.sh  # 生成最终完整备份
PERSONALINK_FINAL_BACKUP="$(find /srv/personalink/backups/daily -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -n | tail -n 1 | cut -d' ' -f2-)"  # 找到最新最终备份
printf '最终备份是：%s\n' "$PERSONALINK_FINAL_BACKUP"  # 记录最终备份目录
```

从这一刻起，不要在 A 重新启动 frontend/backend，除非决定取消迁移。继续在 **A** 上传最终备份：

```bash
read -rp "请输入新服务器 B 的公网 IP: " PERSONALINK_NEW_IP  # 读取 B 的 IP
sudo rsync -aH --delete --info=progress2 "$PERSONALINK_FINAL_BACKUP/" "root@${PERSONALINK_NEW_IP}:/srv/personalink/backups/daily/final/"  # 将最终备份完整同步到 B
```

## 7. 在 B 恢复最终数据

以下命令只在 **B** 执行。`restore.sh` 会校验 SHA-256，替换 B 上的数据库、uploads 和 logs，再启动容器并检查健康状态：

```bash
hostname  # 确认这是 B
cd /srv/personalink  # 进入 B 的生产目录
sudo ./scripts/restore.sh /srv/personalink/backups/daily/final --yes  # 恢复最终数据；会替换当前 B 数据
sudo ./scripts/health-check.sh  # 检查前端、后端和 PostgreSQL
sudo docker compose -f compose.yaml -f compose.prod.yaml ps  # 查看所有服务状态
```

再检查数据量：

```bash
cd /srv/personalink  # 进入项目目录
sudo docker compose -f compose.yaml -f compose.prod.yaml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT count(*) AS users FROM users; SELECT count(*) AS classes FROM classes;"'  # 在容器内查询用户和班级数量
```

将数量与迁移前 A 的业务界面记录对比。

## 8. 切换 DNS 和 HTTPS

在 DNS 控制台把域名的 A 记录从 A 的旧 IP 改为 B 的新 IP。如果有 AAAA 记录但 B 没有可用 IPv6，删除 AAAA，避免部分用户访问旧地址。

等待 DNS 查询显示 B 的 IP：

```bash
getent ahostsv4 你的域名  # 查询域名当前解析到的 IPv4 地址
```

然后在 **B** 申请证书：

```bash
sudo apt install -y certbot python3-certbot-nginx  # 安装 Certbot 和 Nginx 插件
sudo certbot --nginx -d 你的域名  # 申请证书并写入 Nginx 配置
sudo certbot certificates  # 查看证书状态，应显示 VALID
sudo nginx -t  # 检查 Nginx 语法
sudo systemctl reload nginx  # 重新加载 HTTPS 配置
sudo certbot renew --dry-run  # 模拟续期，确认以后能自动续期
```

## 9. 最终验收

```bash
curl -fsS https://你的域名/health  # 验证公网 HTTPS 健康接口
echo  # 换行
curl -I https://你的域名  # 查看 HTTP 响应头和状态码
```

再用手机移动网络和无痕窗口确认：页面是 PersonaLink、管理员可登录、数据与 A 一致、可以新建测试数据、B 的日志出现请求、备份 timer 已启用。

```bash
cd /srv/personalink  # 进入 B 的生产目录
sudo ./scripts/backup-all.sh  # 验收后再手工做一份完整备份
sudo ./scripts/install-systemd-timers.sh  # 确认定时任务安装并启用
sudo systemctl start personalink-backup-daily.service  # 立即触发一次每日备份
sudo systemctl status personalink-backup-daily.service --no-pager -l  # 查看结果，应为 status=0/SUCCESS
sudo systemctl list-timers 'personalink-*' --no-pager  # 查看定时任务计划
```

## 10. 回退方案

至少保留 A 7 天，不要删除 A 的 volume、uploads、`.env` 和备份。

如果 B 尚未开放新写入就发现严重问题：先把 DNS 指回 A，再在 A 执行：

```bash
cd /srv/personalink  # 进入 A 的生产目录
sudo docker compose -f compose.yaml -f compose.prod.yaml up -d  # 重新启动 A 的服务
sudo ./scripts/health-check.sh  # 确认 A 恢复正常
```

如果 B 已产生新业务数据，不能直接回切 DNS，否则会丢失 B 的新数据。应先停止 B 写入、备份 B、把最新备份恢复到 A，再回切；不确定时保持单台写入，不要让 A/B 同时写数据。

## 11. 为什么不直接复制 PostgreSQL volume

数据库迁移使用项目生成的 `pg_dump -Fc` 和 `pg_restore`，而不是直接拷贝 `/var/lib/postgresql/data`。逻辑 dump 对机器、文件系统和数据库运行状态的依赖更小，跨服务器恢复更稳妥。

## 12. 七天后下线 A

确认 B 连续运行、自动备份和恢复演练都正常后，再处理 A：

1. 在 A 做最后一份异地备份。
2. 确认 DNS 中已经没有记录指向 A。
3. 在 GitHub 仓库 **Settings → Deploy keys** 删除 A 的旧 Deploy Key，保留 B 的 key。
4. 从云厂商控制台释放 A 前，再确认异地备份可读且备份密码已保存。

释放服务器是不可恢复的外部操作，只在以上四项全部确认后手工执行。

官方参考：[PostgreSQL SQL Dump](https://www.postgresql.org/docs/17/backup-dump.html) 和 [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html)。
