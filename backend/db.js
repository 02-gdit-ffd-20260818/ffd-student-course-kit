require('dotenv').config();

const mysql = require('mysql2/promise');

const requiredInProduction = ['DB_HOST', 'DB_NAME', 'DB_USER'];

if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`生产环境缺少数据库配置：${missing.join(', ')}`);
  }
}

// ============ 第14课 TODO 01（极简单）：连接信息必须从 .env 读 ============
// 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
// 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
// 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
// 第 13 课的 SQLite 是一个本地文件，不需要账号密码。
// MySQL 是一个**独立运行的服务**，要用账号密码连过去——
// 于是第一次出现了"**不能写进代码里的东西**"。
//
// 终端里看得到的结果：npm run db:verify 能连上数据库并打印表结构。
//
// 本任务要补全：把下面五处改成从 process.env 读取。
//
// **为什么绝对不能写在源码里**：源码要进 Git、要分享给同学、
// 要发到服务器上。密码一旦进了 Git 历史，**删掉也没用**——
// 历史里还在，任何克隆过仓库的人都有。只能去改密码。
//
// 另外注意 user 不要用 root：应用应该用一个**只能操作这个库**的账号，
// 万一被注入，损失范围也小得多。这叫"最小权限"。
// ========================================================
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'personalink',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const connectDB = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};

const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, connectDB, withTransaction };
