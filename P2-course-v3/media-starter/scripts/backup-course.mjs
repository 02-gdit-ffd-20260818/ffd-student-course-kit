import { mkdirSync,existsSync,copyFileSync,readFileSync,readdirSync } from 'node:fs'
import { dirname,resolve,basename,join } from 'node:path'
import { createHash } from 'node:crypto'
if(!process.argv.includes('--confirmed-stopped'))throw new Error('先在终端A按Ctrl+C停止后端，再运行 npm run db:backup -- --confirmed-stopped；完成后重新启动。')
const source=resolve(process.env.DATABASE_PATH||'./var/course-blog.sqlite')
if(!existsSync(source))throw new Error('数据库还不存在，请先启动一次后端。')
const backupRoot=resolve(dirname(source),'backups');mkdirSync(backupRoot,{recursive:true})
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),bundle=join(backupRoot,'course-'+stamp),databaseDir=join(bundle,'database');mkdirSync(databaseDir,{recursive:true})
const target=join(databaseDir,'course-blog.sqlite');copyFileSync(source,target)
console.log('1/4 数据库主文件已复制')
if(existsSync(source+'-wal'))copyFileSync(source+'-wal',target+'-wal')
console.log('2/4 WAL文件已处理')
const digest=path=>createHash('sha256').update(readFileSync(path)).digest('hex')
if(digest(source)!==digest(target))throw new Error('数据库备份逐字节校验失败')
if(existsSync(source+'-wal')&&digest(source+'-wal')!==digest(target+'-wal'))throw new Error('WAL备份逐字节校验失败')
console.log('3/4 数据库逐字节校验通过')
const media=resolve(process.env.MEDIA_PATH||join(dirname(source),'media'))
function copyTree(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error('媒体目录不能包含符号链接');if(entry.isDirectory())copyTree(join(from,entry.name),join(to,entry.name));else if(entry.isFile())copyFileSync(join(from,entry.name),join(to,entry.name))}}
if(existsSync(media))copyTree(media,join(bundle,'media'))
if(existsSync('.env'))copyFileSync('.env',join(bundle,'.env'))
console.log('4/4 媒体与配置已复制')
console.log('完整备份：',basename(bundle),'；数据库与WAL逐字节SHA-256校验：通过')
console.log('备份位于var/backups，包含数据库、上传媒体和本机.env，不提交Git。')
