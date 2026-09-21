import { ensureDatabaseDirectory, migrateDatabase, openDatabase } from '../server/database.js'

const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
ensureDatabaseDirectory(databasePath)
const database = openDatabase(databasePath)
try {
  const applied = migrateDatabase(database)
  console.log(applied.length ? `已应用迁移：${applied.join(', ')}` : '数据库已是最新版本。')
} finally {
  database.close()
}
