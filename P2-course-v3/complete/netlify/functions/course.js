import serverless from 'serverless-http'
import { openCourseDb } from '../../server/course-db.js'
import { createCourseApp } from '../../server/course-app.js'
let ready
export async function handler(event,context){
  // Serverless环境必须显式配置持久化PostgreSQL，禁止用临时SQLite冒充在线数据库。
  if(process.env.DB_DRIVER!=='postgres')return {statusCode:503,headers:{'content-type':'application/json'},body:JSON.stringify({error:{message:'在线数据库尚未配置'}})}
  ready ||= openCourseDb().then(db=>serverless(createCourseApp(db,process.env.SESSION_SECRET))).catch(e=>{ready=null;throw e})
  return (await ready)(event,context)
}
