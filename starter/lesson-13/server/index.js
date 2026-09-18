import { createApp } from './app.js'
import { createMysqlMemberRepository, migrateMysql, openMysqlPool, seedMysqlMembers, seedMysqlUsers } from './mysqlDatabase.js'
import { createSqliteMemberRepository, migrateSqlite, openSqlite, seedSqliteMembers, seedSqliteUsers } from './sqliteDatabase.js'

const port = Number(process.env.PORT) || 3020
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters')
let repository
let userRepository
let closeDatabase

if (process.env.DB_DRIVER === 'mysql') {
  const pool = openMysqlPool(); await migrateMysql(pool); repository = createMysqlMemberRepository(pool); userRepository = await seedMysqlUsers(pool); await seedMysqlMembers(pool); closeDatabase = () => pool.end()
} else {
  const db = openSqlite(process.env.DATABASE_PATH || './var/p3-community.sqlite'); migrateSqlite(db); repository = createSqliteMemberRepository(db); userRepository = seedSqliteUsers(db); seedSqliteMembers(db); closeDatabase = () => db.close()
}

const server = createApp({ repository, userRepository }).listen(port, '0.0.0.0', () => console.log(`P3 API listening on http://127.0.0.1:${port}`))
function shutdown(){server.close(async()=>{await closeDatabase();process.exit(0)})}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown)
