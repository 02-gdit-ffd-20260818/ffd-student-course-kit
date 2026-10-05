// 第07课专用公网入口。不要把带后续权限占位的 blog-index.js 直接暴露到公网。
// 本文件由教师提供：开放认证与已发布文章阅读，拒绝后续课的写入/上传接口。
import express from 'express'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { openBlogDb } from '../server/blog-db.js'
import { createBlogApp } from '../server/blog-app.js'
import { checkLesson07, checkUsersSchema } from './check-lesson07.mjs'

export function createLesson07App(db, secret, { frontendOrigin = '', dist = resolve('dist') } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff')
    // 默认同源无需 CORS。分离部署时仅放行配置的精确来源，不使用通配符。
    if (frontendOrigin && req.get('origin') === frontendOrigin) {
      res.set('Access-Control-Allow-Origin', frontendOrigin)
      res.vary('Origin')
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    }
    if (req.method === 'OPTIONS') return res.sendStatus(frontendOrigin && req.get('origin') === frontendOrigin ? 204 : 403)
    next()
  })
  const inner = createBlogApp(db, secret)
  app.use(async (req, res, next) => {
    if (req.method === 'GET' && req.path === '/health') return inner(req, res, next)
    if (req.method === 'POST' && ['/api/auth/register', '/api/auth/login'].includes(req.path)) return inner(req, res, next)
    // 已发布文章是本课阅读素材。这里独立过滤，不能依赖第08课尚未完成的占位查询。
    if (req.method === 'GET' && (req.path === '/api/articles' || /^\/api\/articles\/\d+$/.test(req.path))) {
      res.set('Cache-Control', 'no-store')
      const id = req.path === '/api/articles' ? null : Number(req.path.split('/').at(-1))
      const rows = await db.query("SELECT * FROM articles WHERE status='published'" + (id === null ? ' ORDER BY id' : ' AND id=$1'), id === null ? [] : [id])
      const articles = rows.map(row => ({ id: Number(row.id), slug: row.slug, title: row.title,
        summary: row.summary, content: JSON.parse(row.content_json), tags: JSON.parse(row.tags_json),
        media: JSON.parse(row.media_json || '[]'), status: row.status, author: row.author, publishedAt: row.published_at }))
      if (id !== null && !articles.length) return res.status(404).json({ error: { message: '文章不存在' } })
      return res.json({ data: id === null ? articles : articles[0] })
    }
    if (req.method === 'GET' && /^\/api\/articles\/\d+\/comments$/.test(req.path)) return res.json({ data: [] })
    if (req.path.startsWith('/api/') || req.path === '/api' || req.path.startsWith('/media/uploads'))
      return res.status(403).json({ error: { message: '第07课上线体验仅开放注册、登录和文章阅读；其他操作留待后续课程。' } })
    next()
  })
  // 只提供构建产物；不提供项目根目录，.env、数据库和源代码不能下载。
  app.use(express.static(dist, { dotfiles: 'deny' }))
  app.use((req, res) => {
    if (req.method === 'GET' && !req.path.includes('.') && existsSync(resolve(dist, 'index.html')))
      return res.sendFile(resolve(dist, 'index.html'))
    res.sendStatus(404)
  })
  app.use((error, req, res, next) => { console.error(error.message); res.status(500).json({ error: { message: '服务器错误，请查看服务日志' } }) })
  return app
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // 先确认当前代码做完四项任务，再检查实际持久库；未达标拒绝上线。
  await checkLesson07(4)
  const db = await openBlogDb()
  try {
    await checkUsersSchema(db)
    const app = createLesson07App(db, process.env.SESSION_SECRET, { frontendOrigin: process.env.FRONTEND_ORIGIN || '' })
    const port = Number(process.env.PORT || 3000)
    const server = app.listen(port, '127.0.0.1', () => console.log(`lesson07 ready: http://127.0.0.1:${port}`))
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await db.close(); process.exit(0) }))
  } catch (error) { await db.close(); throw error }
}
