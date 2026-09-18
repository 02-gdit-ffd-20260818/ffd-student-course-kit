import { createApp } from './app.js'
import { ensureDatabaseDirectory, migrateDatabase, openDatabase, seedDatabase } from './database.js'
import { createSqliteArticleRepository } from './repositories/sqliteArticleRepository.js'

const port = Number(process.env.PORT) || 3000
const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
ensureDatabaseDirectory(databasePath)
const database = openDatabase(databasePath)
migrateDatabase(database)
seedDatabase(database)

const server = createApp({ repository: createSqliteArticleRepository(database) }).listen(port, '0.0.0.0', () => {
  console.log(`P2 API listening on http://127.0.0.1:${port}`)
})

function shutdown() {
  server.close(() => {
    database.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
