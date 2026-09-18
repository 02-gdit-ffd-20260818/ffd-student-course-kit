import assert from 'node:assert/strict'
import test from 'node:test'
import { createSqliteMemberRepository, migrateSqlite, openSqlite } from '../server/sqliteDatabase.js'

test('SQLite 真实迁移、审核与事务回滚', () => {
  const db = openSqlite(':memory:')
  try {
    assert.deepEqual(migrateSqlite(db), ['001_initial.sql'])
    assert.equal(db.prepare("SELECT COUNT(*) count FROM sqlite_master WHERE type='table' AND name IN ('users','members','schema_migrations')").get().count, 3)
    const repository = createSqliteMemberRepository(db)
    const first = repository.create({ name:'数据库成员',role:'后端开发',cohort:'',location:'',bio:'',skills:['SQLite'],interests:[],avatar:'',email:'sqlite@example.com',status:'submitted',ownerId:null })
    assert.equal(first.status, 'submitted')
    assert.equal(repository.listPublic().length, 0)
    repository.transition(first.id, 'approved', { reviewerId: null, note: '通过' })
    assert.equal(repository.listPublic().length, 1)
    const before = repository.listAll().length
    assert.throws(() => repository.importBatch([
      { name:'重复记录',role:'前端开发',cohort:'',location:'',bio:'',skills:[],interests:[],avatar:'',email:'sqlite@example.com' },
      { name:'不应写入',role:'前端开发',cohort:'',location:'',bio:'',skills:[],interests:[],avatar:'',email:'new@example.com' },
    ], null), (error) => error.code === 'DUPLICATE_EMAIL')
    assert.equal(repository.listAll().length, before)
    assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1)
  } finally { db.close() }
})
