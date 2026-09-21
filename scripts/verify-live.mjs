import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { existsSync,mkdirSync,readFileSync,writeFileSync,unlinkSync } from 'node:fs'
const base=String(process.env.LIVE_BASE||'http://127.0.0.1:3000').replace(/\/$/,''),phase=process.argv[2]||'all'
const mediaBase=String(process.env.LIVE_MEDIA_BASE||base).replace(/\/$/,'')
const parsed=new URL(base)
if(parsed.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(parsed.hostname))throw new Error('公网验收地址必须使用HTTPS')
const proof='./var/live-verification.private.json'
async function request(path,method='GET',data,token){
 const res=await fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000)})
 assert.ok(res.status===204||res.headers.get('content-type')?.includes('application/json'),'接口返回了非JSON内容，请检查/api代理')
 return {status:res.status,body:res.status===204?null:await res.json()}
}
const health=await request('/health');assert.equal(health.status,200);assert.equal(health.body.ok,true);assert.equal(health.body.database,'SQLite');assert.equal(health.body.project,'P2课程博客v3.3')
async function begin(){
 const password=randomBytes(24).toString('base64url'),suffix=randomBytes(5).toString('hex')
 const create=await request('/api/auth/register','POST',{username:'verify_'+suffix,displayName:'部署验收同学',password});assert.equal(create.status,201);assert.equal(create.body.data.user.role,'reader')
 const login=await request('/api/auth/login','POST',{username:'verify_'+suffix,password});assert.equal(login.status,200)
 const token=login.body.data.token,articles=await request('/api/articles');assert.ok(articles.body.data.length>=7)
 const article=articles.body.data.find(a=>a.slug==='html5-media');assert.ok(article);assert.equal(article.media.length,3)
 assert.equal((await request('/api/articles/'+article.id+'/comments','POST',{body:'匿名验收'})).status,401)
 const body='部署持久化验收 '+suffix,comment=await request('/api/articles/'+article.id+'/comments','POST',{body},token);assert.equal(comment.status,201)
 const other=await request('/api/auth/register','POST',{username:'other_'+suffix,displayName:'权限验收同学',password});assert.equal(other.status,201)
 assert.equal((await request('/api/comments/'+comment.body.data.id,'DELETE',undefined,other.body.data.token)).status,403)
 for(const [url,mime] of [['/media/course-diagram.png','image/png'],['/media/learning-notes.wav','audio/'],['/media/comment-flow.mp4','video/mp4']]){
  const res=await fetch(mediaBase+url,{signal:AbortSignal.timeout(15000)});assert.equal(res.status,200);assert.ok(res.headers.get('content-type')?.startsWith(mime));assert.ok((await res.arrayBuffer()).byteLength>1000)
 }
 const range=await fetch(mediaBase+'/media/comment-flow.mp4',{headers:{Range:'bytes=0-99'},signal:AbortSignal.timeout(15000)});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,100)
 mkdirSync('./var',{recursive:true});writeFileSync(proof,JSON.stringify({base,articleId:article.id,commentId:comment.body.data.id,body,token,username:'verify_'+suffix,password}),{mode:0o600})
 console.log('PASS：注册登录、评论、越权拒绝、三种媒体及视频范围请求。')
}
async function finish(){
 if(!existsSync(proof))throw new Error('先运行verify:live before生成验收记录')
 const saved=JSON.parse(readFileSync(proof,'utf8'));assert.equal(saved.base,base,'必须在同一网址进行重启前后验收')
 const rows=await request('/api/articles/'+saved.articleId+'/comments');assert.ok(rows.body.data.some(c=>c.id===saved.commentId&&c.body===saved.body),'原评论未保留')
 let deleted=await request('/api/comments/'+saved.commentId,'DELETE',undefined,saved.token)
 if(deleted.status===401&&saved.username&&saved.password){const login=await request('/api/auth/login','POST',{username:saved.username,password:saved.password});assert.equal(login.status,200);deleted=await request('/api/comments/'+saved.commentId,'DELETE',undefined,login.body.data.token)}
 assert.equal(deleted.status,204)
 unlinkSync(proof);console.log('PASS：原评论仍在、本人可以删除。只有在before和after之间实际重启服务，才构成重启持久化证据。')
}
if(phase==='before')await begin()
else if(phase==='after')await finish()
else if(phase==='all'){await begin();await finish()}
else throw new Error('参数仅支持all、before、after')
