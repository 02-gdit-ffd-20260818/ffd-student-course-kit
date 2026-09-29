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
    -- ============ TODO 01（极简单）：给文章表加上约束 ============
    -- 现在这张表没有唯一 slug，也不限制状态，草稿和已发布分不清。
    --
    -- 页面上看得到的结果：做完之后，两篇文章用同一个链接名会被拒绝；
    -- status 只能是 draft 或 published 两种，写错了数据库直接不收。
    --
    -- TODO：按手册补全九列：
    --   slug         TEXT NOT NULL UNIQUE                文章地址不能重复
    --   title/summary/content_json/tags_json  TEXT NOT NULL
    --   status       TEXT NOT NULL
    --                CHECK(status IN ('draft','published'))
    --   author/published_at  TEXT NOT NULL
    --   media_json   TEXT NOT NULL DEFAULT '[]'          默认空数组，不是 NULL
    --
    -- 想一想：为什么正文用 JSON 文本存在一列里，而不是再建一张"段落表"？
    -- 因为正文永远是整篇一起读、整篇一起改，从来不需要"查出第 3 段"。
    -- **按使用方式设计表结构**，不是越拆越对。
    --
    -- 怎么亲眼看到：npm run db:inspect 的建表语句里能看到 UNIQUE 和 CHECK。
    -- 改了建表语句记得删掉 var/blog.sqlite 重启后端，否则不生效。
    -- ==================================================
    slug         TEXT,
    title        TEXT,
    summary      TEXT,
    content_json TEXT,
    tags_json    TEXT,
    status       TEXT,
    author       TEXT,
    published_at TEXT,
    media_json   TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    -- ============ TODO 01（极简单）：评论表和它的两个外键 ============
    -- 现在 article_id 和 user_id 只是两个普通数字，
    -- 可以指向根本不存在的文章和用户——数据库里会留下一堆"孤儿评论"。
    --
    -- 页面上看得到的结果：做完之后（配合 已写好的代码），
    -- **删掉一篇文章，它下面的评论会跟着一起消失**，不会变成找不到归属的垃圾数据。
    --
    -- TODO：按手册补全三列：
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
      'INSERT INTO articles(slug,title,summary,content_json,tags_json,status,author,published_at,media_json) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING',
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
      ],
    )
  }
  if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const { salt, hash } = hashPassword(env.ADMIN_PASSWORD)
    await query(
      "INSERT INTO users(username,display_name,role,password_salt,password_hash) VALUES($1,$2,'admin',$3,$4) ON CONFLICT(username) DO NOTHING",
      [env.ADMIN_USERNAME, '系统管理员', salt, hash],
    )
  }
  return {
    query,
    close: () => database.close(),
    driver: 'SQLite',
    sourcePath: databasePath === ':memory:' ? null : resolve(databasePath),
  }
}
