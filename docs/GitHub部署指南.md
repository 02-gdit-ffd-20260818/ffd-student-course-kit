# PersonaLink 从 GitHub 拉取与部署指南

> 本文中的 **`ci` = clean install**、**`dev` = development**；两者的命名背景、脚本来源与排错方法见 npm 命令词典与命名故事。

这是一份面向第一次接触 Vue、Node.js 和 Linux 服务器的操作指南。你可以先在自己的电脑上运行项目，确认项目正常后，再部署到 Linux 服务器。

## 先认识几个词

- **仓库（repository）**：GitHub 上保存项目代码的地方。
- **克隆（clone）**：把 GitHub 仓库完整下载到本地电脑。
- **前端**：`frontend` 目录，负责页面显示，开发服务器默认使用 `3000` 端口。
- **后端**：`backend` 目录，负责 API 和教学数据，默认使用 `3003` 端口。
- **锁文件**：`package-lock.json`，记录已经验证过的依赖版本。本项目的前端和后端各有一个锁文件。

> 说明：下面代码块中的 `#` 开头文字是注释，用来解释命令，不需要单独执行。Windows PowerShell 也可以执行大多数 Git 和 npm 命令；Linux 服务器使用 Bash。

## 1. 准备运行环境

请先安装以下软件：

- Node.js 20 或更高版本（npm 会随 Node.js 一起安装）
- Git
- Linux 部署还需要 Nginx；使用 PM2 管理后端进程时还需要 PM2

安装后打开终端，逐条执行下面的检查命令：

```bash
# 查看 Node.js 版本；如果提示“找不到命令”，说明 Node.js 未安装或未加入 PATH
node --version

# 查看 npm 版本；npm 是 Node.js 的包管理工具，负责安装项目依赖
npm --version

# 查看 Git 版本；Git 用来从 GitHub 下载和更新代码
git --version
```

如果版本低于要求，请先升级软件，再继续下面的步骤。

## 2. 从 GitHub 拉取代码

### 2.1 通用写法（模板）

把尖括号里的内容替换成真实的 GitHub 用户名和仓库名：

```bash
# 将远程仓库下载到当前目录；末尾的 .git 表示这是一个 Git 仓库地址
git clone https://github.com/<用户名>/<仓库名>.git

# 进入刚刚下载的项目目录；后续 npm 命令要在正确目录中执行
cd <仓库名>
```

例如，模板中的 `<仓库名>` 如果是 `my-project`，第二行就写成 `cd my-project`。

### 2.2 PersonaLink 实际仓库（可直接复制）

本项目实际仓库地址为：<https://github.com/Abner199/PersonaLink_NoDB_20260828>

```bash
# 下载 PersonaLink_NoDB_20260828 仓库
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git

# 进入下载后的项目目录
cd PersonaLink_NoDB_20260828
```

如果出现 `destination path already exists`，说明当前目录已经有同名文件夹。可以先执行 `cd PersonaLink_NoDB_20260828` 进入已有目录，不要重复克隆。

私有仓库可以改用 SSH，但前提是你已经在 GitHub 账号中配置了 SSH Key：

```bash
# 使用 SSH 地址克隆私有仓库；没有配置 SSH Key 时会提示权限错误
git clone git@github.com:<用户名>/<仓库名>.git
```

## 3. 本地开发：先启动后端，再启动前端

本项目根目录没有统一的 `package.json`，因此前端和后端要分别安装依赖、分别启动。请打开两个终端窗口，并保持两个进程都在运行。

### 3.1 终端一：启动后端

在项目根目录执行：

```bash
# 进入后端目录；这里必须能看到 backend/package.json
cd backend

# 按 backend/package-lock.json 安装确定版本的依赖
# npm ci 适合部署和首次安装：速度稳定，不会自行修改 package-lock.json
npm ci

# 执行 package.json 中的 start 脚本，本质上是运行 node server.js
npm start
```

看到类似 `Server is running on http://localhost:3003` 的提示，说明后端已经启动。不要关闭这个终端。

### 3.2 终端二：启动前端

打开第二个终端，重新回到项目根目录，再执行：

```bash
# 如果新终端默认不在项目目录，请先进入项目目录；路径按你的实际位置修改
cd PersonaLink_NoDB_20260828

# 进入前端目录；这里必须能看到 frontend/package.json
cd frontend

# 按 frontend/package-lock.json 安装前端依赖
npm ci

# 启动 Vite 开发服务器；项目配置的端口是 3000
npm run dev
```

浏览器打开 <http://localhost:3000>。登录页面可以使用教学账号：

