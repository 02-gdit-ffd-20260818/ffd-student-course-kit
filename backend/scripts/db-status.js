const { getDatabaseInfo, closeDB } = require('../src/database');

try {
  const info = getDatabaseInfo();
  console.log('SQLite 数据库状态');
  console.log(`路径: ${info.path}`);
  console.log(`日志模式: ${info.journalMode}`);
    // ============ 第13课 TODO 03（简单）：让 db:status 说清楚库里有什么 ============
  // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
  // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
  // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
  // 终端里看得到的结果：npm run db:status 打印出一张表，
  // 列出每张表各有多少行——用于检查当前文件中的实际行数，也可用 Navicat 查询核对。
  //
  // 本任务要补全：用 console.table(info.counts) 把统计结果打印成表格。
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
