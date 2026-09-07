import { readFile } from 'node:fs/promises'

const read = (path) => readFile(path, 'utf8')
const [app, server, provider, env, netlify, ci] = await Promise.all([
  read('src/App.vue'), read('server/app.js'), read('server/provider.js'), read('.env.example'), read('netlify.toml'), read('.github/workflows/ci.yml')
])
const checks = [
  ['五种 UI 状态', ['loading', 'success', 'empty', 'error', 'fallback'].every((item) => app.includes(item))],
  ['服务端生成接口', server.includes('/api/greetings/generate')],
  ['输入大小限制', server.includes("limit: '20kb'")],
  ['限流保护', server.includes('RATE_LIMIT_MAX')],
  ['Prompt 版本', server.includes('PROMPT_VERSION')],
  ['OpenAI Responses 仅由服务端调用', provider.includes('/responses') && !app.includes('OPENAI_API_KEY')],
  ['超时控制', provider.includes('AbortController')],
  ['无密钥降级', provider.includes('provider_not_configured')],
  ['环境变量模板', env.includes('OPENAI_API_KEY=')],
  ['Netlify API 代理', netlify.includes('ffd-p4-api/api/:splat')],
  ['CI 包含密钥扫描', ci.includes('check:secrets')]
]
for (const [name, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${name}`)
if (checks.some(([, ok]) => !ok)) process.exit(1)
console.log(`结构检查通过：${checks.length} 项。`)
