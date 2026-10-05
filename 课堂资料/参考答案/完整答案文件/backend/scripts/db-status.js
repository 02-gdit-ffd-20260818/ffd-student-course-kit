const { getDatabaseInfo, closeDB } = require('../src/database');

try {
  const info = getDatabaseInfo();
  console.log('SQLite 数据库状态');
  console.log(`路径: ${info.path}`);
  console.log(`日志模式: ${info.journalMode}`);
  console.table(info.counts);
} finally {
  closeDB();
}
