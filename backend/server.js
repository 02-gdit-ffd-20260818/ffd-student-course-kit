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

// 连接数据库
connectDB();

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // 对于云服务器，我们直接显示公网IP地址
  // 这里我们硬编码服务器的公网IP地址，因为云服务器的内网地址无法从外部访问
  console.log(`Server is accessible on http://43.156.217.98:${PORT}`);
});