```text
邮箱：admin@system.com
密码：admin123
```

### 3.3 `npm ci`、`npm install` 和 `npm run` 的区别

这是新手最容易混淆的部分：

| 命令 | 作用 | 什么时候使用 |
|---|---|---|
| `npm ci` | 按锁文件一次性、可重复地安装依赖；通常会先清理已有 `node_modules` | 克隆项目后的首次安装、部署服务器、CI 流程 |
| `npm install` | 安装依赖，并可能根据 `package.json` 更新 `package-lock.json` | 新增/升级依赖，或项目没有锁文件时 |
| `npm start` | 执行 `package.json` 中的 `start` 脚本 | 启动后端 |
| `npm run dev` | 执行 `dev` 脚本 | 启动前端开发服务器 |
| `npm run build` | 执行构建脚本，生成可部署的静态文件 | 上线前构建前端 |
| `npm run preview` | 本地预览构建后的静态文件 | 检查 `dist` 构建结果，不代替生产服务器 |

#### 为什么本教程优先使用 `npm ci`，而不是 `npm install`？

本项目的 `frontend` 和 `backend` 都已经提交了 `package-lock.json`。`package.json` 主要描述项目允许使用哪些依赖及版本范围，`package-lock.json` 则记录实际安装并经过测试的精确版本。

从 GitHub 克隆项目后执行：

```bash
npm ci
```

有以下好处：

1. 严格按照 `package-lock.json` 安装，另一台 Windows、Linux 服务器和开发电脑更容易得到一致的依赖版本。
2. 安装前会清理已有的 `node_modules`，可以减少旧依赖残留造成的“这台电脑能运行，另一台不能运行”。
3. 不会主动改写 `package.json` 或 `package-lock.json`，部署过程不会产生意外的 Git 文件变更。
4. 锁文件与 `package.json` 不一致时会直接报错，能尽早暴露依赖配置问题，而不是悄悄安装另一套版本。

以下情况应该使用 `npm install`：

```bash
# 添加一个新依赖，同时更新 package.json 和 package-lock.json
npm install axios

# 根据 package.json 安装依赖，并创建或更新 package-lock.json
npm install
```

- 仓库中没有 `package-lock.json`。
- 开发者需要新增、删除或升级依赖。
- `npm ci` 报告 `package.json` 与锁文件不一致，并且你确认需要重新生成或更新锁文件。

如果只是克隆仓库后运行或部署项目，不要因为看到 `npm ci` 会清理 `node_modules` 就担心：它删除的是可以重新生成的依赖目录，不会删除项目源码、配置文件或 `db.json` 数据。

> 一句话记忆：拉取并运行现成项目使用 `npm ci`；开发时新增或升级依赖使用 `npm install`。

#### 照片墙有姓名和卡片，但头像是空白

旧版本的示例头像来自 `picsum.photos`。外链图片是否显示取决于当前电脑能否访问第三方网站，因此曾经可用并不代表换电脑或部署到服务器后仍然可用。网络超时、DNS、TLS 证书、外站限流和防盗链都可能让头像请求失败。

当前版本已改为项目内置头像：

- 头像文件位于 `frontend/public/images/avatars`，随 Git 仓库一起下载。
- 未上传照片的用户会稳定显示一张本地图片；内置图库包含自然风景和写实风格的虚构人物，不显示姓名占位图。
- 用户自行上传的真实头像优先于内置头像。
- 旧 `db.json` 中的 `picsum.photos` 地址会被识别为失效的示例地址，不再作为有效头像使用。

如果拉取新版后仍看到旧空白卡片，先停止前后端服务，重新运行 `npm ci` 和 `npm run dev`，然后在浏览器按 `Ctrl+F5` 强制刷新。

本 NoDB 版会在浏览器中把照片裁切并压缩为 512×512 的 JPEG，然后转换为 Base64 并保存在 `backend/db.json`，不是自动上传到外链。教学演示可以使用这种方式；正式生产环境应改用对象存储，并让数据库只保存图片 URL。

当前仓库默认提供三个演示班级：测试1班 30 人、测试2班 10 人、测试3班 2 人，共 42 名学生。管理员不计入学生人数。需要重新生成这套分班数据时，在项目根目录运行 `node scripts/setup-demo-classes.mjs`；该命令会保留管理员和现有普通用户，补足演示学生并重新分班。

## 4. Linux 服务器部署

以下命令假定项目父目录为 `/var/www/personalink`，克隆后实际仓库目录为 `/var/www/personalink/PersonaLink_NoDB_20260828`。如果你的服务器使用其他目录，请把路径替换成实际路径。

