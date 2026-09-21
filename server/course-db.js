import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { seedArticles } from './data/seedArticles.js'
import { hashPassword } from './services/auth.js'

// 项目二统一使用 SQLite。三张表分别保存用户、文章和评论；
// media_json 是文章表中的 JSON 文本，保存图片、音频和视频的地址与说明。
const schema = [
  `CREATE TABLE IF NOT EXISTS course_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'reader' CHECK(role IN ('reader','admin')), password_salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS course_articles (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, summary TEXT NOT NULL, content_json TEXT NOT NULL, tags_json TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published')), author TEXT NOT NULL, published_at TEXT NOT NULL, media_json TEXT NOT NULL DEFAULT '[]')`,
  `CREATE TABLE IF NOT EXISTS course_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, article_id INTEGER NOT NULL REFERENCES course_articles(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES course_users(id), body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 1000), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  'CREATE INDEX IF NOT EXISTS course_comments_article ON course_comments(article_id,id)',
]

export async function openCourseDb(env = process.env) {
  const { DatabaseSync } = await import('node:sqlite')
  const databasePath = env.DATABASE_PATH || './var/course-blog.sqlite'
  if (databasePath !== ':memory:') mkdirSync(dirname(resolve(databasePath)), { recursive: true })
  const database = new DatabaseSync(databasePath)
  database.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000')
  const query = async (sql, params = []) => database.prepare(sql.replace(/\$\d+/g, '?')).all(...params)
  for (const sql of schema) await query(sql)

  // 兼容较早课堂生成的数据库：旧表没有 media_json 时自动补列。
  const columns = await query('PRAGMA table_info(course_articles)')
  if (!columns.some(column => column.name === 'media_json')) await query("ALTER TABLE course_articles ADD COLUMN media_json TEXT NOT NULL DEFAULT '[]'")

  for (const article of seedArticles) {
    await query('INSERT INTO course_articles(slug,title,summary,content_json,tags_json,status,author,published_at,media_json) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING', [article.slug, article.title, article.summary, JSON.stringify(article.content), JSON.stringify(article.tags), article.status, article.author, article.publishedAt, JSON.stringify(article.media || [])])
  }
  if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const { salt, hash } = hashPassword(env.ADMIN_PASSWORD)
    await query("INSERT INTO course_users(username,display_name,role,password_salt,password_hash) VALUES($1,$2,'admin',$3,$4) ON CONFLICT(username) DO NOTHING", [env.ADMIN_USERNAME, '课程教师', salt, hash])
  }
  return { query, close: () => database.close(), driver: 'SQLite', sourcePath: databasePath === ':memory:' ? null : resolve(databasePath) }
}