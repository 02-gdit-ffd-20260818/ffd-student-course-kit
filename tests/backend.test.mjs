import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openBlogDb } from '../server/blog-db.js'
import { createBlogApp } from '../server/blog-app.js'

test('真实数据库：注册、登录、权限、评论及重启持久化', async () => {
 const dir=await mkdtemp(join(tmpdir(),'p2-blog-'))
 const env={DATABASE_PATH:join(dir,'blog.sqlite'),ADMIN_USERNAME:'admin',ADMIN_PASSWORD:'Admin-test-password-123'}
 const secret='test-only-secret-with-more-than-32-characters'
 let db=await openBlogDb(env), server=createBlogApp(db,secret).listen(0,'127.0.0.1')
 await new Promise(resolve=>server.once('listening',resolve))
 let base='http://127.0.0.1:'+server.address().port
 async function request(path,method='GET',data,token){const response=await fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined});return {status:response.status,body:response.status===204?null:await response.json()}}
 try {
  assert.equal((await request('/health')).body.database,'SQLite')
  assert.equal((await request('/api/auth/register','POST',{username:'x',displayName:'甲',password:'short'})).status,400)
  const first=await request('/api/auth/register','POST',{username:'student_a',displayName:'同学甲',password:'Student-password-123',role:'admin'})
  assert.equal(first.status,201);assert.equal(first.body.data.user.role,'reader');assert.equal(first.body.data.user.password_hash,undefined)
  const token=first.body.data.token
  assert.equal((await request('/api/auth/register','POST',{username:'student_a',displayName:'甲',password:'Student-password-123'})).status,409)
  assert.equal((await request('/api/auth/login','POST',{username:'student_a',password:'incorrect'})).status,401)
  assert.equal((await request('/api/auth/login','POST',{username:'student_a',password:'Student-password-123'})).status,200)
  assert.equal((await request('/api/articles','POST',{},token)).status,403)
  assert.equal((await request('/api/articles/1/comments','POST',{body:'匿名评论'})).status,401)
  assert.equal((await request('/api/articles/1/comments','POST',{body:'   '},token)).status,400)
  assert.equal((await request('/api/articles/1/comments','POST',{body:'字'.repeat(1001)},token)).status,400)
  const text="重启后应该保留；<script>alert(1)</script>；' OR 1=1 --"
  const comment=await request('/api/articles/1/comments','POST',{body:text},token)
  assert.equal(comment.status,201)
  const other=await request('/api/auth/register','POST',{username:'student_b',displayName:'同学乙',password:'Student-password-456'})
  assert.equal((await request('/api/comments/'+comment.body.data.id,'DELETE',undefined,other.body.data.token)).status,403)
  const [saved]=await db.query('SELECT password_hash FROM users WHERE username=$1',['student_a'])
  assert.notEqual(saved.password_hash,'Student-password-123')
  await new Promise(resolve=>server.close(resolve));await db.close()
  db=await openBlogDb(env);server=createBlogApp(db,secret).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port
  const rows=(await request('/api/articles/1/comments')).body.data
  assert.equal(rows[0].body,text)
  assert.equal((await request('/api/comments/'+comment.body.data.id,'DELETE',undefined,token)).status,204)
  assert.equal((await request('/api/articles/1/comments')).body.data.length,0)
  const admin=await request('/api/auth/login','POST',{username:'admin',password:env.ADMIN_PASSWORD})
  assert.equal(admin.body.data.user.role,'admin')
  const second=await request('/api/articles/1/comments','POST',{body:'管理员清理验证'},other.body.data.token)
  assert.equal((await request('/api/comments/'+second.body.data.id,'DELETE',undefined,admin.body.data.token)).status,204)
 } finally {await new Promise(resolve=>server.close(resolve));await db.close();await rm(dir,{recursive:true,force:true})}
})
