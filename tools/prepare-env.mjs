import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

if (existsSync('.env')) {
  console.log('.env 已存在，保留原数据库、管理员账号和密钥。')
  process.exit(0)
}

let text = readFileSync('.env.example', 'utf8')
text = text.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${randomBytes(32).toString('hex')}`)
text = text.replace(/^ADMIN_USERNAME=.*$/m, 'ADMIN_USERNAME=teacher')
text = text.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}`)
writeFileSync('.env', text)
console.log('已创建 .env。管理员用户名 teacher；请在Trae打开 .env 查看随机 ADMIN_PASSWORD。该文件不得提交Git。')