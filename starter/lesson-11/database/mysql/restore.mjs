import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { mysqlConfig } from '../../server/mysqlDatabase.js'

const source = process.argv[2]
if (!source) {
  console.error('用法：npm run db:mysql:restore -- <备份 SQL 路径>')
  process.exit(1)
}
await access(source)
const config = mysqlConfig()
const child = spawn('mysql', ['-h', config.host, '-P', String(config.port), '-u', config.user, config.database], { env: { ...process.env, MYSQL_PWD: config.password }, stdio: ['pipe', 'inherit', 'inherit'] })
createReadStream(source).pipe(child.stdin)
const exitCode = await new Promise((resolve) => child.once('close', resolve))
if (exitCode !== 0) process.exit(exitCode)
console.log('MySQL 恢复完成，请继续运行 db:mysql:verify。')
