import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { seedArticles } from './data/seedArticles.js'

const migrationsDirectory = fileURLToPath(new URL('../database/migrations', import.meta.url))

export function ensureDatabaseDirectory(databasePath) {
  if (databasePath === ':memory:') return
  mkdirSync(dirname(resolve(databasePath)), { recursive: true })
}

export function openDatabase(databasePath = ':memory:') {
  const database = new DatabaseSync(databasePath)
  database.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;')
  return database
}

export function migrateDatabase(database, directory = migrationsDirectory) {
  database.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
  const applied = database.prepare('SELECT version FROM schema_migrations').all().map((row) => row.version)
  const markApplied = database.prepare('INSERT INTO schema_migrations(version) VALUES (?)')
  const migrations = existsSync(directory) ? readdirSync(directory).filter((name) => name.endsWith('.sql')).sort() : []
  for (const migration of migrations) {
    if (applied.includes(migration)) continue
    database.exec('BEGIN IMMEDIATE')
    try {
      database.exec(readFileSync(resolve(directory, migration), 'utf8'))
      markApplied.run(migration)
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
  }
  return migrations.filter((migration) => !applied.includes(migration))
}

export function seedDatabase(database) {
  database.prepare('INSERT OR IGNORE INTO users(username, display_name) VALUES (?, ?)').run('linxiao', '林晓')
  const insert = database.prepare(`INSERT OR IGNORE INTO articles
    (id, slug, title, summary, content_json, tags_json, status, author, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const article of seedArticles) {
    insert.run(article.id, article.slug, article.title, article.summary, JSON.stringify(article.content), JSON.stringify(article.tags), article.status, article.author, article.publishedAt)
  }
  return database.prepare('SELECT COUNT(*) AS count FROM articles').get().count
}

export async function backupDatabase(database, destination) {
  ensureDatabaseDirectory(destination)
  await backup(database, destination)
  return resolve(destination)
}

export function restoreDatabase(source, destination) {
  if (!existsSync(source)) throw new Error(`backup not found: ${source}`)
  const candidate = new DatabaseSync(source, { readOnly: true })
  try {
    const result = candidate.prepare('PRAGMA quick_check').get()
    if (result.quick_check !== 'ok') throw new Error(`backup integrity check failed: ${result.quick_check}`)
  } finally {
    candidate.close()
  }
  ensureDatabaseDirectory(destination)
  copyFileSync(source, destination)
  return resolve(destination)
}
