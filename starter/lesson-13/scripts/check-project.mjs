import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const files = {
  app: read('src/App.vue'),
  card: read('src/components/MemberCard.vue'),
  filters: read('src/components/MemberFilters.vue'),
  chart: read('src/components/SkillChart.vue'),
  collaboration: read('src/components/CollaborationPanel.vue'),
  domain: read('src/domain/member.js'),
  data: read('src/data/members.js'),
  css: read('src/styles.css'),
  dictionary: read('docs/field-dictionary.md'),
  privacy: read('docs/privacy-and-consent.md'),
  ci: read('.github/workflows/ci.yml'),
  netlify: read('netlify.toml'),
  server: read('server/app.js'),
  workflow: read('server/workflow.js'),
  csv: read('server/csv.js'),
  sqlite: read('server/sqliteDatabase.js'),
  mysql: read('server/mysqlDatabase.js'),
  mysqlMigration: read('database/mysql/migrations/001_initial.sql'),
  env: read('.env.example'),
}

const checks = [
  ['版本入口标记为 P3 v2.0', /P3 · v2\.0/.test(files.app)],
  ['至少 8 条成员教学数据', (files.data.match(/id: 'm\d+'/g) ?? []).length >= 8],
  ['资料公开前检查授权', /profileConsent/.test(files.domain)],
  ['公开对象使用字段白名单', /publicKeys/.test(files.domain)],
  ['空值有展示回退', /地点未公开/.test(files.domain)],
  ['技能去重并过滤空值', /new Set/.test(files.domain) && /filter\(Boolean\)/.test(files.domain)],
  ['头像具有尺寸、alt 和失败回退', /width="112"/.test(files.card) && /:alt=/.test(files.card) && /@error=/.test(files.card)],
  ['移动端响应式布局', /@media \(max-width: 720px\)/.test(files.css)],
  ['减少动态效果偏好受尊重', /prefers-reduced-motion/.test(files.css)],
  ['字段字典包含用途与隐私级别', /用途/.test(files.dictionary) && /隐私级别/.test(files.dictionary)],
  ['授权说明包含撤回和删除', /撤回/.test(files.privacy) && /删除/.test(files.privacy)],
  ['CI 执行检查、测试与构建', /npm run check/.test(files.ci) && /npm test/.test(files.ci) && /npm run build/.test(files.ci)],
  ['Netlify 配置生产构建与 SPA fallback', /publish = "dist"/.test(files.netlify) && /to = "\/index\.html"/.test(files.netlify)],
  ['搜索同时覆盖多个公开字段', /searchable/.test(files.domain) && /includes\(keyword\)/.test(files.domain)],
  ['技能筛选与选项去重已实现', /matchesSkill/.test(files.domain) && /skillOptions/.test(files.domain)],
  ['图表数据由成员技能聚合', /aggregateSkills/.test(files.domain) && /aggregateSkills\(props\.members\)/.test(files.chart)],
  ['ECharts 正确初始化、响应尺寸和销毁', /echarts\.init/.test(files.chart) && /chart\?\.resize/.test(files.chart) && /chart\?\.dispose/.test(files.chart)],
  ['图表具有单位、tooltip 和文本摘要', /人数/.test(files.chart) && /tooltip/.test(files.chart) && /文本摘要/.test(files.chart)],
  ['筛选结果用 aria-live 播报', /aria-live="polite"/.test(files.filters)],
  ['服务器提供登录、提交和审核接口', /auth\/login/.test(files.server) && /review\/members/.test(files.server)],
  ['服务器端按角色返回 401 与 403', /AUTH_REQUIRED/.test(files.server) && /FORBIDDEN/.test(files.server)],
  ['审核状态转换由状态机约束', /allowedTransitions/.test(files.workflow) && /INVALID_TRANSITION/.test(files.workflow)],
  ['CSV 支持预览与事务导入接口', /import\/preview/.test(files.server) && /importBatch/.test(files.server)],
  ['CSV 公式注入防护与脱敏导出', /safeSpreadsheetCell/.test(files.csv) && /maskEmail/.test(files.csv)],
  ['SQLite 开启外键、WAL 和事务', /foreign_keys=ON/.test(files.sqlite) && /journal_mode=WAL/.test(files.sqlite) && /BEGIN IMMEDIATE/.test(files.sqlite)],
  ['MySQL 使用连接池和事务', /createPool/.test(files.mysql) && /beginTransaction/.test(files.mysql) && /rollback/.test(files.mysql)],
  ['MySQL 表使用 InnoDB、utf8mb4 和外键', /ENGINE=InnoDB/.test(files.mysqlMigration) && /utf8mb4/.test(files.mysqlMigration) && /FOREIGN KEY/.test(files.mysqlMigration)],
  ['协同前端包含登录、提交、审核和 CSV', /登录协同工作台/.test(files.collaboration) && /提交我的公开资料/.test(files.collaboration) && /CSV 预览/.test(files.collaboration)],
  ['学生静态托管配置有效，动态API由个人Ubuntu同源代理', !files.netlify.includes('47.120.') && files.netlify.includes('/index.html')],
  ['环境模板不包含真实凭据', /change-me/.test(files.env) && /SESSION_SECRET/.test(files.env)],
]

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL ${name}`)
  process.exit(1)
}

console.log(`P3 v2.0 结构检查通过：${checks.length} 项规则全部满足。`)
