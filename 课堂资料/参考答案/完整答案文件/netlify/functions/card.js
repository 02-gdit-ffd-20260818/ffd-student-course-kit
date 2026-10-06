// 贺卡的保存与读取——短链接靠它。
//
//   POST /api/card        存一张贺卡，返回 `林老师-20260922` 这样的短标识
//   GET  /api/card?slug=x 按短标识取回贺卡
//
// 存储用 Netlify Blobs：跟着站点走，不用单独开数据库，也不用配连接串。
//
// **这里存的是别人写给别人的祝福，所以只存必要字段、不存任何身份信息**，
// 也不记录 IP。贺卡本身是公开可读的——拿到链接就能看，这正是"分享"的含义，
// 链接不是访问密码，称呼和日期可被猜到；不要填写敏感资料。

import { getStore } from '@netlify/blobs'
import { candidateSlugs, isSafeSlug } from '../../src/shared/slug.js'

const json = (body, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  })

const store = () => getStore({ name: 'cards', consistency: 'strong' })

// 存进去之前再洗一遍：字段白名单 + 逐个限长。
// 不这么做的话，有人用 curl 往里塞几兆字符串，存储就被撑爆了。
function sanitize(body) {
  const text = (value, max) => String(value ?? '').slice(0, max)
  const card = {
    receiver: text(body?.receiver, 20).trim(),
    occasion: text(body?.occasion, 10),
    tone: text(body?.tone, 10),
    message: text(body?.message, 400).trim(),
    themeId: text(body?.themeId, 20),
    createdAt: new Date().toISOString(),
  }
  if (!card.receiver) throw new Error('缺少收礼人称呼')
  if (!card.message) throw new Error('缺少祝福内容')
  return card
}

export default async function handler(request, context) {
  const url = new URL(request.url)
  const cards = () => context?.cardStore ?? store()

  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug')
    if (!isSafeSlug(slug)) return json({ error: { message: '链接不正确' } }, 400)
    const card = await cards().get(slug, { type: 'json' })
    if (!card) return json({ error: { message: '这张贺卡不存在，或者已经过期' } }, 404)
    // 贺卡内容不会再变，可以放心让 CDN 缓存久一点
    return json({ card }, 200, 'public, max-age=600, s-maxage=86400')
  }

  if (request.method !== 'POST') return json({ error: { message: '只支持 GET 和 POST' } }, 405)

  let card
  try {
    card = sanitize(await request.json())
  } catch (error) {
    return json({ error: { message: error.message } }, 400)
  }

  const blobs = cards()
  // 先试最好看的 `林老师-20260922`，被占了再往后退到带随机码的。
  // 这里必须一个一个试，不能直接覆盖——覆盖会把别人的贺卡冲掉。
  for (const slug of candidateSlugs(card.receiver)) {
    const taken = await blobs.get(slug, { type: 'json' })
    if (taken) continue
    // onlyIfNew 由平台原子判断，避免两个请求先查到空值后互相覆盖。
    // 本地适配器通过独占创建实现同一约束，冲突时抛 EEXIST。
    try {
      const result = await blobs.setJSON(slug, card, { onlyIfNew: true })
      if (result?.modified === false) continue
    }
    catch (error) { if (error.code === 'EEXIST') continue; throw error }
    return json({ slug, path: `/c/${slug}` })
  }

  return json({ error: { message: '链接名生成失败，请重试' } }, 409)
}

export const config = { path: '/api/card' }
