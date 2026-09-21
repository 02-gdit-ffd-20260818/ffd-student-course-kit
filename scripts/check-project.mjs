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
  ['Router 包含动态编辑路由', /:id\/edit/.test(files.router)],
  ['Pinia store 集中保存文章', /defineStore/.test(files.store)],
  ['表单使用 v-model 与字段错误', /v-model/.test(files.form) && /field-error/.test(files.form)],
  ['Express 提供 health 和 REST CRUD', /app\.get\('\/health'/.test(files.server) && /app\.delete\('\/api\/articles\/:id'/.test(files.server)],
  ['前端通过 articleApi 访问服务', /\/api\/articles/.test(files.articleApi)],
  ['API 契约记录状态码与错误格式', /VALIDATION_ERROR/.test(files.contract) && /ARTICLE_NOT_FOUND/.test(files.contract)],
]

const failures = rules.filter(([, passed]) => !passed).map(([name]) => name)
if (failures.length) {
  console.error(`P2 v2.0 结构检查失败：\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`P2 v2.0 结构检查通过：${rules.length} 项规则全部满足。`)
