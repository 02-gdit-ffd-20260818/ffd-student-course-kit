import { openBlogDb } from './blog-db.js'
import { createBlogApp } from './blog-app.js'
const db=await openBlogDb()
const port=Number(process.env.PORT||3000)
const server=createBlogApp(db,process.env.SESSION_SECRET).listen(port,'127.0.0.1',()=>console.log(`API listening on http://127.0.0.1:${port}`))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0)}))