### 4.1 安装依赖、构建前端

```bash
# 将实际仓库下载到当前目录；如果已经克隆过，就跳过这一行
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git

# 进入项目目录；后续相对路径都从这里计算
cd PersonaLink_NoDB_20260828

# 进入后端目录
cd backend

# 按锁文件安装后端生产依赖
npm ci

# 返回项目根目录；.. 表示上一级目录
cd ..

# 进入前端目录
cd frontend

# 按锁文件安装前端依赖
npm ci

# 构建前端；输出目录为 frontend/dist，Nginx 将从这里提供网页文件
npm run build
```

`npm run build` 成功后，应该能看到 `frontend/dist/index.html`。如果构建失败，先查看终端中第一条红色错误，通常是 Node.js 版本、依赖安装或代码语法问题。

### 4.2 使用 PM2 保持后端运行

PM2 可以在终端退出后继续运行 Node.js 后端，并提供查看日志、重启服务等功能。

```bash
# 全局安装 PM2；-g 表示安装到系统级 npm 目录，通常需要管理员权限
npm install -g pm2

# 进入后端目录
cd /var/www/personalink/PersonaLink_NoDB_20260828/backend

# 用 PM2 启动 server.js，并给进程起一个便于识别的名字
pm2 start server.js --name personalink-backend

# 保存当前 PM2 进程列表，服务器重启后才能恢复
pm2 save

# 生成开机自启命令；执行后请按终端提示再复制执行那条 sudo 命令
pm2 startup

# 查看后端是否在线；online 表示正在运行
pm2 status

# 查看最近的后端日志；接口报错或端口问题优先看这里
pm2 logs personalink-backend
```

### 4.3 配置 Nginx

项目根目录已有 [nginx.conf](../nginx.conf) 示例配置。它做两件事：

1. 从 `frontend/dist` 提供 Vue 页面，并把前端路由刷新回退到 `index.html`。
2. 将浏览器的 `/api/...` 请求转发到本机后端 `127.0.0.1:3003`。

复制配置到 Nginx 配置目录后，先修改域名、IP 和前端绝对路径：

```bash
# 复制项目中的 Nginx 配置；目标路径按发行版实际情况调整
sudo cp /var/www/personalink/PersonaLink_NoDB_20260828/nginx.conf /etc/nginx/sites-available/personalink

# 创建启用配置的软链接；-s 表示创建符号链接，-f 表示目标存在时覆盖链接
sudo ln -sf /etc/nginx/sites-available/personalink /etc/nginx/sites-enabled/personalink

# 检查 Nginx 配置语法；出现 syntax is ok 才继续
sudo nginx -t

# 重新加载配置，不中断已经建立的连接
sudo systemctl reload nginx
```

编辑 `/etc/nginx/sites-available/personalink` 时至少检查：

- `server_name`：域名或服务器公网 IP；不要继续使用 `example.com`、`203.0.113.10` 示例值。
- `root`：必须是实际的 `frontend/dist` 绝对路径。按本指南目录时应为 `/var/www/personalink/PersonaLink_NoDB_20260828/frontend/dist`。
- 防火墙开放 `80`/`443`，不要把后端 `3003` 直接暴露给公网。

如果服务器没有 `sites-enabled` 目录，也可以把配置放到发行版提供的 `conf.d` 目录，但不要同时启用两份相同的 `server` 配置。

## 5. 更新已经部署的项目

更新前建议先备份教学数据，因为用户和班级数据保存在 `backend/db.json` 中：

```bash
# 进入项目目录
cd /var/www/personalink/PersonaLink_NoDB_20260828

# 备份 JSON 数据；日期用于区分备份版本
cp backend/db.json "backend/db.json.backup-$(date +%Y%m%d-%H%M%S)"

# 拉取远程 main 分支的最新代码
git pull origin main

# 重新安装后端依赖，确保与最新锁文件一致
cd backend
npm ci

# 返回根目录并重新安装前端依赖、生成新的静态文件
cd ../frontend
npm ci
npm run build

# 重启后端，让新代码生效
pm2 restart personalink-backend

# 重新加载 Nginx；前端静态文件更新后通常不需要重启 Nginx，但执行此命令可确保配置已生效
sudo systemctl reload nginx
```

如果当前分支不是 `main`，先运行 `git branch --show-current` 查看分支，再将 `git pull origin main` 中的 `main` 换成实际分支名。

## 6. 部署后检查

按下面顺序检查，能快速定位问题：

