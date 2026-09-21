import { createApp } from './app.js'
import { ensureDatabaseDirectory, migrateDatabase, openDatabase, seedAdmin, seedDatabase } from './database.js'
import { createSqliteArticleRepository } from './repositories/sqliteArticleRepository.js'
import { createSqliteUserRepository } from './repositories/sqliteUserRepository.js'

const port = Number(process.env.PORT) || 3000
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters')
const admin = { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }
// Windows课堂与Ubuntu部署统一使用SQLite，学生只需要理解这一条数据链路。
const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
ensureDatabaseDirectory(databasePath)
const database = openDatabase(databasePath)
migrateDatabase(database)
seedDatabase(database)
seedAdmin(database, admin)
const repository = createSqliteArticleRepository(database)
const userRepository = createSqliteUserRepository(database)
const closeDatabase = () => database.close()

const server = createApp({ repository, userRepository }).listen(port, '0.0.0.0', () => {
  console.log(`P2 API listening on http://127.0.0.1:${port}`)
})

function shutdown() {
  server.close(async () => {
    await closeDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
