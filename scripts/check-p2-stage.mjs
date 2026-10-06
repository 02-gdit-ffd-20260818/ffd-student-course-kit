// node scripts/check-p2-stage.mjs 08 1：检查第08课刚完成 TODO01 的状态。
// 仅支持08/09；末尾0表示未改的起点。全部使用内存库，不触碰个人数据。
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { openBlogDb } from '../server/blog-db.js'
import { createBlogApp } from '../server/blog-app.js'
import { createAccessToken } from '../server/services/auth.js'
import { validateArticleInput } from '../server/services/articleInput.js'
const lesson = Number(process.argv[2]), stage = Number(process.argv[3])
assert.ok([8, 9].includes(lesson) && Number.isInteger(stage) && stage >= 0 && stage <= (lesson === 8 ? 5 : 4), '用法：node scripts/check-p2-stage.mjs 08 0..5 或 09 0..4')
// --file 明确选择 .env 指向的已有文件库；外层保存点撤销全部试写，不留下测试数据。
const fileMode = process.argv.includes('--file')
let db
if (fileMode) {
  assert.ok(stage >= 1, '文件库检查从完成 TODO01 开始；起点对照只用内存库')
  assert.notEqual(process.env.DATABASE_PATH, ':memory:')
  const filename = resolve(process.env.DATABASE_PATH || './var/blog.sqlite')
  console.log('当前文件库：' + filename)
  assert.ok(existsSync(filename), '文件库不存在：先启动本课后端建库；检查不会偷偷创建空库')
  const database = new DatabaseSync(filename)
  database.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; SAVEPOINT course_file_check')
  db = {
    query: async (sql, values = []) => database.prepare(sql.replace(/\$\d+/g, '?')).all(...values),
    close: () => { try { database.exec('ROLLBACK TO course_file_check; RELEASE course_file_check') } finally { database.close() } },
  }
} else db = await openBlogDb({ DATABASE_PATH: ':memory:' })
const secret = 'isolated-course-stage-test-secret-only'
let server
try {
  // 测试准备直接写入最小数据，避免依赖后面尚未完成的新增接口。
  const insert = (slug, status = 'draft', title = '测试文章') => db.query(
    'INSERT INTO articles(slug,title,summary,content_json,tags_json,status,author,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [slug, title, '测试摘要', '[]', '[]', status, '检查', '2026-10-05'],
  )
  const prefix = 'stage-' + Date.now()
  const [draft] = await insert(prefix + '-draft')
  const [published] = await insert(prefix + '-published', 'published')
  const [reader] = await db.query("INSERT INTO users(username,display_name,password_salt,password_hash) VALUES($1,'检查','salt','hash') RETURNING *", ['stage_' + Date.now()])
  const token = createAccessToken({ id: reader.id, role: 'admin', username: reader.username }, secret)
  server = createBlogApp(db, secret).listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
  const request = async (route, method = 'GET', body, signed = false) => {
    const response = await fetch('http://127.0.0.1:' + server.address().port + route, {
      method, headers: { 'Content-Type': 'application/json', ...(signed ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const text = await response.text()
    return { status: response.status, body: text && response.headers.get('content-type')?.includes('json') ? JSON.parse(text) : text }
  }
  if (lesson === 8) {
    await db.query('SAVEPOINT constraints_test')
    try {
      if (stage >= 1) {
        await assert.rejects(() => insert(draft.slug), /UNIQUE/)
        await assert.rejects(() => insert('bad-status', 'unknown'), /CHECK/)
        await assert.rejects(() => insert('null-title', 'draft', null), /NOT NULL/)
      } else {
        await insert(draft.slug); await insert('bad-status', 'unknown'); await insert('null-title', 'draft', null)
      }
    } finally { await db.query('ROLLBACK TO constraints_test'); await db.query('RELEASE constraints_test') }
    const publicList = await request('/api/articles')
    assert.equal(publicList.status, 200)
    assert.equal(publicList.body.data.some(a => a.id === draft.id), stage < 2, '游客草稿可见性与阶段不符')
    assert.ok((await request('/api/articles', 'GET', undefined, true)).body.data.some(a => a.id === draft.id))
    const valid = { slug: prefix + '-api', title: '正常标题', summary: '正常摘要', content: ['正文'], status: 'draft' }
    const errors = validateArticleInput({ ...valid, title: '', summary: '' })
    assert.equal(Boolean(errors.title && errors.summary), stage >= 3)
    if (stage >= 3) {
      const tooLong = validateArticleInput({ ...valid, title: '字'.repeat(61), summary: '字'.repeat(161) })
      assert.ok(tooLong.title && tooLong.summary)
      assert.equal((await request('/api/articles', 'POST', { ...valid, title: '' }, true)).status, 400)
    }
    const created = await request('/api/articles', 'POST', valid, true)
    assert.equal(created.status, stage >= 4 ? 201 : 500, 'TODO04 前 SELECT 1 不是成功写入')
    if (stage >= 4) {
      const id = created.body.data.id
      assert.equal((await db.query('SELECT title FROM articles WHERE id=$1', [id]))[0].title, valid.title)
      assert.equal((await request('/api/articles/' + id, 'PUT', { ...valid, title: '修改成功' }, true)).status, 200)
      assert.equal((await db.query('SELECT title FROM articles WHERE id=$1', [id]))[0].title, '修改成功')
      assert.equal((await request('/api/articles/' + id, 'DELETE', undefined, true)).status, 204)
      assert.equal((await db.query('SELECT id FROM articles WHERE id=$1', [id])).length, 0)
    }
    assert.equal((await request('/api/articles/99999999', 'DELETE', undefined, true)).status, stage >= 5 ? 404 : 204)
  } else {
    const comment = (articleId, userId, body) => db.query('INSERT INTO comments(article_id,user_id,body) VALUES($1,$2,$3)', [articleId, userId, body])
    await db.query('SAVEPOINT constraints_test')
    try {
      if (stage >= 1) {
        await assert.rejects(() => comment(99999999, reader.id, '测试'), /FOREIGN KEY/)
        await assert.rejects(() => comment(published.id, 99999999, '测试'), /FOREIGN KEY/)
        await assert.rejects(() => comment(published.id, reader.id, ''), /CHECK/)
        await assert.rejects(() => comment(published.id, reader.id, '字'.repeat(1001)), /CHECK/)
        await comment(draft.id, reader.id, '级联删除测试')
        await db.query('DELETE FROM articles WHERE id=$1', [draft.id])
        assert.equal((await db.query('SELECT id FROM comments WHERE article_id=$1', [draft.id])).length, 0)
      } else { await comment(99999999, 99999999, '') }
    } finally { await db.query('ROLLBACK TO constraints_test'); await db.query('RELEASE constraints_test') }
    assert.equal((await request('/api/articles/' + draft.id + '/comments')).status, stage >= 2 ? 404 : 200)
    assert.equal((await request('/api/articles/99999999/comments')).status, stage >= 2 ? 404 : 200)
    const url = '/api/articles/' + published.id + '/comments'
    for (const body of ['', '  ', 123, '字'.repeat(1001)]) {
      assert.equal((await request(url, 'POST', { body }, true)).status, stage >= 3 ? 400 : 201)
    }
    const created = await request(url, 'POST', { body: '实际写入验证' }, true)
    assert.equal(created.status, 201)
    const saved = await db.query('SELECT * FROM comments WHERE body=$1', ['实际写入验证'])
    assert.equal(saved.length, stage >= 4 ? 1 : 0, '201 和假 id 不能证明已入库')
    if (stage >= 4) {
      assert.equal(saved[0].user_id, reader.id)
      assert.ok((await request(url)).body.data.some(c => c.id === saved[0].id))
    }
  }
  console.log(`[PASS] 第${lesson}课阶段${stage}：当前及前置任务符合预期；${fileMode ? '当前文件库，退出前撤销全部测试写入' : '独立内存库，未修改个人数据'}。`)
} finally {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
  await db.close()
}