```bash
# 检查后端根路径；看到 Server is running 相关 JSON，说明 Node.js 服务可访问
curl http://127.0.0.1:3003/

# 检查班级 API；返回 JSON 数组或对象，说明后端和 db.json 基本正常
curl http://127.0.0.1:3003/api/classes

# 查看 3003 端口是否有进程监听；Linux 常用 ss 命令
ss -lntp | grep 3003

# 查看 PM2 状态；personalink-backend 应为 online
pm2 status
```

然后在浏览器中检查：

1. 首页能否打开，刷新 `/login`、`/home` 等前端路由不会出现 Nginx 404。
2. 登录、班级列表、照片墙和搜索是否能正常请求 API。
3. 浏览器开发者工具的 Network 面板中，`/api/...` 请求是否返回 2xx；`502` 通常表示后端没有运行，`404` 通常表示路径或 Nginx 配置不对。

## 7. 常见问题

### `npm ci` 报锁文件或版本错误

确认命令是在正确目录执行：后端是 `backend`，前端是 `frontend`。如果 `package.json` 被单独修改过而锁文件没有同步，先在本地运行 `npm install` 更新对应锁文件，再提交后重新部署。

### `EADDRINUSE: address already in use`

说明端口已经被其他程序占用。先停止旧的 Node.js/PM2 进程，或确认你没有重复启动同一个服务。Windows 可使用：

```powershell
# 查找占用 3003 端口的进程；最后一列通常是 PID（进程编号）
netstat -ano | findstr :3003

# 结束指定 PID 的进程；把 <进程号> 替换成上一步查到的数字
taskkill /PID <进程号> /F
```

### 页面能打开但接口报 502

检查 `pm2 status` 和 `pm2 logs personalink-backend`。另外确认 Nginx 的 `proxy_pass` 指向 `127.0.0.1:3003`，并确认后端实际监听的端口没有被 `PORT` 环境变量改掉。

## 8. 安全边界

这是教学项目，不应直接作为生产系统使用。当前数据保存在 JSON 文件中，认证和密码处理也仅适合课堂演示。正式上线前至少应增加密码哈希、可靠的 Session/JWT、正式数据库、环境变量、HTTPS、限流、输入校验、日志、备份和权限审计。

## 9. GitHub Pages 的适用范围

GitHub Pages 只能发布前端静态文件，不能运行本项目的 Express 服务，也不能读写 `backend/db.json`。因此单独发布 `frontend/dist` 后，页面资源可显示，但登录、注册、班级和照片墙等 API 功能不可用。

要保留完整功能，应部署 Vue 前端和 Node.js 后端，并用 `VITE_API_BASE_URL` 指向后端；或将项目改造成仅使用浏览器本地存储的纯前端演示。项目路由使用历史模式，若只做 Pages 静态演示还需处理仓库子路径与刷新路由的 404 问题。

## 10. npm 命令为什么不同：安装命令与脚本命令

### `npm ci` 和 `npm install`

两者都安装依赖，但目的不同：

| 命令 | 依据 | 是否改写锁文件 | 适用场景 |
| --- | --- | --- | --- |
| `npm ci` | 严格依据已有 `package-lock.json` | 否 | 克隆后首次运行、课堂统一环境、CI、部署 |
| `npm install` | `package.json`，并同步锁文件 | 可能 | 添加/升级依赖，或修复两份依赖文件不一致 |

`ci` 是 clean install。它会清理并重建 `node_modules`，因此不要把个人源码放在 `node_modules` 里。对已经带有正确 `package-lock.json` 的本项目，运行和部署优先使用 `npm ci`，这样每台机器拿到的依赖版本更一致。

### `npm start`、`npm run dev` 与 `npm run build`

它们的依据是所在目录的 `package.json` 的 `scripts` 字段。先执行 `npm run` 可以查看该目录所有真实脚本。`npm start` 等同于 `npm run start`，只是 `start` 是 npm 的特殊简写。

本项目的真实定义如下：

| 目录 | 脚本 | 实际执行内容 | 为什么这样用 |
| --- | --- | --- | --- |
| `backend` | `start` | `node server.js` | 普通启动 Express 后端 |
| `backend` | `dev` | `nodemon server.js` | 改后端代码时自动重启 |
| `frontend` | `dev` | `vite` | 开发服务器、热更新页面 |
| `frontend` | `build` | `vite build` | 生成 `frontend/dist` 生产静态文件 |
| `frontend` | `preview` | `vite preview` | 本机预览构建结果，不是生产部署 |

所以不能因为“都是启动”就把前后端都写成 `npm start`。团队可以自行定义脚本名称，但前提是先在对应 `package.json` 中定义并写进文档；当前前端没有 `start` 脚本，直接执行会报错。
