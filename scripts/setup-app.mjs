import { existsSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
if(existsSync('.env'))console.log('已有 .env，保留原有数据库和账号设置。')
else {
 writeFileSync('.env',`PORT=3000\nDATABASE_PATH=./var/blog.sqlite\nMEDIA_PATH=./var/media\nBACKUP_PATH=./var/backups\nSESSION_SECRET=${randomBytes(32).toString('hex')}\nADMIN_USERNAME=admin\nADMIN_PASSWORD=${randomBytes(18).toString('base64url')}\n`)
 console.log('已创建本机 .env。管理员用户名 admin；密码请打开 .env 查看 ADMIN_PASSWORD。不要上传这个文件。')
}
