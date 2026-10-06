// 教师提供的课堂启动保护：SQL 文件变了，不代表已有 SQLite 表已改变。
// 只比较，不迁移、不删库，也不替学生填写约束。
export function assertCourseSchema(database, DatabaseSync, schema, filename) {
  const expected = new DatabaseSync(':memory:')
  const normalize = sql => sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '').toLowerCase()
  try {
    for (const sql of schema) expected.exec(sql)
    for (const table of ['users', 'articles', 'comments']) {
      const query = "SELECT sql FROM sqlite_master WHERE type='table' AND name=?"
      const actual = database.prepare(query).get(table)?.sql || ''
      const wanted = expected.prepare(query).get(table).sql
      if (normalize(actual) !== normalize(wanted)) throw new Error(
        `[COURSE_SCHEMA_MISMATCH] ${table} 表与当前建表代码不同。\n实际数据库：${filename}\n` +
        '服务已停止，旧数据未删除。CREATE TABLE IF NOT EXISTS 不会更新旧表。\n' +
        '本机课堂练习请按手册保留旧库，在 .env 的 DATABASE_PATH 选择未使用的新库路径后重启。真实数据必须迁移，不得换空库冒充升级。',
      )
    }
  } finally { expected.close() }
}
