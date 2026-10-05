// 检查 .env 指向的真实文件库；SAVEPOINT 范围内的检查写入最后全部撤销。
// 用法（工程根目录）：node --env-file=.env scripts/check-lesson07-db.mjs
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { checkUsersSchema } from './check-lesson07.mjs'
import { createBlogApp } from '../server/blog-app.js'

assert.notEqual(process.env.DATABASE_PATH, ':memory:', '此检查必须针对文件库，不能填 :memory:')
const filename = resolve(process.env.DATABASE_PATH || './var/blog.sqlite')
console.log('当前文件库：' + filename)
assert.ok(existsSync(filename), '数据库不存在：请先在同一工程启动后端，再执行此检查；不会自动创建空库')
const database = new DatabaseSync(filename)
const db = { query: async (sql, params = []) => database.prepare(sql.replace(/\$\d+/g, '?')).all(...params) }
let server
let saved = false
try {
  database.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000')
  database.exec('SAVEPOINT lesson07_live_check')
  saved = true
  await checkUsersSchema(db)
  // 独立随机本机端口，不冒充或占用已经运行的网页后端。
  server = createBlogApp(db, randomBytes(32).toString('base64url')).listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
  const body = { username: 'check_' + randomBytes(6).toString('hex'), displayName: '约束检查', password: randomBytes(24).toString('hex') }
  const register = () => fetch('http://127.0.0.1:' + server.address().port + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const first = await register()
  await first.text()
  assert.equal(first.status, 201, '第一次注册应为 201')
  const second = await register()
  await second.text()
  assert.equal(second.status, 409, '同名第二次注册必须是 409，不能再次 201')
  console.log('[PASS] 当前文件库：用户约束通过，同名注册 201 → 409；测试写入将在退出前撤销。')
} finally {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
  if (saved) database.exec('ROLLBACK TO lesson07_live_check; RELEASE lesson07_live_check')
  database.close()
}
