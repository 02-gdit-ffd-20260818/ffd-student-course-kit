import express from 'express'
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  verifyAccessToken,
  readBearerToken,
} from './services/auth.js'
import { validateArticleInput, toArticleRecord } from './services/articleInput.js'
import { mediaUpload } from './media-upload.js'

// 把 SQLite 的下划线字段和 JSON 文本转换成前端容易使用的文章对象。
const article = a => ({
  id: Number(a.id),
  slug: a.slug,
  title: a.title,
  summary: a.summary,
  content: JSON.parse(a.content_json),
  media: JSON.parse(a.media_json || '[]'),
  tags: JSON.parse(a.tags_json),
  status: a.status,
  author: a.author,
  publishedAt: a.published_at,
})
const user = u => ({
  id: Number(u.id),
  username: u.username,
  displayName: u.display_name,
  role: u.role,
})
// Express 是 HTTP 层：接收浏览器请求、检查身份与权限、调用 SQLite，再返回 JSON。
export function createBlogApp(db, secret, options = {}) {
  if (!secret || secret.length < 32) throw new Error('请设置至少32字符 SESSION_SECRET')
  const app = express(),
    attempts = new Map()
  // express.json() 把请求中的 JSON 正文解析为 req.body，并限制请求体大小。
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))
  // 全局中间件在每个接口前读取 Bearer 令牌；验证成功后把用户放入 req.user。
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    res.set('X-Content-Type-Options', 'nosniff')
    req.user = verifyAccessToken(readBearerToken(req.get('authorization')), secret)
    next()
  })
  const fail = (res, status, message) => res.status(status).json({ error: { message } })
  // signed 只检查是否登录；admin 还会检查角色是否为管理员。
  // ============ TODO 01、02：两个把门的中间件 ============
  // 现在这两个中间件直接放行，等于**所有接口都没有保护**：
  // 没登录的人能发评论，普通用户能删别人的文章。
  //
  // 页面上看得到的结果：
  //   TODO 01 做完：退出登录后发评论，提示「请先登录」
  //   TODO 02 做完：用普通账号访问 /admin/articles，被挡下来
  //
  // TODO 01 —— signed（只问"登录了吗"）：
  //   没有 req.user → 401「请先登录」
  //
  // TODO 02 —— admin（还要问"是不是管理员"）：
  //   没有 req.user        → 401「请先登录」
  //   角色不是 admin       → 403「仅管理员可管理文章」
  //
  // **401 和 403 的区别是本课考点**：
  //   401 = 我不知道你是谁（没登录，或令牌无效／过期）
  //   403 = 我知道你是谁，但你不能干这个（登录了，权限不够）
  // 用错了前端就会做错事：收到 401 该跳登录页，收到 403 跳登录页毫无意义。
  //
  // 这两个函数写在一处，被十几个接口共用——这就是中间件的价值。
  // ====================================================
  function signed(req, res, next) {
    next()
  }
  function admin(req, res, next) {
    next()
  }
  // ============ TODO 01（极简单）：把媒体上传接口打开 ============
  // 现在这个条件永远为假，媒体上传相关的路由**一条都没注册**，
  // 管理员在文章编辑页选了图片也传不上去。
  //
  // 页面上看得到的结果：文章编辑页选一张图片点上传，
  // **图片真的传上去并显示在文章里**，而不是提示接口不存在。
  //
  // TODO：改回 if (db.driver === 'SQLite') {
  //
  // 为什么要有这个条件：上传的文件要落到磁盘上。
  // Netlify、Vercel 这类平台的服务器是**用完即弃**的，
  // 你传上去的文件下一次请求可能就找不到了。
  // 只有用 SQLite、并且部署在自己服务器上时，才有可持久化的磁盘。
  //
  // 这也是本课要讲的一件事：**同一份代码，在不同的部署环境下
  // 能力是不一样的**，要在代码里把这件事表达出来，而不是装作没有区别。
  // ====================================================
  if (false) {
    const media = mediaUpload(options.mediaPath)
    app.post('/api/media/upload', admin, media.upload, media.save)
    app.use(
      '/media/uploads',
      express.static(media.directory, {
        dotfiles: 'ignore',
        index: false,
        fallthrough: false,
        setHeaders(res) {
          res.set('Cache-Control', 'public, max-age=86400')
          res.set('X-Content-Type-Options', 'nosniff')
        },
      }),
    )
  } else
    app.post('/api/media/upload', admin, (req, res) =>
      fail(res, 503, '此在线环境尚未配置持久化文件存储，请使用HTTPS媒体链接'),
    )
  // 对注册和登录做简单频率限制，避免单个地址短时间大量尝试。
  app.use('/api/auth', (req, res, next) => {
    const key = req.ip,
      now = Date.now()
    if (attempts.size > 2000) attempts.clear()
    let a = attempts.get(key)
    if (!a || now - a.time > 600000) a = { time: now, count: 0 }
    a.count++
    attempts.set(key, a)
    if (a.count > 40) return fail(res, 429, '操作过于频繁，请稍后重试')
    next()
  })
  app.param('id', (req, res, next, value) => {
    // ============ TODO 04（简单）：编号只能是正整数 ============
    // app.param 是 Express 的一个便利功能：**凡是路径里带 :id 的接口，
    // 都会先经过这里**，不用在每个接口里各写一遍。
    //
    // 页面上看得到的结果：地址栏把文章编号改成 abc 或 -1，
    // 页面提示「编号格式不正确」，而不是后端抛一个 500。
    //
    // TODO：补上校验
    //   !/^[1-9][0-9]*$/.test(value)          必须是不以 0 开头的正整数
    //   || !Number.isSafeInteger(Number(value))  还不能大到超出安全整数范围
    //   → fail(res, 400, '编号格式不正确')
    //
    // 为什么要查"安全整数"？JavaScript 的数字超过 2^53 就会丢精度，
    // 传一个超长数字进来，Number(...) 得到的值和你以为的不是一回事。
    //
    // 这类"在入口统一把好关"的做法，能省掉后面十几处重复判断。
    // ==================================================
    next()
  })
  // 健康检查会真实执行 SELECT 1，因此能同时验证 Express 与 SQLite。
  app.get('/health', async (req, res) => {
    await db.query('SELECT 1')
    res.json({ ok: true, database: db.driver, project: 'P2内容发布平台v4.0' })
  })
  // 注册：校验输入 → 检查重名 → 生成盐和摘要 → 写入 users → 返回令牌。
  app.post('/api/auth/register', async (req, res) => {
    const username = String(req.body?.username || '')
        .trim()
        .toLowerCase(),
      displayName = String(req.body?.displayName || '').trim(),
      password = req.body?.password
    if (
      !/^[a-z0-9_]{3,24}$/.test(username) ||
      !displayName ||
      displayName.length > 24 ||
      typeof password !== 'string' ||
      password.length < 12 ||
      password.length > 128
    )
      return fail(res, 400, '用户名3—24位字母/数字/下划线，昵称1—24字，密码12—128字符')
    if ((await db.query('SELECT id FROM users WHERE username=$1', [username])).length)
      return fail(res, 409, '用户名已被使用')
    const { salt, hash } = hashPassword(password)
    const [u] = await db.query(
      'INSERT INTO users(username,display_name,password_salt,password_hash) VALUES($1,$2,$3,$4) RETURNING *',
      [username, displayName, salt, hash],
    )
    res.status(201).json({ data: { token: createAccessToken(user(u), secret), user: user(u) } })
  })
  // 登录：查询用户 → 验证密码摘要 → 返回包含用户编号和角色的令牌。
  app.post('/api/auth/login', async (req, res) => {
    const username = String(req.body?.username || '')
        .trim()
        .toLowerCase(),
      password = req.body?.password
    if (typeof password !== 'string' || password.length > 128)
      return fail(res, 401, '用户名或密码不正确')
    const [u] = await db.query('SELECT * FROM users WHERE username=$1', [username])
    if (!u || !verifyPassword(password, u.password_salt, u.password_hash))
      return fail(res, 401, '用户名或密码不正确')
    res.json({ data: { token: createAccessToken(user(u), secret), user: user(u) } })
  })
  // 游客只看到已发布文章；管理员可以看到草稿，权限判断必须放在后端。
  app.get('/api/articles', async (req, res) => {
    const rows = await db.query(
      req.user?.role === 'admin'
        ? 'SELECT * FROM articles ORDER BY id'
        : "SELECT * FROM articles WHERE status='published' ORDER BY id",
    )
    res.json({ data: rows.map(article) })
  })
  app.get('/api/articles/:id', async (req, res) => {
    const [a] = await db.query('SELECT * FROM articles WHERE id=$1', [Number(req.params.id)])
    if (!a || (a.status !== 'published' && req.user?.role !== 'admin'))
      return fail(res, 404, '文章不存在')
    res.json({ data: article(a) })
  })
  // 新增与修改共用校验和参数化 SQL；参数数组避免把输入直接拼进 SQL。
  for (const method of ['post', 'put'])
    app[method](
      method === 'post' ? '/api/articles' : '/api/articles/:id',
      admin,
      async (req, res) => {
        const errors = validateArticleInput(req.body)
        if (Object.keys(errors).length)
          return res.status(400).json({ error: { message: '请检查文章内容', fields: errors } })
        const a = toArticleRecord(req.body),
          values = [
            a.slug,
            a.title,
            a.summary,
            JSON.stringify(a.content),
            JSON.stringify(a.tags),
            a.status,
            a.author,
            a.publishedAt,
            JSON.stringify(a.media || []),
          ]
        const sql =
          method === 'post'
            ? 'INSERT INTO articles(slug,title,summary,content_json,tags_json,status,author,published_at,media_json) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *'
            : 'UPDATE articles SET slug=$1,title=$2,summary=$3,content_json=$4,tags_json=$5,status=$6,author=$7,published_at=$8,media_json=$9 WHERE id=$10 RETURNING *'
        if (method === 'put') values.push(Number(req.params.id))
        const [row] = await db.query(sql, values)
        if (!row) return fail(res, 404, '文章不存在')
        res.status(method === 'post' ? 201 : 200).json({ data: article(row) })
      },
    )
  app.delete('/api/articles/:id', admin, async (req, res) => {
    const rows = await db.query('DELETE FROM articles WHERE id=$1 RETURNING id', [
      Number(req.params.id),
    ])
    if (!rows.length) return fail(res, 404, '文章不存在')
    res.sendStatus(204)
  })
  async function published(id) {
    return (
      (await db.query("SELECT id FROM articles WHERE id=$1 AND status='published'", [Number(id)]))
        .length > 0
    )
  }
  // JOIN 把 comments.user_id 对应到 users.display_name，返回评论者昵称。
  app.get('/api/articles/:id/comments', async (req, res) => {
    if (!(await published(req.params.id))) return fail(res, 404, '文章不存在')
    const rows = await db.query(
      'SELECT c.id,c.user_id,c.body,c.created_at,u.display_name FROM comments c JOIN users u ON u.id=c.user_id WHERE c.article_id=$1 ORDER BY c.id DESC LIMIT 200',
      [Number(req.params.id)],
    )
    res.json({
      data: rows.map(c => ({
        id: Number(c.id),
        userId: Number(c.user_id),
        body: c.body,
        createdAt: c.created_at,
        author: c.display_name,
      })),
    })
  })
  app.post('/api/articles/:id/comments', signed, async (req, res) => {
    if (!(await published(req.params.id))) return fail(res, 404, '文章不存在')
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
    if (!body || body.length > 1000) return fail(res, 400, '评论请输入1—1000字')
    const count = await db.query('SELECT COUNT(*) AS total FROM comments WHERE user_id=$1', [
      req.user.sub,
    ])
    if (Number(count[0].total) >= 200) return fail(res, 429, '评论数量已达体验上限')
    const [row] = await db.query(
      'INSERT INTO comments(article_id,user_id,body) VALUES($1,$2,$3) RETURNING id',
      [Number(req.params.id), req.user.sub, body],
    )
    res.status(201).json({ data: { id: Number(row.id) } })
  })
  // 普通用户只能删除自己的评论；管理员可以执行内容治理。
  app.delete('/api/comments/:id', signed, async (req, res) => {
    const [c] = await db.query('SELECT user_id FROM comments WHERE id=$1', [Number(req.params.id)])
    // ============ TODO 03（简单）：只能删自己的评论 ============
    // 现在任何登录用户都能删掉别人的评论——只要猜一个评论编号。
    //
    // 页面上看得到的结果：用普通账号登录，**别人评论上的删除按钮不会出现**；
    // 就算用 curl 直接调接口，也会被 403 挡住。
    //
    // TODO：补上两条判断
    //   查不到这条评论                 → 404「评论不存在」
    //   不是自己的、而且自己不是管理员 → 403「只能删除自己的评论」
    //
    // **注意 Number(...) 转换。** 令牌里的 sub 和数据库里的 user_id，
    // 一个可能是字符串 "3"，一个是数字 3，用 !== 直接比会**永远不相等**，
    // 结果就是所有人都删不了自己的评论。这个坑很隐蔽，一定要转成同一种类型再比。
    //
    // 另外注意：前端把删除按钮藏起来是**体验**，后端这条判断才是**安全**。
    // 藏按钮挡不住 curl。
    // ==================================================
    if (!c) return fail(res, 404, '评论不存在')
    await db.query('DELETE FROM comments WHERE id=$1', [Number(req.params.id)])
    res.sendStatus(204)
  })
  app.use((req, res) => fail(res, 404, '接口不存在'))
  // 统一错误处理把异常转换为稳定的 HTTP 状态码和 JSON。
  app.use((error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') return fail(res, 413, '文件不能超过40MB')
    if (error.status === 400 || error.code?.startsWith('LIMIT_'))
      return fail(res, 400, error.message || '上传格式不正确')
    if (error.status === 404) return fail(res, 404, '媒体文件不存在')
    if (error instanceof SyntaxError) return fail(res, 400, '请求格式不正确')
    if (error.code === '23505' || String(error.message).includes('UNIQUE constraint'))
      return fail(res, 409, '用户名或文章地址重复')
    fail(res, 500, '服务暂时不可用，请重试')
  })
  return app
}
