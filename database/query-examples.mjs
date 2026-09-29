import { openDatabase } from '../server/database.js'
const db = openDatabase(process.env.DATABASE_PATH || './var/p2-blog.sqlite')
try {
  // 任务A：筛选已发布文章。
  const published = db.prepare("SELECT id, title, status FROM articles WHERE status = 'published' ORDER BY id").all()
  // 任务B：按状态统计文章数。
  const counts = db.prepare("SELECT status, COUNT(*) AS count FROM articles GROUP BY status").all()
  console.log(JSON.stringify({ published, counts }, null, 2))
} finally { db.close() }
