import { migrateSqlite, openSqlite } from '../server/sqliteDatabase.js'
const db=openSqlite(process.env.DATABASE_PATH||'./var/p3-community.sqlite');try{console.log(`SQLite 迁移完成：${migrateSqlite(db).join(', ')||'无需变更'}`)}finally{db.close()}
