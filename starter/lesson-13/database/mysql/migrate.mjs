import { migrateMysql, openMysqlPool } from '../../server/mysqlDatabase.js'
const pool=openMysqlPool();try{console.log(`MySQL 迁移完成：${(await migrateMysql(pool)).join(', ')||'无需变更'}`)}finally{await pool.end()}
