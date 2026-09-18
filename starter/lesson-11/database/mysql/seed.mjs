import { openMysqlPool, seedMysql, seedMysqlAdmin } from '../../server/mysqlDatabase.js'
import { createMysqlUserRepository } from '../../server/repositories/mysqlUserRepository.js'

const pool = openMysqlPool()
try {
  console.log(`MySQL 种子数据就绪，文章总数：${await seedMysql(pool)}`)
  await seedMysqlAdmin(createMysqlUserRepository(pool), { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD })
} finally { await pool.end() }
