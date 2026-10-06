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
  // ============ 第10课任务 01（后续预留，本课不要修改）（极简单）：先检查是否登录 ============
  // 【修改位置】只改下面 signed 函数，在 next() 前插入这一行：
  //   if (!req.user) return fail(res, 401, '请先登录')
  // req.user 是前面验签得到的用户；! 表示不存在；401 表示没有有效登录身份。
  // return 立即结束请求处理，不能拒绝后还调用 next()。
  // next() 表示通过检查，继续执行后面的评论接口。保留它和函数的大括号。
  // 起点缺少检查：匿名评论请求可能因读取 req.user.sub 报 500，并非成功发布。
  // 完成后用本课阶段检查验证匿名请求返回 401，登录用户仍可正常评论。
  // 此任务只保护 signed 对应的接口，不修改下面 admin 函数。
  // ====================================================
  function signed(req, res, next) {
    next()
  }
  // ============ 第10课任务 02（后续预留，本课不要修改）（简单）：再检查管理员角色 ============
  // 【修改位置】只改下面 admin 函数，在 next() 前按顺序插入两行：
  //   if (!req.user) return fail(res, 401, '请先登录')
  //   if (req.user.role !== 'admin') return fail(res, 403, '仅管理员可管理文章')
  // 先判断用户存在，再读 role，避免对空值读取属性。
  // !== 表示不相等；403 表示已登录但没有权限，与 401 含义不同。
  // 两项都通过才执行已有 next()；保留函数外壳和已完成的 signed。
  // 验收后端管理接口：匿名 401、普通用户 403、管理员正常执行。
  // 前端 /admin/articles 页面跳转属于 TODO 05，不能用它验收本项。
  // ====================================================
  function admin(req, res, next) {
    next()
  }
  // ============ 第11课任务 01（后续预留，本课不要修改）（极简单）：把媒体上传接口打开 ============
  // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
  // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
  // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
  // 现在条件为假，上传走 else 中的停用接口，管理员请求返回 503，
  // 管理员在文章编辑页选了图片也传不上去。
  //
  // 本项完成后：管理员上传 PNG 从 503 变为 400（类型未开放）。
  // 这证明进入了上传处理；TODO 02 填白名单后才会成功返回 201。
  //
  // 本任务要补全：改回 if (db.driver === 'SQLite') {
  //
  // 为什么要有这个条件：上传的文件要落到磁盘上。
  // Netlify、Vercel 这类平台的服务器是**用完即弃**的，
  // 你传上去的文件下一次请求可能就找不到了。
  // SQLite 是本工程启用此处理分支的标记，不等于磁盘一定持久化。
  // Ubuntu 部署时还要确保 MEDIA_PATH 指向可写且保留的目录。
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
    // ============ 第10课任务 04（后续预留，本课不要修改）（简单）：编号只能是正整数 ============
    // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
    // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
    // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
    // app.param 是 Express 的一个便利功能：**凡是路径里带 :id 的接口，
    // 都会先经过这里**，不用在每个接口里各写一遍。
    //
    // 验收要请求 /api/articles/abc 等 API 地址，完成后返回 400。
    // 浏览器页面 /articles/:slug 使用文章链接名，不能拿它验证数字 id。
    //
    // 本任务要补全：补上校验
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
      // ============ 第08课 TODO 02（简单）：草稿不能给游客看见 ============
      // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
      // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
      // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
      // 现在所有人都能看到全部文章，包括还没写完的草稿。
      //
      // 页面上看得到的结果：用管理员账号登录，首页能看到草稿；
      // **退出登录再刷新，草稿就消失了**。这是本课最直观的一个效果。
      //
      // 本任务要补全：按角色给出两条不同的 SQL：
      //   管理员：SELECT * FROM articles ORDER BY id
      //   其他人：SELECT * FROM articles WHERE status='published' ORDER BY id
      //
      // **权限判断必须放在后端。** 前端"把草稿藏起来不显示"是没用的——
      // 数据已经发到浏览器了，F12 一看就全在。
      // 真正的做法是：不该给的数据，一开始就不要查出来。
      //
      // 怎么亲眼看到：F12 → Network → /api/articles 的响应里，
      // 游客身份下**根本没有草稿那几条**。
      // ====================================================
      'SELECT * FROM articles ORDER BY id',
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
          // ============ 第08课 TODO 04（中等）：把文章真的写进数据库 ============
          // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
          // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
          // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
          // 页面上看得到的结果：在管理页新建一篇文章点保存，
          // **列表里真的多出一篇**；重启后端再看，它还在。
          //
          // 本任务要补全：补全两条参数化 SQL（新增用 INSERT，修改用 UPDATE）：
          //   POST：INSERT INTO articles(九个列名)
          //         VALUES($1,...,$9) RETURNING *
          //   PUT ：UPDATE articles SET 九个列=$1..$9
          //         WHERE id=$10 RETURNING *
          //
          // 三个要点：
          //   1) $1—$9 与上面 values 数组**逐项对应**，顺序不能乱
          //   2) RETURNING * 让数据库把写完之后那一行返回给我们，
          //      省掉一次额外的 SELECT
          //   3) PUT 多一个 $10 是 id，所以上面有一行
          //      if (method === 'put') values.push(Number(req.params.id))
          //
          // **绝对不要用字符串拼接 SQL。** 标题里写一段 SQL 就能操作你的数据库。
          // ====================================================
          'SELECT 1'
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
    // ============ 第08课 TODO 05（中等）：删掉不存在的东西要说清楚 ============
    // 【参数拆解】fail(res, 状态码, 提示文字) 是项目提供的响应函数；res 代表本次响应，400 是输入不合规则，401 是未登录，403 是无权操作，409 是资源冲突。前面的 return 会立刻结束当前处理函数。
    // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
    // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
    // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
    // 页面上看得到的结果：在管理页删掉一篇文章，**列表里立刻少一篇**；
    // 如果这篇已经被别人删过了，提示「文章不存在」而不是假装成功。
    //
    // 本任务要补全：补上两句
    //   if (!rows.length) return fail(res, 404, '文章不存在')
    //   res.sendStatus(204)
    //
    // 上面那条 DELETE 用了 RETURNING id：真的删掉了才会返回一行，
    // 什么都没删返回空数组——靠它就能分辨"删成功"和"本来就没有"。
    //
    // 204 是"成功，但没有内容要返回"。删除成功后没什么好给的，
    // 用 204 比返回 200 加一个空对象更准确。
    // ========================================================
    res.sendStatus(204)
  })
  // ============ 第09课任务 02（后续预留，本课不要修改）（简单）：草稿不能被评论 ============
  // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
  // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
  // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
  // 草稿还没发布，别人本来就不该看到，更不该能评论。
  //
  // 页面上看得到的结果：退出登录后，直接访问一篇草稿的地址，
  // 页面提示「文章不存在」，评论框也不会出现。
  //
  // 本任务要补全：补全这个小函数，它回答"这篇文章是不是已发布状态"：
  //   SELECT id FROM articles WHERE id=$1 AND status='published'
  //   查到了返回 true，查不到返回 false
  //
  // 它被下面两个接口共用（读评论、发评论）。
  // **把重复的判断抽成一个函数**，比在两处各写一遍更不容易漏。
  // ================================================
  async function published(id) {
    return true
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
    // ============ 第09课任务 03（后续预留，本课不要修改）（简单）：空评论和超长评论都要挡 ============
    // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
    // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
    // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
    // 页面上看得到的结果：评论框什么都不填直接点发表，
    // 提示「评论请输入1—1000字」，而不是发出一条空评论。
    //
    // TODO 两步：
    //   1) 先确认它**真的是字符串**再 trim：
    //      typeof req.body?.body === 'string' ? req.body.body.trim() : ''
    //      不判断类型直接 .trim()，别人发一个数字过来就会 500。
    //   2) 空的或超过 1000 字，返回 400
    //
    // TODO 01 里数据库也有 CHECK(length(body) BETWEEN 1 AND 1000)。
    // 两道防线的分工和第 07 课一样：**数据库保证数据不会错，
    // 代码负责给人说人话。**
    // ======================================================
    const body = String(req.body?.body ?? '')
    const count = await db.query('SELECT COUNT(*) AS total FROM comments WHERE user_id=$1', [
      req.user.sub,
    ])
    if (Number(count[0].total) >= 200) return fail(res, 429, '评论数量已达体验上限')
    // ============ 第09课任务 04（后续预留，本课不要修改）（中等）：把评论写进数据库 ============
    // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
    // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
    // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
    // 页面上看得到的结果：**在文章页发一条评论，页面上立刻多一条，
    // 而且带着你的昵称**；刷新页面它还在；重启后端它也还在。
    //
    // 本任务要补全：参数化插入并返回 201
    //   INSERT INTO comments(article_id,user_id,body)
    //   VALUES($1,$2,$3) RETURNING id
    //   参数依次是 [Number(req.params.id), req.user.sub, body]
    //
    // 注意 user_id 用的是 **req.user.sub**，也就是令牌里的用户编号，
    // **不是前端传上来的**。前端传什么都不能信——
    // 否则别人改一个数字就能冒充你发评论。
    //
    // 怎么亲眼看到：npm run db:inspect 最后会打印最近 10 条评论，
    // 里面有文章标题和评论者昵称，能看到你刚发的那条。
    // ==================================================
    res.status(201).json({ data: { id: 0 } })
  })
  // 普通用户只能删除自己的评论；管理员可以执行内容治理。
  app.delete('/api/comments/:id', signed, async (req, res) => {
    const [c] = await db.query('SELECT user_id FROM comments WHERE id=$1', [Number(req.params.id)])
    // ============ 第10课任务 03（后续预留，本课不要修改）（简单）：只能删自己的评论 ============
    // 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
    // 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
    // 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
    // 现在任何登录用户都能删掉别人的评论——只要猜一个评论编号。
    //
    // 本项改变后端：用普通账号令牌删除别人的评论，返回 403。
    // 前端原本就按身份隐藏按钮，不能用按钮变化验收本项。
    //
    // 本任务要补全：补上两条判断
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
