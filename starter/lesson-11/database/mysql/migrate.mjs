import { migrateMysql, openMysqlPool } from '../../server/mysqlDatabase.js'

const pool = openMysqlPool()
try {
  const applied = await migrateMysql(pool)
  console.log(applied.length ? `已应用 MySQL 迁移：${applied.join(', ')}` : 'MySQL 已是最新版本。')
} finally { await pool.end() }
