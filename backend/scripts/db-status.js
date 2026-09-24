const { getDatabaseInfo, closeDB } = require('../src/database');

try {
  const info = getDatabaseInfo();
  console.log('SQLite 数据库状态');
  console.log(`路径: ${info.path}`);
  console.log(`日志模式: ${info.journalMode}`);
    // ============ TODO 03（简单）：让 db:status 说清楚库里有什么 ============
  // 终端里看得到的结果：npm run db:status 打印出一张表，
  // 列出每张表各有多少行——**这是你确认"数据真的进去了"的唯一手段**。
  //
  // TODO：用 console.table(summary) 把统计结果打印成表格。
  //   console.table 比 console.log 好在哪：它会自动对齐成表格，
  //   几十行数据一眼能扫完。
  //
  // 这一课之后每次改动数据库，都该先跑一次 db:status 看看现状。
  // **不要靠猜**——猜错的代价是把好数据覆盖掉。
  // ============================================================
  console.log(info.counts);
} finally {
  closeDB();
}
