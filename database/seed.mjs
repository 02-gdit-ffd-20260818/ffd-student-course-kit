import { ensureDatabaseDirectory, migrateDatabase, openDatabase, seedDatabase } from '../server/database.js'

const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
ensureDatabaseDirectory(databasePath)
const database = openDatabase(databasePath)
try {
  migrateDatabase(database)
  console.log(`种子数据就绪，文章总数：${seedDatabase(database)}`)
} finally {
  database.close()
}
