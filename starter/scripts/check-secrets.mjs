import { execFileSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'

let files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
if (!files.length) {
  async function walk(dir = '.') {
    const entries = await readdir(dir, { withFileTypes: true })
    const nested = await Promise.all(entries.map(async (entry) => {
      if (['.git', 'node_modules', 'dist', '.netlify', 'coverage'].includes(entry.name)) return []
      const path = dir === '.' ? entry.name : `${dir}/${entry.name}`
      return entry.isDirectory() ? walk(path) : [path]
    }))
    return nested.flat()
  }
  files = await walk()
}
const forbidden = [/sk-[A-Za-z0-9_-]{20,}/, /OPENAI_API_KEY\s*=\s*[^\s#]{8,}/]
const allowed = new Set(['.env.example', 'tests/api.test.mjs', 'tests/provider.test.mjs', 'scripts/check-secrets.mjs'])
const violations = []
for (const file of files) {
  if (allowed.has(file) || file.endsWith('package-lock.json')) continue
  const content = await readFile(file, 'utf8').catch(() => '')
  if (forbidden.some((pattern) => pattern.test(content))) violations.push(file)
}
if (violations.length) { console.error(`疑似密钥出现在：${violations.join(', ')}`); process.exit(1) }
console.log(`密钥扫描通过：${files.length} 个受控文件，0 个疑似密钥。`)
