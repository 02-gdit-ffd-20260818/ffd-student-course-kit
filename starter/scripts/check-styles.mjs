import { readFile } from 'node:fs/promises'
import { validateStyles } from './style-rules.mjs'

const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8')
const failures = validateStyles(css)

if (failures.length > 0) {
  console.error('CSS 检查失败：')
  failures.forEach(item => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('CSS 检查通过：布局、响应式、打印和键盘焦点符合 v1.1 要求。')
}
