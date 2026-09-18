import { openMysqlPool } from '../../server/mysqlDatabase.js'

const pool = openMysqlPool()
try {
  const [rows] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('users','articles','comments') ORDER BY table_name")
  const [[migration]] = await pool.query('SELECT COUNT(*) AS count FROM schema_migrations')
  if (rows.length !== 3 || Number(migration.count) < 1) throw new Error('MySQL 数据库验证失败')
  console.log(`MySQL 验证通过：业务表=${rows.map((row) => row.TABLE_NAME || row.table_name).join(',')}，迁移数=${migration.count}`)
} finally { await pool.end() }
