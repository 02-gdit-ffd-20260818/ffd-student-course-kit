import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { hashPassword } from './auth.js'
import { createMysqlUserRepository } from './userRepository.js'
import { seedMemberRecords } from './seedMembers.js'

const migrationsDirectory = fileURLToPath(new URL('../database/mysql/migrations', import.meta.url))
const map = (row) => row && ({ id: Number(row.id), name: row.name, role: row.role_title, cohort: row.cohort, location: row.location, bio: row.bio, skills: typeof row.skills_json === 'string' ? JSON.parse(row.skills_json) : row.skills_json, interests: typeof row.interests_json === 'string' ? JSON.parse(row.interests_json) : row.interests_json, avatar: row.avatar, email: row.email, status: row.status, ownerId: row.owner_id && Number(row.owner_id), reviewedBy: row.reviewed_by && Number(row.reviewed_by), reviewNote: row.review_note, version: row.version })
const select = 'SELECT id,name,role_title,cohort,location,bio,skills_json,interests_json,avatar,email,status,owner_id,reviewed_by,review_note,version FROM members'

export function mysqlConfig(env = process.env) {
  for (const name of ['MYSQL_HOST','MYSQL_DATABASE','MYSQL_USER','MYSQL_PASSWORD']) if (!env[name]) throw new Error(`Missing environment variable: ${name}`)
  return { host:env.MYSQL_HOST,port:Number(env.MYSQL_PORT)||3306,database:env.MYSQL_DATABASE,user:env.MYSQL_USER,password:env.MYSQL_PASSWORD,charset:'utf8mb4',connectionLimit:5,multipleStatements:true,timezone:'Z',dateStrings:true }
}
export function openMysqlPool(env = process.env) { return mysql.createPool(mysqlConfig(env)) }
export async function migrateMysql(pool) {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations(version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB')
  const [rows] = await pool.query('SELECT version FROM schema_migrations'); const applied = new Set(rows.map((row)=>row.version)); const files=(await readdir(migrationsDirectory)).filter((name)=>name.endsWith('.sql')).sort(); const completed=[]
  for(const file of files) if(!applied.has(file)){const connection=await pool.getConnection();try{await connection.beginTransaction();await connection.query(await readFile(new URL(`../database/mysql/migrations/${file}`,import.meta.url),'utf8'));await connection.execute('INSERT INTO schema_migrations(version) VALUES (?)',[file]);await connection.commit();completed.push(file)}catch(error){await connection.rollback();throw error}finally{connection.release()}}
  return completed
}
export function createMysqlMemberRepository(pool) {
  return {
    async listPublic(){const [rows]=await pool.query(`${select} WHERE status='approved' ORDER BY id`);return rows.map(map)},
    async listAll(){const [rows]=await pool.query(`${select} ORDER BY id`);return rows.map(map)},
    async find(id){const [rows]=await pool.execute(`${select} WHERE id=?`,[id]);return map(rows[0])??null},
    async create(item, connection=pool){const [result]=await connection.execute('INSERT INTO members(name,role_title,cohort,location,bio,skills_json,interests_json,avatar,email,status,owner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[item.name,item.role,item.cohort,item.location,item.bio,JSON.stringify(item.skills),JSON.stringify(item.interests),item.avatar,item.email,item.status,item.ownerId]);return this.find(result.insertId)},
    async transition(id,status,{reviewerId,note}){await pool.execute('UPDATE members SET status=?,reviewed_by=?,review_note=?,version=version+1 WHERE id=?',[status,reviewerId,note,id]);return this.find(id)},
    async importBatch(rows,ownerId){const connection=await pool.getConnection();try{await connection.beginTransaction();const created=[];for(const row of rows){const [result]=await connection.execute('INSERT INTO members(name,role_title,cohort,location,bio,skills_json,interests_json,avatar,email,status,owner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[row.name,row.role,row.cohort,row.location,row.bio,JSON.stringify(row.skills),JSON.stringify(row.interests),row.avatar,row.email,'submitted',ownerId]);created.push({...row,id:Number(result.insertId),status:'submitted',ownerId})}await connection.commit();return created}catch(error){await connection.rollback();if(error.code==='ER_DUP_ENTRY')error.code='DUPLICATE_EMAIL';throw error}finally{connection.release()}},
  }
}
export async function seedMysqlUsers(pool, env=process.env){const repo=createMysqlUserRepository(pool);for(const item of [{username:env.MEMBER_USERNAME,password:env.MEMBER_PASSWORD,displayName:'学生成员',role:'member'},{username:env.REVIEWER_USERNAME,password:env.REVIEWER_PASSWORD,displayName:'课程审核员',role:'reviewer'}])if(item.username&&item.password){const{salt,hash}=hashPassword(item.password);await repo.upsert({...item,passwordSalt:salt,passwordHash:hash})}return repo}
export async function seedMysqlMembers(pool) {
  for (const item of seedMemberRecords) await pool.execute(`INSERT IGNORE INTO members(name,role_title,cohort,location,bio,skills_json,interests_json,avatar,email,status,owner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [item.name,item.role,item.cohort,item.location,item.bio,JSON.stringify(item.skills),JSON.stringify(item.interests),item.avatar,item.email,item.status,item.ownerId])
  const [[row]] = await pool.query('SELECT COUNT(*) count FROM members')
  return Number(row.count)
}
