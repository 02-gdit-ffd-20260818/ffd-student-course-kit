import { cp, mkdir, rm } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const dist = new URL('../dist/', import.meta.url)

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(new URL('index.html', root), new URL('index.html', dist))
await cp(new URL('styles.css', root), new URL('styles.css', dist))
await cp(new URL('app.js', root), new URL('app.js', dist))
await cp(new URL('data.js', root), new URL('data.js', dist))
await cp(new URL('scripts/project-service.mjs', root), new URL('scripts/project-service.mjs', dist))
await cp(new URL('assets/', root), new URL('assets/', dist), { recursive: true })
await cp(new URL('.nojekyll', root), new URL('.nojekyll', dist))
console.log('已生成 dist，可用于 GitHub Pages 部署。')
