# PersonaLink - 部署指南

## 🎯 项目简介
PersonaLink是一个基于Vue.js + Node.js的个人介绍分享平台，实现分班功能、瀑布流照片墙和用户检索功能。

## 📋 系统要求
- **Node.js**: 22.0.0 或更高版本
- **npm**: 10.0.0 或更高版本
- **操作系统**: Windows/macOS/Linux
- **网络**: 局域网环境（如需跨设备访问）

## 🚀 快速开始

### 1. 环境检查
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version
```

### 2. 安装依赖

项目采用 npm workspaces，只需在仓库根目录安装一次：

```bash
npm install
```

### 3. 启动服务

#### 启动后端服务器
```bash
npm run dev:backend
```
- 本地访问: http://localhost:3003
- 局域网访问: http://[你的IP]:3003
- 用ipconfig命令查看本机IP地址
#### 启动前端服务器
```bash
npm run dev:frontend
```
- 本地访问: http://localhost:3000
- 局域网访问: http://[你的IP]:3000

## 🌐 局域网访问配置

### 获取本机IP地址
**Windows:**
```bash
ipconfig
```
查找 **IPv4地址** 字段

**macOS/Linux:**
```bash
ifconfig
```
查找 **inet** 字段

### 局域网访问方式
- **本机访问**: http://localhost:3000
- **局域网其他设备**: http://[你的IP]:3000

## 🔧 配置说明

### 后端配置 (`backend/src/server.js`)
- **端口**: 3003 (可修改)
- **CORS**: 允许所有来源
- **请求大小限制**: 10MB
- **监听地址**: 0.0.0.0 (支持局域网)

### 前端配置 (`frontend/src/config/api.js`)
- **API基础URL**: 自动配置为局域网IP
- **请求超时**: 默认设置
- **错误处理**: 包含完整错误提示

## 📊 数据存储

### 数据库类型
- **类型**: SQLite（WAL 模式）
- **文件**: backend/data/persona-link.sqlite
- **结构**: 包含users、classes、standard_hobbies和synonym_groups表
- **初始化**: 首次启动时自动导入backend/data/seed.json中的脱敏演示数据

### 数据字段示例
```json
{
  "users": [
    {
      "id": "唯一标识",
      "username": "用户名",
      "email": "邮箱地址",
      "password": "密码",
      "avatar": "头像URL",
      "bio": "个人简介",
      "hobbies": ["爱好1", "爱好2"],
      "classId": "班级ID",
      "createdAt": "创建时间"
    }
  ],
  "classes": [
    {
      "id": "班级ID",
      "name": "班级名称",
      "description": "班级描述",
      "createdAt": "创建时间"
    }
  ],
  "synonymGroups": [
    {
      "id": "同义词组ID",
      "synonyms": ["同义词1", "同义词2"],
      "createdAt": "创建时间"
    }
  ]
}
```

## 🛠️ 常用操作

### 管理员账户（已内置）
- **管理员邮箱**: `admin@system.com`
- **管理员密码**: `admin123`
- **权限**: 可管理班级和同义词组
- **注意**: 管理员账户已存在于数据库中，无需注册，直接使用即可

### 用户注册
1. 访问 http://[IP]:3000/register
2. 填写用户名、邮箱、密码
3. 选择班级
4. 可选：上传头像、填写个人简介和爱好
5. 点击注册

### 用户登录
1. 访问 http://[IP]:3000/login
2. 输入邮箱和密码
3. 点击登录

### 班级管理
1. 使用管理员账户登录
2. 进入班级管理页面
3. 可以创建、查看、编辑和删除班级

### 照片墙浏览
1. 登录后自动跳转到照片墙页面
2. 可查看所有用户的卡片式展示
3. 鼠标悬停可查看用户详细信息
4. 可按班级筛选用户

### 用户搜索
1. 访问搜索页面
2. 输入搜索关键词
3. 选择搜索条件（姓名、爱好、家乡等）
4. 选择搜索范围（班级内或全站）
5. 查看搜索结果

### 同义词管理
1. 使用管理员账户登录
2. 进入同义词管理页面
3. 可以添加、查看和删除同义词组
4. 同义词用于扩展搜索范围

## 🔍 故障排除

### 端口占用问题
```bash
# Windows查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3003

# macOS/Linux查看端口占用
lsof -i :3000
lsof -i :3003
```

### 依赖安装失败
```bash
# 清除npm缓存
npm cache clean --force

# 重新安装依赖
npm install

# 删除node_modules后重新安装
rm -rf node_modules
npm install
```

### 局域网访问问题
1. 检查防火墙设置
2. 确认IP地址正确
3. 确保前后端服务器都在运行
4. 检查CORS配置是否正确

### 数据丢失问题
- **备份**: 停止后端服务后，定期备份backend/data/persona-link.sqlite文件
- **恢复**: 停止服务，替换SQLite文件，再重新启动后端

### 同义词功能异常
1. 确认已初始化同义词数据
2. 使用管理员账户登录
3. 检查API请求是否正确

### 班级功能异常
1. 确认班级数据已正确创建
2. 检查用户是否正确关联班级
3. 验证班级筛选功能

### 性能问题
1. 检查数据库文件大小
2. 考虑实现数据分页
3. 优化前端资源加载

### 开发环境问题
1. 确保Node.js版本符合要求
2. 检查所有依赖是否正确安装
3. 查看控制台错误信息

## 🚀 生产部署

### 构建生产版本
```bash
npm run build
```

### 部署到服务器
1. 将 `frontend/dist` 内容复制到Web服务器
2. 使用 `npm start` 运行后端
3. 按 `infrastructure/nginx/nginx.conf` 配置反向代理

## 📞 技术支持

### 检查服务状态
```bash
# 查看后端日志
tail -f backend/server.log

# 查看前端日志
# 浏览器开发者工具 → Console
```

### 获取帮助
- **查看日志**: 检查终端输出和浏览器控制台
- **网络检查**: 使用浏览器Network面板查看API调用
- **数据检查**: 在仓库根目录运行 `npm run db:status`，或使用SQLite客户端检查数据库

## 🎉 完成

现在你的Vue用户管理系统已经成功部署！局域网内的其他用户可以通过 http://[你的IP]:3000 访问并使用系统。

享受你的用户管理系统吧！🚀
