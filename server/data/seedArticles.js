export const seedArticles = [
  {
    "id": 1,
    "slug": "vue-components",
    "title": "把文章列表拆成 Vue 组件",
    "summary": "组件、props 与循环渲染",
    "content": [
      "本课目标：把一页博客拆成页面框架、文章列表、文章卡片和文章详情。先让页面可读，再讨论抽象；每个组件只承担一个明确任务。",
      "操作一：打开 src/components/ArticleCard.vue，找到 defineProps；文章由父组件传入，子组件只负责显示。修改标题旁的标签排版，不直接修改传入的文章。",
      "操作二：在文章列表使用 v-for=\"article in articles\"，用 :key=\"article.id\" 保持稳定身份。将 :article=\"article\" 传给卡片，用 {{ article.title }} 输出文字。",
      "知识解释：HTML 提供语义结构，CSS 控制布局，Vue 将数据绑定到页面。props 是父到子的输入；用户点击通过事件表达意图，避免组件偷偷修改其他组件的数据。",
      "验收：新增一篇文章后卡片自动出现；修改数据标题后页面同步变化；手机宽度下卡片不出现横向滚动。提交：git add . 后执行 git commit -m \"feat: complete article cards\"。"
    ],
    "tags": [
      "Vue",
      "组件"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组"
  },
  {
    "id": 2,
    "slug": "router-detail",
    "title": "用路由连接列表与文章详情",
    "summary": "路由参数、计算属性与页面状态",
    "content": [
      "本课目标：列表中的每篇文章都有独立地址，用户可以直接打开、刷新或分享该地址。",
      "打开 src/router.js，观察 /articles/:slug；冒号表示动态参数。ArticleView 接收 slug，再从文章数据中查找匹配项。RouterLink 负责站内跳转，不必手动拼接整个域名。",
      "在详情页加入返回列表入口。测试四种状态：正在加载、正常文章、空列表、文章不存在；失败信息应给出可执行的下一步，而不是永久显示“加载中”。",
      "部署要点：SPA 的详情地址需要服务器回退到 index.html；静态资源和 /api 请求必须优先匹配，不能让所有请求都返回 HTML。",
      "验收：从列表打开文章，再复制地址到新标签页，刷新后仍然显示同一篇文章；不存在的 slug 显示友好的返回入口。"
    ],
    "tags": [
      "Vue",
      "路由"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组"
  },
  {
    "id": 3,
    "slug": "forms-api",
    "title": "从表单走到 HTTP 接口",
    "summary": "双向绑定、输入校验与请求响应",
    "content": [
      "本课目标：教师填写文章表单后，浏览器把数据提交给后端；列表重新读取保存结果。页面显示成功不等于数据库已经保存。",
      "打开 src/views/ArticleFormView.vue，观察 v-model、submit.prevent 和字段错误。标题、摘要、正文、标签分别收集，发送前检查必填内容。",
      "HTTP 分工：GET /api/articles 查询；POST /api/articles 新增；PUT /api/articles/:id 更新；DELETE /api/articles/:id 删除。写入接口要求教师身份。",
      "打开浏览器 F12 的 Network，提交一次表单，查看请求方法、JSON 内容和状态码。201 表示创建成功；400 表示输入错误；401 表示未登录；403 表示没有权限。",
      "验收：空标题无法保存；网络失败后保留输入；同一次提交过程中按钮禁用；成功后重新读取列表并看到文章。"
    ],
    "tags": [
      "HTTP",
      "表单"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组"
  },
  {
    "id": 4,
    "slug": "database-relations",
    "title": "让用户、文章与评论真正入库",
    "summary": "SQL、主键、外键与参数化查询",
    "content": [
      "本课目标：浏览器关闭后数据依然存在。课堂使用真实 SQLite 文件，后端负责读写，前端不能直接接触数据库密码。",
      "数据结构：course_users 保存账号和密码摘要；course_articles 保存文章；course_comments 保存 article_id、user_id 和评论正文。一篇文章可以有多条评论，一个用户可以发表多条评论。",
      "查询示例：\nSELECT c.body, u.display_name\nFROM course_comments c\nJOIN course_users u ON u.id = c.user_id\nWHERE c.article_id = ?;\n问号的位置由驱动绑定参数，用户输入不拼接到 SQL 字符串。",
      "打开 server/course-db.js，找到 CREATE TABLE 和 REFERENCES。删除文章时 ON DELETE CASCADE 清理所属评论；用户名 UNIQUE 防止重复注册。数据库文件位于 var/course-blog.sqlite，不提交到 Git。",
      "验收：注册后发表一条评论，刷新页面仍然可见；重启后端后评论仍在；另一位用户不能删除这条评论。"
    ],
    "tags": [
      "数据库",
      "SQL"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组"
  },
  {
    "id": 5,
    "slug": "auth-comments",
    "title": "注册、登录和文章下的文字评论",
    "summary": "密码摘要、令牌与权限",
    "content": [
      "本课目标：访客可以阅读文章和评论；注册登录后可以留言；用户只删除自己的留言；教师可以管理文章与评论。",
      "注册流程：填写用户名、昵称、密码，POST /api/auth/register；服务器验证数据，保存加盐密码摘要，返回用户信息和访问令牌。服务端不会返回密码摘要。",
      "登录流程：POST /api/auth/login，后端验证密码。后续请求把令牌放在 Authorization: Bearer … 请求头；服务端再次验证身份和权限，隐藏按钮不能代替权限检查。",
      "评论流程：打开 src/components/ArticleComments.vue；GET 加载评论，POST 发送 1—1000 字文本，DELETE 删除自己的评论。Vue 用文本插值显示评论，用户输入的 HTML 不作为代码执行。",
      "验收：退出后无法留言；重复用户名得到明确提示；甲不能删除乙的评论；刷新后仍能看到已保存的留言。"
    ],
    "tags": [
      "登录",
      "评论"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组"
  },
  {
    "id": 6,
    "slug": "git-deploy",
    "title": "把课堂成果提交并部署",
    "summary": "Git 版本记录、环境变量与发布验收",
    "content": [
      "本课目标：同学能够在自己的仓库中留下完整修改记录，并通过网址向别人展示成果。",
      "Windows CMD / PowerShell 在工程目录执行：\ngit status\ngit add .\ngit commit -m \"feat: complete blog comments\"\ngit push origin HEAD\n依次表示检查文件、暂存修改、建立版本、推送当前分支。首次推送先设置自己的远程仓库。",
      "提交前确认 .env、var 数据库、node_modules 不在暂存区。前端 npm run build 产生 dist；后端需要 Node 运行环境和持久化数据目录，不能只上传 dist 就期待登录评论工作。",
      "Ubuntu 部署分工：Nginx 提供前端页面并反向代理 /api，Node 提供接口，数据库保存数据。SESSION_SECRET 和管理员密码只写入服务器环境配置。",
      "发布验收：匿名访问列表与详情；新账号注册登录；发表评论并刷新；检查他人无权删除；重启后端验证数据仍然存在。标记版本前记录部署地址和测试结果。"
    ],
    "tags": [
      "Git",
      "部署"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组"
  },
  {
    "id": 7,
    "slug": "html5-media",
    "title": "在文章中加入图片、音乐与视频",
    "summary": "用HTML5原生标签，让资源地址、页面展示和数据库记录连起来。",
    "content": [
      "本课目标：先用一张图解释“浏览器→接口→数据库”，再添加音频和视频。媒体使用结构化字段，不把任意HTML粘贴进正文。下面的示例文件随工程提供，可以在本机直接播放。",
      "图片：打开src/components/ArticleMedia.vue，观察<img :src=\"item.url\" :alt=\"item.alt\" loading=\"lazy\">。src告诉浏览器从哪里获取图片；alt说明图像内容；CSS的width:100%使图片适应文章宽度。",
      "音频与音乐：<audio controls preload=\"metadata\">提供浏览器原生播放器。用户主动点击播放；先读取时长等元数据，避免打开文章时就下载所有内容。这段音频为本工程生成的四个音符。",
      "视频：<video controls playsinline preload=\"metadata\">在手机页面内播放。这段6秒无声演示依次显示浏览器发请求、接口验证和数据库保存；下面的文字说明也可作为视频的内容替代。",
      "操作步骤：教师登录→管理→新建或编辑文章→添加媒体→选择类型→填写/media/路径或HTTPS资源链接，或上传本机文件→填写说明及图片替代文字→指定段落序号→保存→打开详情验收。上传文件最多40MB，使用MP4/H.264视频便于浏览器播放。",
      "工程知识：浏览器把媒体作为独立HTTP请求获取，数据库保存的是媒体地址和说明；上传文件保存在var/media，图片、音频和视频本身不会塞进评论表。升级文章表增加media_json字段时，保留已有文章、用户及评论。",
      "验收：图片不变形；音频和视频可主动播放、暂停、拖动；刷新仍有媒体；错误资源给出失败提示；手机宽度不溢出；普通读者不能上传文件。课堂基础只讲三种标签与路径，文件上传作为教师演示和选做任务。"
    ],
    "tags": [
      "HTML5",
      "媒体"
    ],
    "status": "published",
    "publishedAt": "2026-09-18",
    "author": "课程教学组",
    "media": [
      {
        "type": "image",
        "url": "/media/course-diagram.png",
        "alt": "评论从浏览器提交，经Node验证后保存到SQLite数据库",
        "caption": "图：一次评论提交经过三个层次",
        "afterParagraph": 1
      },
      {
        "type": "audio",
        "url": "/media/learning-notes.wav",
        "caption": "音乐示例：本工程生成的四个音符，无需外链",
        "afterParagraph": 3
      },
      {
        "type": "video",
        "url": "/media/comment-flow.mp4",
        "caption": "无声视频：浏览器发请求→接口验证→数据库保存，依次突出三个步骤",
        "afterParagraph": 4
      }
    ]
  }
]
