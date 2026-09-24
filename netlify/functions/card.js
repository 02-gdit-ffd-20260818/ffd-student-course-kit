// 贺卡的保存与读取——短链接靠它。
//
//   POST /api/card        存一张贺卡，返回 `林老师-20260922` 这样的短标识
//   GET  /api/card?slug=x 按短标识取回贺卡
//
// 存储用 Netlify Blobs：跟着站点走，不用单独开数据库，也不用配连接串。
//
// **这里存的是别人写给别人的祝福，所以只存必要字段、不存任何身份信息**，
// 也不记录 IP。贺卡本身是公开可读的——拿到链接就能看，这正是"分享"的含义，
// 所以短标识里带随机码，别人猜不到。

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
    // ============ P4 第3课 任务 TODO 03（简单）：只存该存的字段 ============
  // 终端里看得到的结果：现在用 curl 往 /api/card 里塞一个几兆的字符串，
  // 或者塞几十个额外字段，全都会被原样存进去。
  // 做完之后只存五个字段，每个都截到上限。
  //
  // TODO：按字段白名单逐个取值并限长：
  //   receiver: text(body?.receiver, 20).trim()
  //   occasion: text(body?.occasion, 10)
  //   tone:     text(body?.tone, 10)
  //   message:  text(body?.message, 400).trim()
  //   themeId:  text(body?.themeId, 20)
  //   createdAt: new Date().toISOString()
  //
  // **注意这里是"挑出要的"，不是"删掉不要的"**——
  // 直接 { ...body } 再删几个字段，永远会漏。列白名单才是对的。
  //
  // 再看一眼这个函数上面的注释：这里存的是**别人写给别人的祝福**，
  // 所以只存必要字段、不存任何身份信息、不记 IP。
  // **能不收集的数据就不收集**，这是隐私保护最有效的一条。
  //
  // createdAt 用 toISOString()：它是带时区的标准格式，
  // 换一台服务器、换一个时区都不会错。**存时间一律存 ISO 字符串或时间戳，
  // 不要存"2026年9月22日"这种给人看的格式。**
  // ==============================================================
  const card = { ...body, createdAt: new Date().toISOString() }
  if (!card.receiver) throw new Error('缺少收礼人称呼')
  if (!card.message) throw new Error('缺少祝福内容')
  return card
}

export default async function handler(request) {
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug')
    if (!isSafeSlug(slug)) return json({ error: { message: '链接不正确' } }, 400)
    const card = await store().get(slug, { type: 'json' })
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

  const blobs = store()
  // 先试最好看的 `林老师-20260922`，被占了再往后退到带随机码的。
  // 这里必须一个一个试，不能直接覆盖——覆盖会把别人的贺卡冲掉。
  for (const slug of candidateSlugs(card.receiver)) {
    const taken = await blobs.get(slug, { type: 'json' })
    if (taken) continue
    await blobs.setJSON(slug, card)
    return json({ slug, path: `/c/${slug}` })
  }

  return json({ error: { message: '链接名生成失败，请重试' } }, 409)
}

export const config = { path: '/api/card' }
