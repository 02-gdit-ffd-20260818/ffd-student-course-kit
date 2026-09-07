import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const files = {
  app: read('src/App.vue'),
  card: read('src/components/MemberCard.vue'),
  domain: read('src/domain/member.js'),
  data: read('src/data/members.js'),
  css: read('src/styles.css'),
  dictionary: read('docs/field-dictionary.md'),
  privacy: read('docs/privacy-and-consent.md'),
  ci: read('.github/workflows/ci.yml'),
  netlify: read('netlify.toml'),
}

const checks = [
  ['版本入口标记为 P3 v1.0', /P3 · v1\.0/.test(files.app)],
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
]

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL ${name}`)
  process.exit(1)
}

console.log(`P3 v1.0 结构检查通过：${checks.length} 项规则全部满足。`)
