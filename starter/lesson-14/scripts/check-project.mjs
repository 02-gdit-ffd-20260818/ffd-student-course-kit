import { readFile } from 'node:fs/promises'

const read = (path) => readFile(path, 'utf8')
const [app, server, provider, share, env, netlify, ci] = await Promise.all([
  read('src/App.vue'), read('server/app.js'), read('server/provider.js'), read('src/services/share.js'), read('.env.example'), read('netlify.toml'), read('.github/workflows/ci.yml')
])
const checks = [
  ['五种 UI 状态', ['loading', 'success', 'empty', 'error', 'fallback'].every((item) => app.includes(item))],
  ['服务端生成接口', server.includes('/api/greetings/generate')],
  ['SSE 流式接口', server.includes('/api/greetings/stream') && server.includes('text/event-stream')],
  ['输入大小限制', server.includes("limit: '20kb'")],
  ['限流保护', server.includes('RATE_LIMIT_MAX')],
  ['Prompt 版本', server.includes('PROMPT_VERSION')],
  ['OpenAI Responses 仅由服务端调用', provider.includes('/responses') && !app.includes('OPENAI_API_KEY')],
  ['超时控制', provider.includes('AbortController')],
  ['无密钥降级', provider.includes('provider_not_configured')],
  ['无数据库分享 URL', share.includes('#card=') && share.includes('MAX_FRAGMENT_LENGTH')],
  ['环境变量模板', env.includes('OPENAI_API_KEY=') && env.includes('VITE_API_BASE_URL=')],
  ['学生静态托管配置有效，动态API由个人Ubuntu同源代理', !netlify.includes('47.120.') && netlify.includes('/index.html')],
  ['CI 包含密钥扫描', ci.includes('check:secrets')]
]
for (const [name, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${name}`)
if (checks.some(([, ok]) => !ok)) process.exit(1)
console.log(`结构检查通过：${checks.length} 项。`)
