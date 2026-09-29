import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
const path=process.env.DATABASE_PATH||'./var/blog.sqlite'
if(!existsSync(path))throw new Error('先启动 npm run start:api，首次启动自动建库。')
const db=new DatabaseSync(path,{readOnly:true})
console.log('真实数据库文件：',path)
console.table(db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('users','articles','comments')").all())
for(const table of ['users','articles','comments'])console.log(table,db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total)
console.table(db.prepare('SELECT c.id,a.title,u.display_name,c.body FROM comments c JOIN articles a ON a.id=c.article_id JOIN users u ON u.id=c.user_id ORDER BY c.id DESC LIMIT 10').all())
db.close()
