import express from 'express'
import { hashPassword, verifyPassword, createAccessToken, verifyAccessToken, readBearerToken } from './services/auth.js'
import { validateArticleInput, toArticleRecord } from './services/articleInput.js'
import { mediaUpload } from './media-upload.js'

const article = a => ({ id:Number(a.id),slug:a.slug,title:a.title,summary:a.summary,content:JSON.parse(a.content_json),media:JSON.parse(a.media_json||'[]'),tags:JSON.parse(a.tags_json),status:a.status,author:a.author,publishedAt:a.published_at })
const user = u => ({ id:Number(u.id),username:u.username,displayName:u.display_name,role:u.role })
export function createCourseApp(db, secret, options={}) {
  if (!secret || secret.length < 32) throw new Error('请设置至少32字符 SESSION_SECRET')
  const app = express(), attempts = new Map()
  app.disable('x-powered-by');app.use(express.json({limit:'100kb'}))
  app.use((req,res,next) => {
    res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff')
    req.user = verifyAccessToken(readBearerToken(req.get('authorization')), secret)
    next()
  })
  const fail=(res,status,message)=>res.status(status).json({error:{message}})
  function signed(req,res,next) { if(!req.user)return fail(res,401,'请先登录');next() }
  function admin(req,res,next) { if(!req.user)return fail(res,401,'请先登录');if(req.user.role!=='admin')return fail(res,403,'仅教师可管理文章');next() }
  if(db.driver==='SQLite'){
    const media=mediaUpload(options.mediaPath)
    app.post('/api/media/upload',admin,media.upload,media.save)
    app.use('/media/uploads',express.static(media.directory,{dotfiles:'ignore',index:false,fallthrough:false,setHeaders(res){res.set('Cache-Control','public, max-age=86400');res.set('X-Content-Type-Options','nosniff')}}))
  }else app.post('/api/media/upload',admin,(req,res)=>fail(res,503,'此在线环境尚未配置持久化文件存储，请使用HTTPS媒体链接'))
  app.use('/api/auth', (req,res,next) => {
    const key=req.ip,now=Date.now();if(attempts.size>2000)attempts.clear()
    let a=attempts.get(key);if(!a||now-a.time>600000)a={time:now,count:0};a.count++;attempts.set(key,a)
    if(a.count>40)return fail(res,429,'操作过于频繁，请稍后重试');next()
  })
  app.param('id', (req,res,next,value) => { if(!/^[1-9][0-9]*$/.test(value)||!Number.isSafeInteger(Number(value)))return fail(res,400,'编号格式不正确');next() })
  app.get('/health',async(req,res)=>{await db.query('SELECT 1');res.json({ok:true,database:db.driver,project:'P2课程博客v3.0'})})
  app.post('/api/auth/register',async(req,res)=>{
    const username=String(req.body?.username||'').trim().toLowerCase(),displayName=String(req.body?.displayName||'').trim(),password=req.body?.password
    if(!/^[a-z0-9_]{3,24}$/.test(username)||!displayName||displayName.length>24||typeof password!=='string'||password.length<12||password.length>128)return fail(res,400,'用户名3—24位字母/数字/下划线，昵称1—24字，密码12—128字符')
    if((await db.query('SELECT id FROM course_users WHERE username=$1',[username])).length)return fail(res,409,'用户名已被使用')
    const {salt,hash}=hashPassword(password)
    const [u]=await db.query("INSERT INTO course_users(username,display_name,password_salt,password_hash) VALUES($1,$2,$3,$4) RETURNING *",[username,displayName,salt,hash])
    res.status(201).json({data:{token:createAccessToken(user(u),secret),user:user(u)}})
  })
  app.post('/api/auth/login',async(req,res)=>{
    const username=String(req.body?.username||'').trim().toLowerCase(),password=req.body?.password
    if(typeof password!=='string'||password.length>128)return fail(res,401,'用户名或密码不正确')
    const [u]=await db.query('SELECT * FROM course_users WHERE username=$1',[username])
    if(!u||!verifyPassword(password,u.password_salt,u.password_hash))return fail(res,401,'用户名或密码不正确')
    res.json({data:{token:createAccessToken(user(u),secret),user:user(u)}})
  })
  app.get('/api/articles',async(req,res)=>{
    const rows=await db.query(req.user?.role==='admin'?'SELECT * FROM course_articles ORDER BY id':"SELECT * FROM course_articles WHERE status='published' ORDER BY id")
    res.json({data:rows.map(article)})
  })
  app.get('/api/articles/:id',async(req,res)=>{
    const [a]=await db.query('SELECT * FROM course_articles WHERE id=$1',[Number(req.params.id)])
    if(!a||(a.status!=='published'&&req.user?.role!=='admin'))return fail(res,404,'文章不存在');res.json({data:article(a)})
  })
  for(const method of ['post','put'])app[method](method==='post'?'/api/articles':'/api/articles/:id',admin,async(req,res)=>{
    const errors=validateArticleInput(req.body);if(Object.keys(errors).length)return res.status(400).json({error:{message:'请检查文章内容',fields:errors}})
    const a=toArticleRecord(req.body),values=[a.slug,a.title,a.summary,JSON.stringify(a.content),JSON.stringify(a.tags),a.status,a.author,a.publishedAt,JSON.stringify(a.media||[])]
    const sql=method==='post'?'INSERT INTO course_articles(slug,title,summary,content_json,tags_json,status,author,published_at,media_json) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *':'UPDATE course_articles SET slug=$1,title=$2,summary=$3,content_json=$4,tags_json=$5,status=$6,author=$7,published_at=$8,media_json=$9 WHERE id=$10 RETURNING *'
    if(method==='put')values.push(Number(req.params.id));const [row]=await db.query(sql,values)
    if(!row)return fail(res,404,'文章不存在');res.status(method==='post'?201:200).json({data:article(row)})
  })
  app.delete('/api/articles/:id',admin,async(req,res)=>{const rows=await db.query('DELETE FROM course_articles WHERE id=$1 RETURNING id',[Number(req.params.id)]);if(!rows.length)return fail(res,404,'文章不存在');res.sendStatus(204)})
  async function published(id){return (await db.query("SELECT id FROM course_articles WHERE id=$1 AND status='published'",[Number(id)])).length>0}
  app.get('/api/articles/:id/comments',async(req,res)=>{
    if(!await published(req.params.id))return fail(res,404,'文章不存在')
    const rows=await db.query('SELECT c.id,c.user_id,c.body,c.created_at,u.display_name FROM course_comments c JOIN course_users u ON u.id=c.user_id WHERE c.article_id=$1 ORDER BY c.id DESC LIMIT 200',[Number(req.params.id)])
    res.json({data:rows.map(c=>({id:Number(c.id),userId:Number(c.user_id),body:c.body,createdAt:c.created_at,author:c.display_name}))})
  })
  app.post('/api/articles/:id/comments',signed,async(req,res)=>{
    if(!await published(req.params.id))return fail(res,404,'文章不存在')
    const body=typeof req.body?.body==='string'?req.body.body.trim():''
    if(!body||body.length>1000)return fail(res,400,'评论请输入1—1000字')
    const count=await db.query('SELECT COUNT(*) AS total FROM course_comments WHERE user_id=$1',[req.user.sub]);if(Number(count[0].total)>=200)return fail(res,429,'评论数量已达体验上限')
    const [row]=await db.query('INSERT INTO course_comments(article_id,user_id,body) VALUES($1,$2,$3) RETURNING id',[Number(req.params.id),req.user.sub,body]);res.status(201).json({data:{id:Number(row.id)}})
  })
  app.delete('/api/comments/:id',signed,async(req,res)=>{
    const [c]=await db.query('SELECT user_id FROM course_comments WHERE id=$1',[Number(req.params.id)])
    if(!c)return fail(res,404,'评论不存在');if(Number(c.user_id)!==Number(req.user.sub)&&req.user.role!=='admin')return fail(res,403,'只能删除自己的评论')
    await db.query('DELETE FROM course_comments WHERE id=$1',[Number(req.params.id)]);res.sendStatus(204)
  })
  app.use((req,res)=>fail(res,404,'接口不存在'))
  app.use((error,req,res,next)=>{
    if(error.code==='LIMIT_FILE_SIZE')return fail(res,413,'文件不能超过40MB')
    if(error.status===400||error.code?.startsWith('LIMIT_'))return fail(res,400,error.message||'上传格式不正确')
    if(error.status===404)return fail(res,404,'媒体文件不存在')
    if(error instanceof SyntaxError)return fail(res,400,'请求格式不正确')
    if(error.code==='23505'||String(error.message).includes('UNIQUE constraint'))return fail(res,409,'用户名或文章地址重复')
    fail(res,500,'服务暂时不可用，请重试')
  });return app
}
