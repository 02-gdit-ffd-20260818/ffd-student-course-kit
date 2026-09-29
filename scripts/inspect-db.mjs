import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { basename } from 'node:path'

const path = process.env.DATABASE_PATH || './var/blog.sqlite'
if (!existsSync(path)) throw new Error('数据库还不存在。请先运行 npm run dev:api，看到 API listening 后再检查。')

const db = new DatabaseSync(path, { readOnly: true })
const lessonMatch = basename(process.cwd()).match(/lesson-(\d+)/)
const lesson = lessonMatch ? Number(lessonMatch[1]) : 99
const schema = Object.fromEntries(
  db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('users','articles','comments')")
    .all()
    .map((row) => [row.name, row.sql.replace(/--.*$/gm, '')])
)

function hasUniqueIndex(table, column) {
  return db.prepare(`PRAGMA index_list(${table})`).all().some((index) => {
    if (!index.unique) return false
    return db.prepare(`PRAGMA index_info(${JSON.stringify(index.name)})`).all()
      .some((item) => item.name === column)
  })
}

function showCheck(label, passed, requiredLesson) {
  const required = lesson >= requiredLesson
  const state = passed ? 'PASS' : required ? '未完成' : `后续第 ${requiredLesson} 课完成`
  console.log(`[${state}] ${label}`)
  return passed || !required
}

console.log(`\n数据库：${path}`)
console.log(`当前阶段：${lesson === 99 ? '工程基线' : `第 ${lesson} 课`}`)
console.log('\n一、表结构检查（检查真实结构，不读取 TODO 注释）')
const results = [
  showCheck('users.username 不可重复（UNIQUE）', hasUniqueIndex('users', 'username'), 7),
  showCheck('users.role 只能是 reader/admin（CHECK）', /CHECK\s*\(\s*role\s+IN/i.test(schema.users || ''), 7),
  showCheck('articles.slug 不可重复（UNIQUE）', hasUniqueIndex('articles', 'slug'), 8),
  showCheck('articles.status 只能是 draft/published（CHECK）', /CHECK\s*\(\s*status\s+IN/i.test(schema.articles || ''), 8),
  showCheck('comments 关联文章和用户（REFERENCES）', /REFERENCES\s+articles/i.test(schema.comments || '') && /REFERENCES\s+users/i.test(schema.comments || ''), 9),
  showCheck('删除文章时级联删除评论（ON DELETE CASCADE）', /ON\s+DELETE\s+CASCADE/i.test(schema.comments || ''), 9),
  showCheck('评论长度为 1—1000 字（CHECK）', /CHECK\s*\(\s*length\s*\(\s*body\s*\)/i.test(schema.comments || ''), 9)
]

console.log('\n二、当前数据（这些数字不是报错）')
const descriptions = {
  users: '注册用户；0 表示还没有注册',
  articles: '示例和自建文章；首次启动通常有 7 篇',
  comments: '用户评论；0 表示还没有发表评论'
}
for (const table of ['users', 'articles', 'comments']) {
  const total = db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total
  console.log(`- ${table}: ${total}（${descriptions[table]}）`)
}

console.log('\n三、最近评论')
const comments = db.prepare('SELECT c.id,a.title,u.display_name,c.body FROM comments c JOIN articles a ON a.id=c.article_id JOIN users u ON u.id=c.user_id ORDER BY c.id DESC LIMIT 10').all()
if (comments.length) console.table(comments)
else console.log('- 暂无评论，这是正常状态；注册、登录并发表评论后这里才会出现记录。')

console.log(results.every(Boolean) ? '\n结论：本课要求的数据库结构已通过。' : '\n结论：还有“未完成”项，请只修改本课手册指定的位置，然后删库、重启后再检查。')
db.close()
