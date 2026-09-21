import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { backupDatabase, migrateDatabase, openDatabase, restoreDatabase, seedDatabase } from '../server/database.js'
import { createSqliteArticleRepository } from '../server/repositories/sqliteArticleRepository.js'

function createFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'ffd-p2-sqlite-'))
  const path = join(directory, 'blog.sqlite')
  const database = openDatabase(path)
  migrateDatabase(database)
  seedDatabase(database)
  return { directory, path, database, repository: createSqliteArticleRepository(database) }
}

function removeFixture(directory) {
  const resolved = join(tmpdir(), directory.slice(tmpdir().length))
  assert.ok(resolved.startsWith(join(tmpdir(), 'ffd-p2-sqlite-')))
  rmSync(resolved, { recursive: true, force: true })
}

test('迁移可重复执行，且包含三张业务表', () => {
  const fixture = createFixture()
  try {
    assert.deepEqual(migrateDatabase(fixture.database), [])
    const tables = fixture.database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users','articles','comments') ORDER BY name").all().map((row) => row.name)
    assert.deepEqual(tables, ['articles', 'comments', 'users'])
  } finally { fixture.database.close(); removeFixture(fixture.directory) }
})

test('SQLite 仓储支持筛选、搜索和分页', () => {
  const fixture = createFixture()
  try {
    const firstPage = fixture.repository.list({ status: 'published', page: 1, pageSize: 1 })
    assert.equal(firstPage.total, 2)
    assert.equal(firstPage.items.length, 1)
    assert.equal(fixture.repository.list({ query: 'CI/CD' }).total, 1)
  } finally { fixture.database.close(); removeFixture(fixture.directory) }
})

test('文章写入后关闭并重开数据库仍然存在', () => {
  const fixture = createFixture()
  const created = fixture.repository.create({ slug: 'persistent', title: '持久化文章', summary: '重启后仍存在', content: ['正文'], tags: ['SQLite'], status: 'draft', author: '林晓', publishedAt: '2026-09-04' })
  fixture.database.close()
  const reopened = openDatabase(fixture.path)
  try {
    assert.equal(createSqliteArticleRepository(reopened).find(created.id).title, '持久化文章')
  } finally { reopened.close(); removeFixture(fixture.directory) }
})

test('外键级联删除评论', () => {
  const fixture = createFixture()
  try {
    fixture.database.prepare("INSERT INTO comments(article_id, author_name, body) VALUES (1, '访客', '很有帮助')").run()
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM comments').get().count, 1)
    fixture.repository.remove(1)
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM comments').get().count, 0)
  } finally { fixture.database.close(); removeFixture(fixture.directory) }
})

test('备份通过完整性检查并可恢复', async () => {
  const fixture = createFixture()
  const backupPath = join(fixture.directory, 'backup.sqlite')
  const restoredPath = join(fixture.directory, 'restored.sqlite')
  try {
    await backupDatabase(fixture.database, backupPath)
    restoreDatabase(backupPath, restoredPath)
    const restored = openDatabase(restoredPath)
    try { assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check, 'ok') }
    finally { restored.close() }
  } finally { fixture.database.close(); removeFixture(fixture.directory) }
})
