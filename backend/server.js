const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const userRoutes = require('./routes/users');
const classRoutes = require('./routes/classes');
const photoWallRoutes = require('./routes/photowall');
const synonymsRoutes = require('./routes/synonyms_new');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
// Express 4.16+ 已内置 JSON 和表单解析器，不再需要额外安装 body-parser。
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 数据文件确认可读取后再监听，不能在初始化失败时仍声称启动成功。

// API路由
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/photowall', photoWallRoutes);
app.use('/api/synonyms', synonymsRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
connectDB().then(() => app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  console.log('本课开发接口只监听本机；上线按手册使用受控入口，不开放开发端口。');
})).catch(error => {
  console.error('启动失败，未监听端口：', error.message);
  process.exitCode = 1;
});
