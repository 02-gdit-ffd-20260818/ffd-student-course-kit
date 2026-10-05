import express from 'express'
import { resolve } from 'node:path'
import { openBlogDb } from './blog-db.js'
import { createBlogApp } from './blog-app.js'
const db=await openBlogDb(), api=createBlogApp(db,process.env.SESSION_SECRET), app=express()
app.use((req,res,next)=>req.path.startsWith('/api/')||req.path.startsWith('/media/uploads/')||req.path==='/health'?api(req,res,next):next())
app.use(express.static(resolve('dist')))
app.get(/.*/, (req,res)=>res.sendFile(resolve('dist/index.html')))
const server=app.listen(3304,'127.0.0.1',()=>console.log('完整功能预览 http://127.0.0.1:3304'))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0)}))
