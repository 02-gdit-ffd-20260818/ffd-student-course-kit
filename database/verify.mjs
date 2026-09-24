import { openDatabase } from '../server/database.js'

const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
const database = openDatabase(databasePath)
try {
  const integrity = database.prepare('PRAGMA integrity_check').get().integrity_check
  const tables = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'articles', 'comments') ORDER BY name").all().map((row) => row.name)
  const foreignKeys = database.prepare('PRAGMA foreign_key_check').all()
  if (integrity !== 'ok' || tables.length !== 3 || foreignKeys.length) throw new Error('数据库验证失败')
  console.log(`数据库验证通过：integrity=${integrity}，业务表=${tables.join(',')}，外键错误=0`)
} finally {
  database.close()
}
