import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

if (existsSync('.env')) {
  console.log('.env ?????????????????????')
  process.exit(0)
}

let text = readFileSync('.env.example', 'utf8')
text = text.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${randomBytes(32).toString('hex')}`)
text = text.replace(/^ADMIN_USERNAME=.*$/m, 'ADMIN_USERNAME=admin')
text = text.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}`)
writeFileSync('.env', text)
console.log('??? .env????????? admin??? Trae ??? .env ???? ADMIN_PASSWORD????????? Git?')
