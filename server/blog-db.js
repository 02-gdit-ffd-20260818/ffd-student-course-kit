import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { seedArticles } from './data/seedArticles.js'
import { hashPassword } from './services/auth.js'

// 项目二统一使用 SQLite。三张表分别保存用户、文章和评论；
// media_json 是文章表中的 JSON 文本，保存图片、音频和视频的地址与说明。
const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    display_name  TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'reader' CHECK(role IN ('reader','admin')),
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    summary      TEXT NOT NULL,
    content_json TEXT NOT NULL,
    tags_json    TEXT NOT NULL,
    status       TEXT NOT NULL CHECK(status IN ('draft','published')),
    author       TEXT NOT NULL,
    published_at TEXT NOT NULL,
    media_json   TEXT NOT NULL DEFAULT '[]'
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    -- ============ 第09课 TODO 01（极简单）：评论表和它的两个外键 ============
    -- 【参数拆解】CHECK(条件) 要求每一行满足条件；NOT NULL 禁止空值，UNIQUE 禁止重复。DEFAULT 只在未提供该列值时使用默认值，不会把显式传入的 NULL 自动修正。
    -- 【参数拆解】REFERENCES 表名(列名) 指明外键对应哪张表哪一列；ON DELETE CASCADE 表示删除被引用的父记录时一并删除子记录，不是删除整张子表。
    -- 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
    -- 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
    -- 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
    -- 现在 article_id 和 user_id 只是两个普通数字，
    -- 可以指向根本不存在的文章和用户——数据库里会留下一堆"孤儿评论"。
    --
    -- 页面上看得到的结果：做完之后（配合 已写好的代码），
    -- **删掉一篇文章，它下面的评论会跟着一起消失**，不会变成找不到归属的垃圾数据。
    --
    -- 本任务要补全：按手册补全三列：
    --   article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE
    --              外键指向 articles.id；ON DELETE CASCADE 表示
    --              **文章被删时，它的评论一起删掉**
    --   user_id    INTEGER NOT NULL REFERENCES users(id)
    --              评论必须属于一个真实存在的用户（用户表这里不级联删，
    --              因为删用户是大事，要人工确认）
    --   body       TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 1000)
    --              空评论和超长评论都由数据库挡掉
    --
    -- 怎么亲眼看到：npm run db:inspect 的建表语句里有 REFERENCES 和 CASCADE。
    -- ======================================================
    article_id INTEGER,
    user_id    INTEGER,
    body       TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  'CREATE INDEX IF NOT EXISTS comments_article ON comments(article_id,id)',
]

export async function openBlogDb(env = process.env) {
  const { DatabaseSync } = await import('node:sqlite')
  const databasePath = env.DATABASE_PATH || './var/blog.sqlite'
  if (databasePath !== ':memory:') mkdirSync(dirname(resolve(databasePath)), { recursive: true })
  // SQLite 把完整数据库保存在一个文件中；部署时由 DATABASE_PATH 指向持久化目录。
  const database = new DatabaseSync(databasePath)
  // foreign_keys 启用外键；WAL 改善读写并发；busy_timeout 给短暂锁等待时间。
  database.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000')
  // 业务代码统一写 $1、$2 占位符；这里转换为 SQLite 接受的 ? 并绑定参数。
  const query = async (sql, params = []) =>
    database.prepare(sql.replace(/\$\d+/g, '?')).all(...params)
  for (const sql of schema) await query(sql)

  // 兼容较早版本生成的数据库：旧表没有 media_json 时自动补列。
  const columns = await query('PRAGMA table_info(articles)')
  if (!columns.some(column => column.name === 'media_json'))
    await query("ALTER TABLE articles ADD COLUMN media_json TEXT NOT NULL DEFAULT '[]'")

  for (const article of seedArticles) {
    await query(
      'INSERT INTO articles(slug,title,summary,content_json,tags_json,status,author,published_at,media_json) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug=$10)',
      [
        article.slug,
        article.title,
        article.summary,
        JSON.stringify(article.content),
        JSON.stringify(article.tags),
        article.status,
        article.author,
        article.publishedAt,
        JSON.stringify(article.media || []),
        article.slug,
      ],
    )
  }
  if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const { salt, hash } = hashPassword(env.ADMIN_PASSWORD)
    await query(
      "INSERT INTO users(username,display_name,role,password_salt,password_hash) SELECT $1,$2,'admin',$3,$4 WHERE NOT EXISTS (SELECT 1 FROM users WHERE username=$5)",
      [env.ADMIN_USERNAME, '系统管理员', salt, hash, env.ADMIN_USERNAME],
    )
  }
  return {
    query,
    close: () => database.close(),
    driver: 'SQLite',
    sourcePath: databasePath === ':memory:' ? null : resolve(databasePath),
  }
}
