import { readFile } from 'node:fs/promises'

const files = {
  app: await readFile('src/App.vue', 'utf8'),
  list: await readFile('src/components/ArticleList.vue', 'utf8'),
  card: await readFile('src/components/ArticleCard.vue', 'utf8'),
  shell: await readFile('src/components/AppShell.vue', 'utf8'),
  netlify: await readFile('netlify.toml', 'utf8'),
  router: await readFile('src/router.js', 'utf8'),
  store: await readFile('src/stores/articles.js', 'utf8'),
  form: await readFile('src/views/ArticleFormView.vue', 'utf8'),
  articlesComposable: await readFile('src/composables/useArticles.js', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  articleApi: await readFile('src/services/articleApi.js', 'utf8'),
  contract: await readFile('docs/api-contract.md', 'utf8'),
  database: await readFile('server/database.js', 'utf8'),
  sqliteRepository: await readFile('server/repositories/sqliteArticleRepository.js', 'utf8'),
  migration: await readFile('database/migrations/001_initial.sql', 'utf8'),
  lesson10: await readFile('docs/lesson-10-teacher-guide.md', 'utf8'),
  auth: await readFile('server/services/auth.js', 'utf8'),
  login: await readFile('src/views/LoginView.vue', 'utf8'),
  authStore: await readFile('src/stores/auth.js', 'utf8'),
  mysqlDatabase: await readFile('server/mysqlDatabase.js', 'utf8'),
  mysqlRepository: await readFile('server/repositories/mysqlArticleRepository.js', 'utf8'),
  mysqlMigration: await readFile('database/mysql/migrations/001_initial.sql', 'utf8'),
  lesson11: await readFile('docs/lesson-11-teacher-guide.md', 'utf8'),
}

const rules = [
  ['组合式函数使用生命周期加载数据', /onMounted/.test(files.articlesComposable)],
  ['卡片通过 props 接收文章', /defineProps/.test(files.card)],
  ['卡片通过 emit 报告意图', /defineEmits/.test(files.card)],
  ['页面框架使用命名插槽', /slot name="navigation"/.test(files.shell)],
  ['列表处理 loading', /status === 'loading'/.test(files.list)],
  ['列表处理 empty', /status === 'empty'/.test(files.list)],
  ['列表处理 error 与重试', /status === 'error'/.test(files.list) && /retry/.test(files.list)],
  ['Netlify 指向 dist', /publish = "dist"/.test(files.netlify)],
  ['Netlify 配置 SPA fallback', /status = 200/.test(files.netlify)],
  ['学生静态托管配置有效，动态API由个人Ubuntu同源代理', !files.netlify.includes('47.120.') && files.netlify.includes('/index.html')],
  ['Router 包含动态编辑路由', /:id\/edit/.test(files.router)],
  ['Pinia store 集中保存文章', /defineStore/.test(files.store)],
  ['表单使用 v-model 与字段错误', /v-model/.test(files.form) && /field-error/.test(files.form)],
  ['Express 提供 health 和 REST CRUD', /app\.get\('\/health'/.test(files.server) && /app\.delete\('\/api\/articles\/:id'/.test(files.server)],
  ['前端通过 articleApi 访问服务', /\/api\/articles/.test(files.articleApi)],
  ['API 契约记录状态码与错误格式', /VALIDATION_ERROR/.test(files.contract) && /ARTICLE_NOT_FOUND/.test(files.contract)],
  ['SQLite 启用外键、WAL 和忙等待', /foreign_keys = ON/.test(files.database) && /journal_mode = WAL/.test(files.database) && /busy_timeout/.test(files.database)],
  ['迁移包含 users、articles、comments 三张业务表', /CREATE TABLE IF NOT EXISTS users/.test(files.migration) && /CREATE TABLE IF NOT EXISTS articles/.test(files.migration) && /CREATE TABLE IF NOT EXISTS comments/.test(files.migration)],
  ['SQLite 仓储实现分页与持久化 CRUD', /LIMIT \? OFFSET \?/.test(files.sqliteRepository) && /INSERT INTO articles/.test(files.sqliteRepository) && /DELETE FROM articles/.test(files.sqliteRepository)],
  ['第 10 次课指南包含迁移、备份、恢复演示', /db:migrate/.test(files.lesson10) && /db:backup/.test(files.lesson10) && /db:restore/.test(files.lesson10)],
  ['登录使用带 salt 的 scrypt 与签名过期令牌', /scryptSync/.test(files.auth) && /timingSafeEqual/.test(files.auth) && /createHmac/.test(files.auth) && /exp/.test(files.auth)],
  ['API 在服务器端区分 401 与 403', /AUTH_REQUIRED/.test(files.server) && /FORBIDDEN/.test(files.server) && /requireRole/.test(files.server)],
  ['前端包含登录表单、会话 store 与管理路由保护', /type="password"/.test(files.login) && /defineStore/.test(files.authStore) && /requiresAuth/.test(files.router)],
  ['MySQL 配置必须由环境变量提供', /MYSQL_PASSWORD/.test(files.mysqlDatabase) && /Missing environment variable/.test(files.mysqlDatabase)],
  ['MySQL 迁移包含三表、外键与 utf8mb4', /CREATE TABLE IF NOT EXISTS users/.test(files.mysqlMigration) && /FOREIGN KEY/.test(files.mysqlMigration) && /utf8mb4/.test(files.mysqlMigration)],
  ['MySQL repository 使用参数化 CRUD 与分页', /pool\.execute/.test(files.mysqlRepository) && /LIMIT \? OFFSET \?/.test(files.mysqlRepository)],
  ['第 11 次课指南包含权限、MySQL、Nginx 和回滚', /401/.test(files.lesson11) && /403/.test(files.lesson11) && /db:mysql:backup/.test(files.lesson11) && /Nginx/.test(files.lesson11) && /回滚/.test(files.lesson11)],
]

const failures = rules.filter(([, passed]) => !passed).map(([name]) => name)
if (failures.length) {
  console.error(`P2 v2.2 结构检查失败：\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`P2 v2.2 结构检查通过：${rules.length} 项规则全部满足。`)
