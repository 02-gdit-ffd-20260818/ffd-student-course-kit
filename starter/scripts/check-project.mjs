import { readFile } from 'node:fs/promises'
const [app, adapter, queue, ci, netlify] = await Promise.all(['src/App.vue','src/adapters/musicAdapter.js','src/stores/queueCore.js','.github/workflows/ci.yml','netlify.toml'].map((file)=>readFile(file,'utf8')))
const checks = [
  ['Pinia 队列', app.includes('useQueueStore')], ['五态播放器', app.includes('playerState')], ['搜索四态', app.includes('searchState')], ['Adapter 契约', adapter.includes('class MusicAdapter')], ['无版权合成音', adapter.includes('课堂合成音')], ['队列去重', queue.includes('addUnique')], ['空队列安全', queue.includes("return -1")], ['CI 测试与构建', ci.includes('npm test')&&ci.includes('npm run build')], ['Netlify SPA fallback', netlify.includes('/index.html')]
]
for (const [name,ok] of checks) console.log(`${ok?'✓':'✗'} ${name}`)
if (checks.some(([,ok])=>!ok)) process.exit(1)
console.log(`结构检查通过：${checks.length} 项。`)
