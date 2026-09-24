const express = require('express');
const cors = require('cors');
const { connectDB, closeDB } = require('./database');
const userRoutes = require('./routes/users');
const classRoutes = require('./routes/classes');
const photoWallRoutes = require('./routes/photowall');
const synonymsRoutes = require('./routes/synonyms');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

const startServer = async () => {
  await connectDB();

  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      resolve(listener);
    });
    listener.once('error', reject);
  });

  const shutdown = () => {
    server.close(() => {
      closeDB();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

startServer().catch(error => {
  console.error('服务器启动失败:', error);
  closeDB();
  process.exit(1);
});
