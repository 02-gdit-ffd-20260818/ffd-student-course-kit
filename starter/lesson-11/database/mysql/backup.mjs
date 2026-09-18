import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { mysqlConfig } from '../../server/mysqlDatabase.js'

const execute = promisify(execFile)
const config = mysqlConfig()
const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const destination = resolve(process.argv[2] || `./var/backups/mysql-p2-${timestamp}.sql`)
await mkdir(dirname(destination), { recursive: true })
const { stdout } = await execute('mysqldump', ['--single-transaction', '--skip-lock-tables', '--no-tablespaces', '--set-gtid-purged=OFF', '-h', config.host, '-P', String(config.port), '-u', config.user, config.database], { env: { ...process.env, MYSQL_PWD: config.password }, encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 })
await writeFile(destination, stdout, { mode: 0o600 })
console.log(`MySQL 备份完成：${destination}`)
