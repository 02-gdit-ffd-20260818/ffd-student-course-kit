// 文章输入的校验与规整，分成两个函数，职责分得很清楚：
//   validateArticleInput  只回答"这份输入合不合法"，返回一个错误对象
//   toArticleRecord       只负责"把合法输入整理成入库的样子"
//
// 为什么拆开：校验要能单独测（给它一堆坏输入看报不报错），
// 而且路由里可以先校验、不通过就直接 400 返回，根本不用走到整理那一步。
//
// 两个函数都不碰数据库、不碰 Express，所以测试里直接调就行。

import { validateMedia, normalizeMedia } from '../../src/shared/media.js'

// 返回值是一个对象：**没有错误就是空对象 {}**，有错就是 { 字段名: 原因 }。
// 这样前端能把每条错误标在对应的输入框上，而不是只弹一句"保存失败"。
export function validateArticleInput(input) {
  const errors = {}
  // 连对象都不是就没法逐字段查了，直接返回
  if (!input || typeof input !== 'object') return { body: 'JSON object required' }
  // 先判断类型再 trim。外面传进来的 title 可能是数字、数组甚至 null，
  // 直接 .trim() 会抛异常，那就成了 500 而不是该有的 400。
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const summary = typeof input.summary === 'string' ? input.summary.trim() : ''
  // ============ TODO 03（简单）：标题和摘要必须校验 ============
  // 现在标题可以是空的，也可以是一万字——存进去之后列表页会被撑爆。
  //
  // 页面上看得到的结果：文章编辑页把标题清空点保存，
  // **标题输入框下方出现红色提示**，而不是保存成功。
  //
  // TODO：补上四条判断：
  //   标题为空      → errors.title = 'title required'
  //   标题超过 60   → errors.title = 'title too long'
  //   摘要为空      → errors.summary = 'summary required'
  //   摘要超过 160  → errors.summary = 'summary too long'
  //
  // 注意错误是**按字段收集**到 errors 对象里，而不是遇到第一个就返回。
  // 这样前端能把每条错误标在对应的输入框上，用户一次就能全改完，
  // 不用"改一个、保存、又报一个"来回折腾。
  // ====================================================
  // 状态用白名单，只有草稿和已发布两种
  if (!['draft', 'published'].includes(input.status)) errors.status = 'status invalid'
  const mediaError = validateMedia(input.media)
  if (mediaError) errors.media = mediaError
  if (!Array.isArray(input.content) && typeof input.content !== 'string')
    errors.content = '正文格式不正确'
  // slug 是文章网址里的那一段，必须干净：只允许小写字母、数字和短横线，
  // 且以字母数字开头，最长 100 个字符。中文和空格进了网址会变成一串 %E4%B8...
  if (
    typeof input.slug === 'string' &&
    input.slug.trim() &&
    !/^[a-z0-9][a-z0-9-]{0,99}$/.test(input.slug.trim())
  )
    errors.slug = '链接名称仅用英文字母、数字和短横线'
  if (
    Array.isArray(input.content) &&
    (!input.content.every(p => typeof p === 'string') || input.content.length > 200)
  )
    errors.content = '正文最多200个文字段落'
  if (input.author !== undefined && typeof input.author !== 'string') errors.author = '作者应为文字'
  return errors
}

// 整理成入库记录。existing 是"这篇文章原来的样子"——
// 编辑时把旧值传进来，用户没填的字段就沿用旧值，不会被清空。
// now 写成参数同样是为了测试能固定时间。
export function toArticleRecord(input, existing = {}, now = new Date()) {
  const title = input.title.trim()
  return {
    ...existing,
    // 三级兜底：用户填的 → 原来的 → 现场生成一个
    slug: input.slug?.trim() || existing.slug || `article-${Date.now()}`,
    title,
    media: normalizeMedia(input.media),
    summary: input.summary.trim(),
    // 正文可以是段落数组，也可以是一整段文字。是文字的话按空行切成段落——
    // 用户在文本框里敲回车分段，这里就把那个意图变成真正的段落结构。
    content: Array.isArray(input.content)
      ? input.content
      : String(input.content || '')
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(Boolean),
    // 标签：数组或逗号分隔的字符串都接受，去空格、去空项，
    // 再用 new Set 去重（Set 里同样的值只会存一份），最后展开回数组。
    tags: [
      ...new Set(
        (Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(','))
          .map(tag => String(tag).trim())
          .filter(Boolean),
      ),
    ],
    status: input.status,
    author: input.author?.trim() || existing.author || '林晓',
    publishedAt: input.publishedAt || existing.publishedAt || now.toISOString().slice(0, 10),
  }
}
