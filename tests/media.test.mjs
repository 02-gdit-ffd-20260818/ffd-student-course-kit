import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp,rm,readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openCourseDb } from '../server/course-db.js'
import { createCourseApp } from '../server/course-app.js'
import { validateMedia } from '../src/shared/media.js'

test('媒体链接拒绝脚本协议、越界路径和缺少图片说明',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,x','//evil.test/a','/media/../.env','http://evil.test/a','https://user:pass@example.com/a'])assert.ok(validateMedia([{type:'image',url,alt:'图',caption:''}]))
 assert.ok(validateMedia([{type:'image',url:'/media/a.png',alt:'',caption:''}]))
 assert.equal(validateMedia([{type:'audio',url:'https://example.com/a.mp3',caption:'音乐'}]),'')
})

test('媒体入库、文件上传、字节一致性、范围请求与重启保存',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'p2-media-')),env={DATABASE_PATH:join(dir,'course.sqlite'),ADMIN_USERNAME:'teacher',ADMIN_PASSWORD:'Teacher-media-password-123'},secret='media-test-secret-with-more-than-32-characters'
 let db=await openCourseDb(env),server=createCourseApp(db,secret,{mediaPath:join(dir,'media')}).listen(0,'127.0.0.1')
 await new Promise(resolve=>server.once('listening',resolve));let base='http://127.0.0.1:'+server.address().port
 async function json(path,method='GET',data,token){const res=await fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined});return {status:res.status,body:res.status===204?null:await res.json()}}
 try{
  const admin=(await json('/api/auth/login','POST',{username:'teacher',password:env.ADMIN_PASSWORD})).body.data.token
  const reader=(await json('/api/auth/register','POST',{username:'reader',displayName:'读者',password:'Reader-media-password-123'})).body.data.token
  async function upload(bytes,mime,token){const data=new FormData();data.append('file',new Blob([bytes],{type:mime}),'sample');const res=await fetch(base+'/api/media/upload',{method:'POST',headers:token?{authorization:'Bearer '+token}:{},body:data});return {status:res.status,body:await res.json()}}
  const sample=await readFile(new URL('../public/media/course-diagram.png',import.meta.url))
  assert.equal((await upload(sample,'image/png')).status,401)
  assert.equal((await upload(sample,'image/png',reader)).status,403)
  assert.equal((await upload(Buffer.from('<script>evil</script>'),'image/png',admin)).status,400)
  const image=await upload(sample,'image/png',admin);assert.equal(image.status,201)
  const url=image.body.data.url
  assert.deepEqual(Buffer.from(await(await fetch(base+url)).arrayBuffer()),sample)
  const range=await fetch(base+url,{headers:{Range:'bytes=0-9'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,10)
  for(const [name,mime,type] of [['learning-notes.wav','audio/wav','audio'],['comment-flow.mp4','video/mp4','video']]){
   const uploaded=await upload(await readFile(new URL('../public/media/'+name,import.meta.url)),mime,admin);assert.equal(uploaded.status,201);assert.equal(uploaded.body.data.type,type)
  }
  const media=[{type:'image',url,alt:'课堂图',caption:'图片入库',afterParagraph:1},{type:'audio',url:'/media/learning-notes.wav',alt:'',caption:'音乐',afterParagraph:null},{type:'video',url:'/media/comment-flow.mp4',alt:'',caption:'视频',afterParagraph:2}]
  const article={slug:'media-test',title:'媒体测试文章',summary:'三种媒体',status:'published',content:['第一段','第二段'],media}
  const saved=await json('/api/articles','POST',article,admin);assert.equal(saved.status,201);assert.deepEqual(saved.body.data.media,media)
  assert.equal((await json('/api/articles','POST',{...article,slug:'bad-media',media:[{type:'image',url:'javascript:alert(1)',alt:'图',caption:''}]},admin)).status,400)
  assert.equal((await json('/api/articles/abc')).status,400)
  await new Promise(resolve=>server.close(resolve));await db.close()
  db=await openCourseDb(env);server=createCourseApp(db,secret,{mediaPath:join(dir,'media')}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port
  assert.deepEqual((await json('/api/articles/'+saved.body.data.id)).body.data.media,media)
  assert.equal((await fetch(base+url)).status,200)
  const changed=await json('/api/articles/'+saved.body.data.id,'PUT',{...article,title:'更新后媒体',media:media.slice(1)},admin);assert.equal(changed.status,200);assert.equal(changed.body.data.media.length,2)
 }finally{await new Promise(resolve=>server.close(resolve));await db.close();await rm(dir,{recursive:true,force:true})}
})
