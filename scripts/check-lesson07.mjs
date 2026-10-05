// 用法：node scripts/check-lesson07.mjs 0（原始起点）或 1/2/3/4（刚完成的任务编号）。
// 检查使用独立内存数据库与随机本机端口，不读取、清空或覆盖你的 var/blog.sqlite。
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { openBlogDb } from '../server/blog-db.js'
import { createBlogApp } from '../server/blog-app.js'
import { verifyAccessToken } from '../server/services/auth.js'

export async function checkUsersSchema(db) {
  // SAVEPOINT 创建可撤销的检查范围；ROLLBACK TO 撤销全部试写，RELEASE 结束范围。
  await db.query('SAVEPOINT lesson07_probe')
  try {
    const name = 'probe_' + Date.now()
    const insert = (username, role = 'reader', display = '检查', salt = 'salt', hash = 'hash') => db.query(
      'INSERT INTO users(username,display_name,role,password_salt,password_hash) VALUES($1,$2,$3,$4,$5)',
      [username, display, role, salt, hash],
    )
    await insert(name)
    await assert.rejects(() => insert(name), /UNIQUE/, 'username 必须唯一')
    await assert.rejects(() => insert(name + '_r', 'superadmin'), /CHECK/, 'role 必须限制为 reader/admin')
    for (const [label, args] of [
      ['username', [null]], ['display_name', [name + '_d', 'reader', null]],
      ['role', [name + '_r', null]], ['password_salt', [name + '_s', 'reader', '检查', null]],
      ['password_hash', [name + '_h', 'reader', '检查', 'salt', null]],
    ]) await assert.rejects(() => insert(...args), /NOT NULL/, label + ' 必须非空')
    await db.query('INSERT INTO users(username,display_name,password_salt,password_hash) VALUES($1,$2,$3,$4)', [name + '_default', '默认角色', 'salt', 'hash'])
    assert.equal((await db.query('SELECT role FROM users WHERE username=$1', [name + '_default']))[0].role, 'reader')
  } finally {
    await db.query('ROLLBACK TO lesson07_probe')
    await db.query('RELEASE lesson07_probe')
  }
}

export async function checkLesson07(stage = 4) {
  assert.ok(Number.isInteger(stage) && stage >= 0 && stage <= 4, '参数必须是 0、1、2、3 或 4')
  const db = await openBlogDb({ DATABASE_PATH: ':memory:' })
  const secret = 'lesson07-check-only-not-a-production-secret'
  let server
  try {
    if (stage >= 1) await checkUsersSchema(db)
    server = createBlogApp(db, secret).listen(0, '127.0.0.1')
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
    const base = 'http://127.0.0.1:' + server.address().port
    const request = async (route, body) => {
      const response = await fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      return { status: response.status, body: await response.json() }
    }
    const valid = { username: 'student_check', displayName: '测试同学', password: 'Student-check-123456' }
    const first = await request('/api/auth/register', valid)
    assert.equal(first.status, 201, '合法注册必须成功，不能返回 501')
    assert.ok(first.body.data.user.id)
    assert.ok(!JSON.stringify(first.body).includes('password'), '不能返回密码盐或摘要')
    const [saved] = await db.query('SELECT password_salt,password_hash FROM users WHERE username=$1', [valid.username])
    assert.ok(saved.password_hash && saved.password_hash !== valid.password, '必须存摘要，不存明文')
    await request('/api/auth/register', { ...valid, username: 'same_password' })
    const [other] = await db.query('SELECT password_salt,password_hash FROM users WHERE username=$1', ['same_password'])
    assert.notEqual(saved.password_salt, other.password_salt, '同口令也应生成不同随机盐')
    assert.notEqual(saved.password_hash, other.password_hash)
    assert.equal(Boolean(first.body.data.token), stage === 4, 'TODO04 前仅创建账号，完成后才自动登录')
    if (stage === 4) {
      assert.equal(verifyAccessToken(first.body.data.token, secret)?.username, valid.username)
      const [payload, signature] = first.body.data.token.split('.')
      const changed = { ...JSON.parse(Buffer.from(payload, 'base64url').toString()), role: 'admin' }
      assert.equal(verifyAccessToken(Buffer.from(JSON.stringify(changed)).toString('base64url') + '.' + signature, secret), null, '修改角色后原签名应无效')
    }
    if (stage >= 2) {
      const cases = [
        { username: 'a' }, { username: 'ab-' }, { displayName: '' }, { displayName: '字'.repeat(25) },
        { password: 123 }, { password: '1' }, { password: 'x'.repeat(129) },
      ]
      for (const invalid of cases) {
        const result = await request('/api/auth/register', { ...valid, username: 'invalid_case', ...invalid })
        assert.equal(result.status, 400, '非法输入必须在写库前被拒绝：' + JSON.stringify(invalid))
        assert.match(result.body.error.message, /用户名/)
      }
    } else {
      assert.equal((await request('/api/auth/register', { username: 'a', displayName: 'x', password: 'Student-check-123456' })).status, 201)
      // 底层 hashPassword 已有最小长度保护；缺少路由校验时短密码表现为通用 500，不能声称会成功。
      assert.equal((await request('/api/auth/register', { username: 'short_password', displayName: 'x', password: '1' })).status, 500)
    }
    const duplicate = await request('/api/auth/register', valid)
    assert.equal(duplicate.status, stage === 0 ? 201 : 409,
      '重名应依次经历：无约束 201 → 数据库兜底 409 → 明确的用户名提示 409')
    if (stage === 1 || stage === 2) assert.equal(duplicate.body.error.message, '用户名或文章地址重复')
    if (stage >= 3) assert.match(duplicate.body.error.message, /用户名已被使用/)
    if (stage === 4) {
      assert.equal((await request('/api/auth/login', valid)).status, 200)
      assert.equal((await request('/api/auth/login', { ...valid, password: 'wrong-password' })).status, 401)
      const wrong = await request('/api/auth/login', { ...valid, password: 'wrong-password' })
      const absent = await request('/api/auth/login', { ...valid, username: 'not_present' })
      assert.deepEqual(wrong, absent, '不存在账号和错误密码不应泄露不同信息')
    }
    console.log(`[PASS] lesson07 阶段 ${stage}：本阶段和前置阶段符合预期；没有修改本机数据库。`)
  } finally {
    if (server) await new Promise(resolve => server.close(resolve))
    await db.close()
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await checkLesson07(Number(process.argv[2] ?? 4)) }
  catch (error) { console.error('[FAIL]', error.message); process.exitCode = 1 }
}
