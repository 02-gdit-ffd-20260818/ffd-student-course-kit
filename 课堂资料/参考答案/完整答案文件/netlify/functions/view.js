// GET /c/:slug —— 分享出去的那一页。
//
// 这一页是**服务端直接拼好的完整 HTML**，不加载任何 JavaScript、没有应用外壳、
// 没有导航、没有按钮、没有一个字的推广。收到链接的人打开只会看到那张贺卡。
//
// 为什么不用前端路由渲染：
//   1. 前端渲染要先下 JS 再请求数据，手机上会先白屏一下，收贺卡的人体验很差；
//   2. 微信、QQ 这类客户端抓不到前端渲染的内容，转发时没有预览；
//   3. 页面里只要挂着应用外壳，就难免出现"回到首页""我也要做一张"这类干扰。
//      服务端单独出一页，从根上保证这页只有祝福。

import { getStore } from '@netlify/blobs'
import { findTheme } from '../../src/data/themes.js'
import { isSafeSlug } from '../../src/shared/slug.js'

// 用户写的任何内容进 HTML 之前都要转义，否则别人在祝福里写一段 <script>
// 就会在收礼人的浏览器里执行（XSS）。这一步没有例外。
const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatDate = iso => {
  const d = new Date(iso || Date.now())
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

function page(card) {
  const theme = findTheme(card.themeId)
  const receiver = escapeHtml(card.receiver)
  const message = escapeHtml(card.message)
  // 分享到聊天软件时的预览文字，截一小段就够
  const preview = escapeHtml(String(card.message || '').replace(/\s+/g, ' ').slice(0, 60))
  const title = `致 ${receiver}`

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${preview}">
<meta name="robots" content="noindex">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${preview}">
<meta name="theme-color" content="${theme.page}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{
    display:flex;align-items:center;justify-content:center;
    padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom));
    background:${theme.page};
    font-family:"Noto Serif SC",Georgia,"Songti SC","Source Han Serif SC",serif;
    -webkit-font-smoothing:antialiased;
  }
  .card{
    width:min(540px,100%);
    padding:clamp(40px,7vw,68px) clamp(28px,6vw,52px);
    border-radius:20px;
    color:${theme.ink};
    background:linear-gradient(158deg,${theme.colors[0]},${theme.colors[1]});
    box-shadow:${theme.light
      ? '0 22px 50px -26px rgba(40,36,32,.32), 0 1px 3px rgba(40,36,32,.06)'
      : '0 30px 70px -28px rgba(20,16,24,.55), 0 2px 8px rgba(20,16,24,.08)'};
    position:relative;overflow:hidden;
    animation:rise .9s cubic-bezier(.2,.7,.2,1) both;
  }
  /* 右上角一道极淡的光晕，让纯色卡面不至于太平 */
  /* 右上角一道极淡的光晕，让纯色卡面不至于太平。
     浅底上白色光晕是看不见的，换成一点暖影才有质感。 */
  .card::after{
    content:"";position:absolute;inset:-40% -30% auto auto;width:74%;aspect-ratio:1;
    background:radial-gradient(circle,${theme.light ? 'rgba(90,75,60,.07)' : 'rgba(255,255,255,.14)'},transparent 62%);
    pointer-events:none;
  }
  .mark{font-size:1.5rem;opacity:.55;letter-spacing:.2em}
  .to{
    margin-top:26px;font-size:1.06rem;letter-spacing:.06em;opacity:.9;font-weight:500;
  }
  .rule{width:34px;height:1px;margin:18px 0 22px;background:currentColor;opacity:.35}
  .message{
    font-size:clamp(1.04rem,2.9vw,1.2rem);
    line-height:2.15;letter-spacing:.02em;white-space:pre-line;font-weight:300;
  }
  .date{margin-top:34px;font-size:.78rem;letter-spacing:.14em;opacity:.5}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.card{animation:none}}
  @media print{
    body{background:#fff;padding:0}
    .card{box-shadow:none;border-radius:0;width:100%;min-height:100vh;animation:none}
  }
</style>
</head>
<body>
  <main class="card">
    <p class="mark">${escapeHtml(theme.icon)}</p>
    <p class="to">致 ${receiver}</p>
    <div class="rule"></div>
    <p class="message">${message}</p>
    <p class="date">${formatDate(card.createdAt)}</p>
  </main>
</body>
</html>`
}

const notFound = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>贺卡不存在</title>
<style>body{height:100vh;margin:0;display:grid;place-content:center;gap:10px;text-align:center;
background:#F7F5F1;color:#4A423C;font-family:system-ui,"PingFang SC","Microsoft YaHei",sans-serif}
p{margin:0}.s{font-size:.85rem;opacity:.6}</style></head>
<body><p>没有找到这张贺卡</p><p class="s">链接可能抄漏了一段，或者已经失效。</p></body></html>`

export default async function handler(request, context) {
  // 路径参数里的中文是**百分号编码**过的（林老师 → %E6%9E%97...），
  // 不解码就拿去查存储，一定查不到，页面会误报"贺卡不存在"。
  // decodeURIComponent 遇到坏编码会抛错，所以包一层。
  let slug = context?.params?.slug
  try {
    slug = decodeURIComponent(slug)
  } catch {
    slug = ''
  }

  if (!isSafeSlug(slug))
    return new Response(notFound, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

  const card = await (context?.cardStore ?? getStore({ name: 'cards', consistency: 'strong' })).get(slug, { type: 'json' })
  if (!card)
    return new Response(notFound, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

  return new Response(page(card), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // 贺卡内容不会再变，让 CDN 替我们扛住转发带来的流量
      'Cache-Control': 'public, max-age=600, s-maxage=86400',
    },
  })
}

export const config = { path: '/c/:slug' }
