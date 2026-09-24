# PersonaLink_NoDB 教学项目

> 初次遇到 `npm ci`、`npm run dev` 等命令时，先读 npm 命令词典与命名故事：其中重点解释 **ci = clean install**、**dev = development**，以及命令为什么不能随意猜。

PersonaLink 是一个用于学习前后端协作的个人信息分享平台，包含用户注册登录、班级管理、个人资料、用户搜索、照片墙和同义词管理。

这是一个适合课堂演示和本地学习的项目：前端使用 Vue 3 + Vite，后端使用 Node.js + Express，数据暂时保存在 `backend/db.json`。它不应未经加固就直接作为生产系统使用。

## 5 分钟快速开始

### 1. 准备软件

请先安装 Node.js 24、npm 10+ 和 Git。安装后打开终端检查版本：

```bash
# 查看 Node.js 版本；项目要求 20 或更高版本
node --version

# 查看 npm 版本；npm 会随 Node.js 一起安装
npm --version

# 查看 Git 版本；Git 用来下载项目代码
git --version
```

### 2. 下载项目

真实仓库地址：<https://github.com/Abner199/PersonaLink_NoDB_20260828>

```bash
# 从 GitHub 下载项目；.git 表示这是 Git 仓库地址
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git

# 进入项目目录；后面的 cd 和 npm 命令都要在正确目录中执行
cd PersonaLink_NoDB_20260828
```

### 3. 启动后端

打开第一个终端窗口，在项目根目录执行：

```bash
# 进入后端目录
cd backend

# 根据 package-lock.json 安装确定版本的依赖
# npm ci 适合首次安装和部署，不会主动改写锁文件
npm ci

# 启动 Express 后端，默认监听 3003 端口
npm start
```

看到 `Server is running on http://localhost:3003` 后，保持窗口不要关闭。

### 4. 启动前端

打开第二个终端窗口，进入刚刚下载的项目目录：

```bash
# 如果新终端不在项目目录，请先进入项目目录
cd PersonaLink_NoDB_20260828

# 进入前端目录
cd frontend

# 根据 package-lock.json 安装前端依赖
npm ci

# 启动 Vite 开发服务器，默认监听 3000 端口
npm run dev
```

浏览器访问 <http://localhost:3000>。如果你使用的仓库目录名不同，请把 `cd PersonaLink_NoDB_20260828` 换成实际目录名。

### 5. 登录教学账号

```text
邮箱：admin@system.com
密码：admin123
```

> 代码块中的 `#` 是命令备注，不需要复制执行。Windows 用户可以在 PowerShell 中执行 Git 和 npm 命令；Linux 用户使用终端即可。

## 项目结构

```text
PersonaLink_NoDB/
├── frontend/                  # Vue 3 + Vite 前端
│   ├── src/views/              # 页面组件
│   ├── src/components/         # 可复用组件
│   ├── src/stores/             # Pinia 状态管理
│   ├── src/utils/api/          # Axios API 请求封装
│   ├── src/router/             # 路由和权限控制
│   ├── public/                 # 不经过打包处理的静态资源
│   ├── package.json            # 前端依赖和命令
│   └── package-lock.json       # 前端依赖锁文件
├── backend/                   # Node.js + Express 后端
│   ├── routes/                # API 路由
│   ├── middleware/            # 中间件
│   ├── utils/                 # 后端工具函数
│   ├── db.json                # 教学用 JSON 数据
│   ├── package.json           # 后端依赖和命令
│   ├── package-lock.json      # 后端依赖锁文件
│   └── server.js              # 后端入口
├── docs/                      # 教程、部署和测试文档
├── nginx.conf                 # Nginx 部署示例
└── .gitignore                 # Git 忽略规则
```

## 常用命令

### 前端构建和预览

```bash
# 进入前端目录
cd frontend

# 生成生产构建文件，输出到 frontend/dist
npm run build

# 启动 Vite 预览服务器，通常使用 4173 端口
# 该命令只用于本地检查构建结果，不是生产环境服务器
npm run preview
```

### 后端开发模式

```bash
# 进入后端目录
cd ../backend

# 使用 nodemon 启动；修改后端文件后会自动重启
npm run dev
```

### 命令速查

| 命令 | 作用 |
|---|---|
| `npm ci` | 按锁文件安装依赖，适合首次安装和部署 |
| `npm install` | 安装依赖，或在新增/升级依赖时更新锁文件 |
| `npm start` | 启动后端生产/普通运行模式 |
| `npm run dev` | 启动开发模式；后端支持自动重启，前端启动 Vite |
| `npm run build` | 构建前端静态文件 |
| `npm run preview` | 预览前端构建结果 |
| `Ctrl+C` | 停止当前终端中正在运行的服务 |

### 为什么教程推荐 `npm ci`，而不是 `npm install`？

本仓库的前端和后端都已经提交了 `package-lock.json`。这个锁文件记录了经过验证的依赖精确版本，因此从 GitHub 克隆项目、换电脑部署或重新安装依赖时，优先运行：

```bash
npm ci
```

`npm ci` 会先清理已有的 `node_modules`，再严格按照 `package-lock.json` 安装，不会主动改写锁文件。这样不同电脑得到的依赖版本更一致，也更容易复现开发者已经测试过的运行环境。

以下情况改用 `npm install`：

