import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { seedArticles } from './data/seedArticles.js'
import { hashPassword } from './services/auth.js'

// 同一组参数化 SQL；课堂 SQLite，在线 PostgreSQL。数据库密码只放服务端。
export async function openCourseDb(env = process.env) {
  let query, close, driver
  if (env.DB_DRIVER === 'postgres') {
    const { getDatabase } = await import('@netlify/database')
    const db = getDatabase(env.DATABASE_URL ? { connectionString: env.DATABASE_URL } : {})
    query = (sql, params = []) => db.sql.unsafe(sql, params)
    close = () => db.pool.end(); driver = 'PostgreSQL'
  } else {
    const { DatabaseSync } = await import('node:sqlite')
    const path = env.DATABASE_PATH || './var/course-blog.sqlite'
    if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true })
    const db = new DatabaseSync(path)
    db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000')
    query = async (sql, params = []) => db.prepare(sql.replace(/\$\d+/g, '?')).all(...params)
    close = () => db.close(); driver = 'SQLite'
  }
  const id = driver === 'SQLite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'SERIAL PRIMARY KEY'
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS course_users (id ${id}, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'reader' CHECK(role IN ('reader','admin')), password_salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS course_articles (id ${id}, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, summary TEXT NOT NULL, content_json TEXT NOT NULL, tags_json TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published')), author TEXT NOT NULL, published_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS course_comments (id ${id}, article_id INTEGER NOT NULL REFERENCES course_articles(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES course_users(id), body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 1000), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    'CREATE INDEX IF NOT EXISTS course_comments_article ON course_comments(article_id,id)',
  ]) await query(sql)
  // 升级已有数据库保留用户和评论，不通过删除数据库升级。
  if(driver==='SQLite'){
    const columns=await query('PRAGMA table_info(course_articles)')
    if(!columns.some(c=>c.name==='media_json'))await query("ALTER TABLE course_articles ADD COLUMN media_json TEXT NOT NULL DEFAULT '[]'")
  } else await query("ALTER TABLE course_articles ADD COLUMN IF NOT EXISTS media_json TEXT NOT NULL DEFAULT '[]'")
  for (const a of seedArticles) await query('INSERT INTO course_articles(slug,title,summary,content_json,tags_json,status,author,published_at,media_json) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING', [a.slug,a.title,a.summary,JSON.stringify(a.content),JSON.stringify(a.tags),a.status,a.author,a.publishedAt,JSON.stringify(a.media||[])])
  if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const { salt, hash } = hashPassword(env.ADMIN_PASSWORD)
    await query("INSERT INTO course_users(username,display_name,role,password_salt,password_hash) VALUES($1,$2,'admin',$3,$4) ON CONFLICT(username) DO NOTHING", [env.ADMIN_USERNAME,'课程教师',salt,hash])
  }
  return { query, close, driver, sourcePath: driver==='SQLite'?resolve(env.DATABASE_PATH||'./var/course-blog.sqlite'):null }
}
