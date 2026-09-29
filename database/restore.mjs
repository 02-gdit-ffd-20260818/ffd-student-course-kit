import { restoreDatabase } from '../server/database.js'

const source = process.argv[2]
if (!source) {
  console.error('用法：npm run db:restore -- <备份文件路径>')
  process.exit(1)
}
const databasePath = process.env.DATABASE_PATH || './var/p2-blog.sqlite'
console.log(`恢复完成：${restoreDatabase(source, databasePath)}`)
