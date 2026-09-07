const targets = [
  ['P1 一页知我', 'https://02-gdit-ffd-20260818.github.io/ffd-p1-portfolio/'],
  ['P2 长风成卷', 'https://ffd-p2-blog.netlify.app/'],
  ['P2 API', 'http://47.120.73.69/ffd-p2-api/health'],
  ['P3 群像云图', 'https://ffd-p3-community.netlify.app/'],
  ['P3 API', 'https://ffd-p3-community.netlify.app/health'],
  ['P4 一笺心意', 'https://ffd-p4-greeting-card.netlify.app/'],
  ['P4 API', 'https://ffd-p4-greeting-card.netlify.app/health'],
  ['P5 星声音乐站', 'https://ffd-p5-music-station.netlify.app/']
]

let failed = false
for (const [name, url] of targets) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
    console.log(`${response.ok ? 'PASS' : 'FAIL'} ${response.status} ${name} ${url}`)
    if (!response.ok) failed = true
  } catch (error) { failed = true; console.error(`FAIL --- ${name} ${url} ${error.message}`) }
}
if (failed) process.exitCode = 1
else console.log(`生产巡检通过：${targets.length} 个入口。`)
