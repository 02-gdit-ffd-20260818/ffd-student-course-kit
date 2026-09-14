import { readFile } from 'node:fs/promises'
import { validateHtml } from './site-rules.mjs'

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const failures = validateHtml(html)

if (failures.length > 0) {
  console.error('HTML 检查失败：')
  failures.forEach(item => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('HTML 检查通过：语义结构、图片替代文本和资源路径符合 v1.0 要求。')
}
