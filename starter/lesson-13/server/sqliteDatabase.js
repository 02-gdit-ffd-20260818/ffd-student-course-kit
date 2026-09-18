import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { createSqliteUserRepository } from './userRepository.js'
import { hashPassword } from './auth.js'
import { seedMemberRecords } from './seedMembers.js'

const migrationsDirectory = fileURLToPath(new URL('../database/migrations', import.meta.url))
const map = (row) => row && ({ id: row.id, name: row.name, role: row.role_title, cohort: row.cohort, location: row.location, bio: row.bio, skills: JSON.parse(row.skills_json), interests: JSON.parse(row.interests_json), avatar: row.avatar, email: row.email, status: row.status, ownerId: row.owner_id, reviewedBy: row.reviewed_by, reviewNote: row.review_note, version: row.version })

export function openSqlite(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;')
  return db
}
export function migrateSqlite(db) {
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)')
  const applied = new Set(db.prepare('SELECT version FROM schema_migrations').all().map((row) => row.version))
  const files = existsSync(migrationsDirectory) ? readdirSync(migrationsDirectory).filter((name) => name.endsWith('.sql')).sort() : []
  for (const file of files) if (!applied.has(file)) { db.exec('BEGIN IMMEDIATE'); try { db.exec(readFileSync(resolve(migrationsDirectory, file), 'utf8')); db.prepare('INSERT INTO schema_migrations(version) VALUES (?)').run(file); db.exec('COMMIT') } catch (error) { db.exec('ROLLBACK'); throw error } }
  return files.filter((file) => !applied.has(file))
}
export function createSqliteMemberRepository(db) {
  const select = 'SELECT id,name,role_title,cohort,location,bio,skills_json,interests_json,avatar,email,status,owner_id,reviewed_by,review_note,version FROM members'
  return {
    listPublic() { return db.prepare(`${select} WHERE status='approved' ORDER BY id`).all().map(map) },
    listAll() { return db.prepare(`${select} ORDER BY id`).all().map(map) },
    find(id) { return map(db.prepare(`${select} WHERE id=?`).get(id)) ?? null },
    create(item) { const result = db.prepare(`INSERT INTO members(name,role_title,cohort,location,bio,skills_json,interests_json,avatar,email,status,owner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(item.name,item.role,item.cohort,item.location,item.bio,JSON.stringify(item.skills),JSON.stringify(item.interests),item.avatar,item.email,item.status,item.ownerId); return this.find(result.lastInsertRowid) },
    transition(id,status,{reviewerId,note}) { db.prepare('UPDATE members SET status=?,reviewed_by=?,review_note=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status,reviewerId,note,id); return this.find(id) },
    importBatch(rows, ownerId) { db.exec('BEGIN IMMEDIATE'); try { const created=rows.map((row)=>this.create({...row,status:'submitted',ownerId})); db.exec('COMMIT'); return created } catch(error){ db.exec('ROLLBACK'); if(String(error.message).includes('UNIQUE')) error.code='DUPLICATE_EMAIL'; throw error } },
  }
}
export function seedSqliteUsers(db, env = process.env) {
  const repo = createSqliteUserRepository(db)
  const seeds = [{ username: env.MEMBER_USERNAME, password: env.MEMBER_PASSWORD, displayName: '学生成员', role: 'member' }, { username: env.REVIEWER_USERNAME, password: env.REVIEWER_PASSWORD, displayName: '课程审核员', role: 'reviewer' }]
  for (const item of seeds) if (item.username && item.password) { const { salt, hash } = hashPassword(item.password); repo.upsert({ ...item, passwordSalt: salt, passwordHash: hash }) }
  return repo
}
export function seedSqliteMembers(db) {
  const repository = createSqliteMemberRepository(db)
  const existing = new Set(repository.listAll().map((item) => item.email))
  for (const item of seedMemberRecords) if (!existing.has(item.email)) repository.create(item)
  return repository.listAll().length
}
