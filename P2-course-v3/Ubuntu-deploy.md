# Ubuntu部署与验收说明

平台：Ubuntu；以下命令在服务器SSH终端逐行执行。前提：服务器已经安装Node.js 24、Git和Nginx，并能正常SSH登录。代码及数据库测试已经在本机Ubuntu 24.04和Node.js 24.11.1中通过；当前服务器SSH在认证前关闭连接，因此远程安装与域名验收仍须在SSH恢复后执行。先采用SQLite持久化部署；不把浏览器存储或静态页面当作数据库。

```bash
git clone --branch p2-course-v3 --single-branch https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git ~/p2-course-work
cd ~/p2-course-work/P2-course-v3/complete
npm install
npm run setup:course
npm run build
npm run start:api
```

依次领取工程、进入工程、安装依赖、生成服务端环境配置、构建前端、启动真实接口。不要关闭最后一个前台进程却期待服务继续运行；正式运行配置systemd。先在另一SSH终端执行`curl http://127.0.0.1:3000/health`检查SQLite是否可用。

systemd服务模板（/etc/systemd/system/p2-course-v3.service）：将YOUR_USER替换为部署用户；先通过`whoami`确认用户名。不要覆盖已有课程服务。

```ini
[Unit]
Description=P2 course blog v3
After=network.target
[Service]
User=YOUR_USER
WorkingDirectory=/home/YOUR_USER/p2-course-work/P2-course-v3/complete
ExecStart=/usr/bin/node --env-file=.env server/course-index.js
Restart=on-failure
Environment=NODE_ENV=production
[Install]
WantedBy=multi-user.target
```

通过`command -v node`确认Node绝对路径；若不是/usr/bin/node，修改ExecStart。先Ctrl+C停止手工接口，再运行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now p2-course-v3
sudo systemctl status p2-course-v3 --no-pager
```

依次让systemd读取新配置、启动并开机运行、检查服务状态。这里只新增p2-course-v3服务，不操作已有ffd-p2-api服务。

Nginx配置模板：使用新的子域名；YOUR_DOMAIN、YOUR_USER、前端root均需替换。前端部署路径建议单独复制到/var/www/p2-course-v3，不覆盖原网站。

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;
    client_max_body_size 41m;
    root /var/www/p2-course-v3;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location = /health { proxy_pass http://127.0.0.1:3000; }
    location /media/uploads/ { proxy_pass http://127.0.0.1:3000; }
    location / { try_files $uri $uri/ /index.html; }
}
```

proxy_pass没有结尾斜线，保留/api和/media/uploads路径。`client_max_body_size 41m`允许40MB文件加上表单开销。接口端口默认3000；若被占用，在.env中改PORT，同时修改Nginx上游端口。域名解析完成后再启用HTTPS；登录页面正式开放前应有HTTPS。

```bash
sudo mkdir -p /var/www/p2-course-v3
sudo cp -r dist/. /var/www/p2-course-v3/
sudo nginx -t
sudo systemctl reload nginx
```

在complete目录执行；依次创建独立前端目录、复制构建文件、验证Nginx语法、加载配置。先写好独立站点配置并按服务器现有规则启用，然后运行最后两条。这不是一键脚本；尚未验证的服务器路径不能说成已经部署完成。

最终验收：HTTPS访问列表及详情→注册→登录→评论→刷新→另一用户不能删除→重启p2-course-v3→评论仍在。数据库在complete/var/course-blog.sqlite，备份需使用SQLite一致性备份；不能只备份dist。未来若改PostgreSQL，配置DB_DRIVER=postgres、DATABASE_URL和SESSION_SECRET，重新执行相同功能测试；Netlify当前数据库创建返回403，尚未验证该线路。

部署前后分别执行自动验收：

```bash
LIVE_BASE=https://YOUR_DOMAIN npm run verify:live -- before
sudo systemctl restart p2-course-v3
LIVE_BASE=https://YOUR_DOMAIN npm run verify:live -- after
```

`before`验证注册登录、文字评论、越权拒绝、图片音频视频及范围请求，并留下不提交Git的临时验收记录；实际重启独立服务后，`after`确认原评论仍在并清理测试留言。备份时先停止本项目服务，再运行`npm run db:backup -- --confirmed-stopped`，随后重新启动；备份包括数据库、上传媒体和`.env`。
