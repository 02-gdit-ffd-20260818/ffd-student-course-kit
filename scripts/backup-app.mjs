// 一致快照备份；原数据库和媒体不删除、不覆盖。
import { mkdirSync, existsSync, copyFileSync, readFileSync, readdirSync, writeFileSync, lstatSync } from 'node:fs'
import { dirname, resolve, join, relative, isAbsolute } from 'node:path'
import { createHash, randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
const digest = file => createHash('sha256').update(readFileSync(file)).digest('hex')
function checkDatabase(file) {
  const db = new DatabaseSync(file, { readOnly: true })
  try {
    const rows = db.prepare('PRAGMA integrity_check').all()
    if (rows.length !== 1 || rows[0].integrity_check !== 'ok') throw new Error('SQLite 完整性检查失败')
  } finally { db.close() }
}
function verify(bundle) {
  const manifest = JSON.parse(readFileSync(join(bundle, 'manifest.json'), 'utf8'))
  if (manifest.version !== 1 || !manifest.files?.['database/blog.sqlite']) throw new Error('备份清单格式不正确')
  for (const [name, expected] of Object.entries(manifest.files)) {
    const target = resolve(bundle, name), rel = relative(bundle, target)
    if (!rel || rel.startsWith('..') || isAbsolute(rel) || lstatSync(target).isSymbolicLink()) throw new Error('备份包含不安全路径')
    if (digest(target) !== expected) throw new Error(`备份摘要不匹配：${name}`)
  }
  checkDatabase(join(bundle, 'database/blog.sqlite'))
  console.log('PASS：备份清单 SHA-256 与 SQLite 完整性检查通过。')
}
if (process.argv[2] === '--verify') {
  if (!process.argv[3]) throw new Error('用法：npm run db:backup -- --verify "实际备份目录"')
  verify(resolve(process.argv[3]))
} else {
  if (!process.argv.includes('--confirmed-stopped')) throw new Error('先停止后端及其他写入工具，再运行 npm run db:backup -- --confirmed-stopped；完成后重新启动。')
  const source = resolve(process.env.DATABASE_PATH || './var/blog.sqlite')
  if (!existsSync(source)) throw new Error('数据库不存在；请核对 DATABASE_PATH，不会自动创建空库。')
  const root = resolve(process.env.BACKUP_PATH || join(dirname(source), 'backups'))
  const media = resolve(process.env.MEDIA_PATH || join(dirname(source), 'media'))
  const relRoot = relative(media, root)
  if (!relRoot || (!relRoot.startsWith('..') && !isAbsolute(relRoot))) throw new Error('BACKUP_PATH 不能放在 MEDIA_PATH 内，否则会递归备份自身。')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const bundle = join(root, `blog-${stamp}-${randomBytes(3).toString('hex')}`)
  mkdirSync(join(bundle, 'database'), { recursive: true, mode: 0o700 })
  const db = new DatabaseSync(source, { readOnly: true })
  try {
    // SQLite 合并已提交的 WAL 内容生成独立快照，而非分开复制主库/WAL。
    db.prepare('VACUUM INTO ?').run(join(bundle, 'database/blog.sqlite'))
  } finally { db.close() }
  const files = {}
  const record = file => { files[relative(bundle, file).replaceAll('\\', '/')] = digest(file) }
  record(join(bundle, 'database/blog.sqlite'))
  function copyTree(from, to) {
    if (lstatSync(from).isSymbolicLink()) throw new Error('媒体目录不能包含符号链接')
    mkdirSync(to, { recursive: true, mode: 0o700 })
    for (const entry of readdirSync(from, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('媒体目录不能包含符号链接')
      const sourceFile = join(from, entry.name), target = join(to, entry.name)
      if (entry.isDirectory()) copyTree(sourceFile, target)
      else if (entry.isFile()) {
        copyFileSync(sourceFile, target); record(target)
        if (digest(sourceFile) !== digest(target)) throw new Error('媒体在备份期间变化；请停止写入后重新备份')
      }
    }
  }
  if (existsSync(media)) copyTree(media, join(bundle, 'media'))
  const config = resolve(process.env.CONFIG_ENV_PATH || '.env')
  if (existsSync(config)) {
    writeFileSync(join(bundle, '.env'), readFileSync(config), { mode: 0o600, flag: 'wx' })
    record(join(bundle, '.env'))
  }
  writeFileSync(join(bundle, 'manifest.json'), JSON.stringify({ version: 1, createdAt: new Date().toISOString(), files }, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
  verify(bundle)
  console.log('数据库快照 SHA-256：', files['database/blog.sqlite'])
  console.log('备份目录：', bundle)
  console.log('含媒体和可用配置；可能含密钥，禁止提交 Git 或放入网站公开目录。原库和原媒体未删除。')
}
