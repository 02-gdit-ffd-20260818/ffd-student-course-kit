import { openCourseDb } from './course-db.js'
import { createCourseApp } from './course-app.js'
const db=await openCourseDb()
const server=createCourseApp(db,process.env.SESSION_SECRET).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('课程博客 API 已启动'))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0)}))