- 项目没有 `package-lock.json`。
- 你正在添加新依赖，例如 `npm install axios`。
- 你正在升级依赖，需要同步更新 `package.json` 和 `package-lock.json`。
- `npm ci` 提示两个文件中的依赖不一致；确认确实需要更新依赖后，运行 `npm install` 修复锁文件并提交变更。

简单记忆：**拉取并运行现成项目用 `npm ci`；开发时新增或升级依赖用 `npm install`。**

## 头像为什么不再使用外链？

旧示例数据使用 `picsum.photos` 随机图片地址。外链曾经能显示，只能说明当时浏览器成功访问了该网站；换电脑、换网络或外站策略变化后，可能因为网络超时、DNS、证书、限流或防盗链而加载失败。页面其余内容正常但头像区域空白，通常就是这个原因。

当前版本提供 46 个可独立展示的高级质感本地图像位，包括海洋、天空、山湖等自然风景和写实风格的虚构人物。42 名演示学生按固定编号一人一图，不会重复；新增普通用户则根据账号稳定匹配。素材位于 `frontend/public/images/avatars`，会随项目一起部署，不依赖第三方图片站。用户上传真实头像后，真实头像始终优先显示。

### 上传的照片保存在哪里？

本 NoDB 版本不会自动把照片上传到外链：

1. 浏览器将照片居中裁切并压缩为 512×512 的 JPEG，再转换成 Base64 Data URL。
2. 前端通过用户资料更新接口把头像数据发送给后端。
3. 后端将数据保存在 `backend/db.json` 对应用户的 `avatar` 字段中。

这种方式适合教学、演示和少量用户，但图片会让 `db.json` 变大。正式生产项目建议把图片上传到对象存储（例如 S3、OSS、COS），数据库只保存对象存储返回的 URL；还应增加登录鉴权、文件类型和大小校验、图片压缩、访问权限及备份策略。

## 演示班级和人数

当前演示数据共 42 名学生，管理员账号不计入人数：

所有学生均使用不重复、接近真实姓名习惯的文化感虚拟姓名，例如“江砚”“沈知微”“许清和”“叶听澜”；仅用于教学演示，不对应真实人物。

| 班级 | 学生人数 |
| --- | ---: |
| 测试1班 | 30 人 |
| 测试2班 | 10 人 |
| 测试3班 | 2 人 |

班级接口会根据用户的 `classId` 实时计算 `studentCount`。如需把已有 `db.json` 重新整理成这套演示数据，可在项目根目录执行：

```bash
# 保留管理员和现有普通用户，补足演示学生并按 30/10/2 重新分班
node scripts/setup-demo-classes.mjs
```

## 端口和请求关系

- 前端开发地址：<http://localhost:3000>
- 后端地址：<http://localhost:3003>
- 前端请求 `/api/...` 时，Vite 会代理到 `http://localhost:3003`。
- 后端实际路由以 `/api` 开头，例如班级列表是 `GET /api/classes`。

## 推荐学习顺序

建议按以下顺序阅读：

1. [教学案例教程](./docs/教学案例教程.md)：先理解一次请求如何从页面走到后端。
2. `frontend/src/main.js` 和 `frontend/src/App.vue`：了解前端入口和整体布局。
3. `frontend/src/router/index.js`：了解页面路径和权限守卫。
4. `frontend/src/views/Login.vue`：从登录页面开始看用户操作。
5. `frontend/src/stores/user.js` 和 `frontend/src/utils/api/userService.js`：了解状态和 API 请求。
6. `backend/server.js` 和 `backend/routes/users.js`：了解后端启动及用户接口。
7. `backend/db.js` 和 `backend/db.json`：了解教学数据如何读写。

## 文档入口

- 教学课程包：面向 HTML 初学者的 9 课实操路径、教师指南和作业量规。
- [文档中心](./docs/README.md)：按“使用、功能、工程、部署、测试”选择阅读路线。
- [软件使用说明书](./docs/软件使用说明书.md)：普通用户与管理员的页面操作。
- [功能说明](./docs/功能说明.md)：当前真实功能、接口和边界。
- [软件工程实践](./docs/软件工程实践.md)：需求、设计、实现、测试与 CI/CD 建议。
- [GitHub 版本管理与发布教程](./docs/GitHub版本管理与发布教程.md)：固定稳定版本、创建 Tag 和 Release、回退与分支开发。
- [前后端与数据存储教学教程](./docs/前后端与数据存储教学教程.md)：用本项目学习 Vue、Express、API 与 JSON 数据存储如何协作。
- [GitHub 拉取与部署指南](./docs/GitHub部署指南.md)：从下载代码到 Linux + Nginx 部署。
- [教学案例教程](./docs/教学案例教程.md)：按模块阅读项目代码。
- [性能优化指南](./docs/performance-optimization-guide.md)：检查动画和浏览器性能。
- [测试计划](./docs/test-plan.md)：按清单验证功能。
- [测试报告](./docs/test-report.md)：查看历史测试基线和已知限制。
- [字体说明](./frontend/public/font/README.md)：替换 Logo 字体资源。

## 当前功能变更摘要

当前版本中，注册必须选择班级；普通用户的照片墙按自己的班级加载。管理员可维护班级、添加或删除普通用户，并把普通用户密码重置为 `123456`。详细规则与安全边界见 [功能说明](./docs/功能说明.md)。
