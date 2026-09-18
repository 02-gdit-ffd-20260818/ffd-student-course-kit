import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { seedArticles } from './data/seedArticles.js'
import { hashPassword } from './services/auth.js'

const migrationsDirectory = fileURLToPath(new URL('../database/mysql/migrations', import.meta.url))

export function mysqlConfig(env = process.env) {
  const required = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD']
  for (const name of required) if (!env[name]) throw new Error(`Missing environment variable: ${name}`)
  return { host: env.MYSQL_HOST, port: Number(env.MYSQL_PORT) || 3306, database: env.MYSQL_DATABASE, user: env.MYSQL_USER, password: env.MYSQL_PASSWORD, charset: 'utf8mb4', connectionLimit: 5, multipleStatements: true, timezone: 'Z', dateStrings: true }
}

export function openMysqlPool(env = process.env) {
  return mysql.createPool(mysqlConfig(env))
}

export async function migrateMysql(pool, directory = migrationsDirectory) {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`)
  const [rows] = await pool.query('SELECT version FROM schema_migrations')
  const applied = new Set(rows.map((row) => row.version))
  const migrations = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()
  const completed = []
  for (const migration of migrations) {
    if (applied.has(migration)) continue
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      await connection.query(await readFile(new URL(`../database/mysql/migrations/${migration}`, import.meta.url), 'utf8'))
      await connection.execute('INSERT INTO schema_migrations(version) VALUES (?)', [migration])
      await connection.commit()
      completed.push(migration)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally { connection.release() }
  }
  return completed
}

export async function seedMysql(pool) {
  for (const article of seedArticles) {
    await pool.execute(`INSERT IGNORE INTO articles
      (id, slug, title, summary, content_json, tags_json, status, author, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [article.id, article.slug, article.title, article.summary, JSON.stringify(article.content), JSON.stringify(article.tags), article.status, article.author, article.publishedAt])
  }
  const [[row]] = await pool.query('SELECT COUNT(*) AS count FROM articles')
  return Number(row.count)
}

export async function seedMysqlAdmin(userRepository, { username, password, displayName = '课程管理员' }) {
  if (!username || !password) return null
  const { salt, hash } = hashPassword(password)
  return userRepository.upsert({ username, displayName, role: 'admin', passwordSalt: salt, passwordHash: hash })
}
