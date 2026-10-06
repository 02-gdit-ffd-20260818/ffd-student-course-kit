// 本地及 Ubuntu 文件存储。Netlify 部署仍使用 Blobs；这里不需要平台账号。
import { mkdir, readFile, writeFile, link, unlink } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'

export function createFileCardStore(directory) {
  const root = path.resolve(directory)
  // 把公开链接标识哈希为固定文件名；即使学生还没做 slug 校验，也不能跳出目录。
  const filename = key => path.join(root, createHash('sha256').update(String(key)).digest('hex') + '.json')
  return {
    async get(key) {
      try { return JSON.parse(await readFile(filename(key), 'utf8')) }
      catch (error) { if (error.code === 'ENOENT') return null; throw error }
    },
    async setJSON(key, value) {
      await mkdir(root, { recursive: true })
      const temp = path.join(root, '.' + randomUUID() + '.tmp')
      try {
        await writeFile(temp, JSON.stringify(value), { flag: 'wx', mode: 0o600 })
        // 原子创建目标链接：已存在则 EEXIST，不覆盖别人卡片；读者只看见完整内容。
        await link(temp, filename(key))
      } finally { await unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    },
  }
}
