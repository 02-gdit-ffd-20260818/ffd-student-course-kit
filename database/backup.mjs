import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { backupDatabase, openDatabase } from '../server/database.js'

const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const destination = process.argv[2] || `./var/backups/p2-blog-${timestamp}.sqlite`
mkdirSync(dirname(resolve(destination)), { recursive: true })
const database = openDatabase(databasePath)
try {
  console.log(`备份完成：${await backupDatabase(database, destination)}`)
} finally {
  database.close()
}
