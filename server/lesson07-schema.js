// 本课的启动保护，不是迁移工具：修改 CREATE TABLE 不会更新已有表。
// 用 SQLite 自己解析最新 users 建表语句，再与文件库比较，忽略注释和空白。
// 不删除旧数据，不自动补 UNIQUE，更不会替学生完成 TODO 01。
export function assertLesson07Schema(database, DatabaseSync, usersSql, databasePath) {
  const expected = new DatabaseSync(':memory:')
  const normalize = sql => sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '').toLowerCase()
  try {
    expected.exec(usersSql)
    const query = "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'"
    if (normalize(database.prepare(query).get().sql) !== normalize(expected.prepare(query).get().sql)) {
      throw new Error(
        '[LESSON07_SCHEMA_MISMATCH] users 旧表与当前建表代码不同。\n' +
        '实际数据库：' + databasePath + '\n' +
        'CREATE TABLE IF NOT EXISTS 不会更新旧表；服务已停止，不会继续用旧表接受注册。\n' +
        '请按 TODO 01 的“让本机文件库采用新结构”操作，保留旧库，给 .env 的 DATABASE_PATH 设置一个未使用的新练习库路径。云端真实数据必须迁移，不按练习库方法处理。',
      )
    }
  } finally {
    expected.close()
  }
}
