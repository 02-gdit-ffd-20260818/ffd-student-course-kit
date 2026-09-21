import { openBlogDb } from './blog-db.js'
import { createBlogApp } from './blog-app.js'
const db=await openBlogDb()
const server=createBlogApp(db,process.env.SESSION_SECRET).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('内容发布平台 API 已启动'))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0)}))
