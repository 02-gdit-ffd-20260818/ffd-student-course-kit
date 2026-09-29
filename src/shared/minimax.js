// MiniMax 文案生成：拼提示词、调接口、清洗返回值。
//
// 这个文件**不读环境变量、不碰 process**，密钥由调用方传进来。
// 这样它既能在 Express 里用，也能在 Netlify Function 里用，还能在测试里
// 塞一个假的 fetch 进去，不用真的联网。
//
// 密钥永远只存在于服务端。前端打的是自己后端的 /api/greeting，
// 拿不到、也不需要知道 MiniMax 的密钥。

export const MINIMAX_ENDPOINT = 'https://api.minimax.cn/anthropic/v1/messages'
export const MINIMAX_MODEL = 'MiniMax-M3'
export const PROMPT_VERSION = 'greeting-card-v2.0'

// 系统提示词。六条规则都是实测之后加的——
// 不写第 1 条，模型会回"好的，这是您的祝福语："；
// 不写第 5 条，模型会凭空编出没提过的人名和事件（备课时真的出现过"老罗"）。
export const SYSTEM_PROMPT = [
  '你是中文贺卡文案助手。严格遵守以下规则：',
  '1) 只输出祝福正文本身，不要任何解释、前言、标题、引号或 Markdown 标记；',
  '2) 长度控制在 45 到 90 个汉字，写成一段，不要分行列点；',
  '3) 必须自然贴合给定的收礼人称呼、场景和语气；',
  '4) 有补充信息时要把它自然融进祝福里，不要生硬罗列；',
  '5) 不得编造任何未提供的人名、地点、事件或事实；',
  '6) 内容健康、得体、适合公开分享，不涉及政治、宗教、疾病和金钱数额。',
].join('')

export function buildUserPrompt(input) {
  return [
    `收礼人称呼：${input.receiver}`,
    `场景：${input.occasion}`,
    `语气：${input.tone}`,
    `补充信息：${input.details || '（无）'}`,
  ].join('\n')
}

// 模型偶尔还是会带上引号或者"祝福语："这类前缀，这里统一擦掉。
// ============ P4 第2课 任务 TODO 05（中等）：把模型的废话擦掉 ============
// 页面上看得到的结果：现在贺卡上经常出现
//   祝福语："愿你岁岁平安……"
// 前面那三个字和引号都是模型多嘴加的。做完之后卡面上只有祝福正文。
//
// TODO：补全清洗链：
//   .replace(/^\s*(祝福语|文案|以下是[^：:]*)[：:]\s*/, '')  去掉开头的前缀
//   .replace(/^[“"「『]/, '')        去掉开头的引号（中英日三种都要）
//   .replace(/[”"」』]\s*$/, '')     去掉结尾的引号
//   .replace(/\s*\n\s*/g, '\n')    每行首尾的空格去掉，但**保留换行**
//   .trim().slice(0, 260)          去首尾空白，再兜一道长度上限
//
// 知识点：^ 表示"开头"，$ 表示"结尾"，没有 g 标志就只替换第一处。
// 这几条都不加 g——**只擦开头结尾那一处，别把正文中间的引号也擦了**。
//
// 为什么提示词里已经写了"不要任何前言"还要再擦一遍：
// **大模型的输出是概率性的，提示词只能让它大概率照做，不能保证。**
// 凡是模型的输出进入用户界面之前，都要再清洗一次——这叫防御性编程。
// ==============================================================
export function cleanOutput(text) {
  return String(text || '')
}

/**
 * 调用 MiniMax 生成祝福。
 *
 * @param input      { receiver, occasion, tone, details }
 * @param options    apiKey 必填；fetchImpl、timeoutMs、model 可选
 * @returns { text, mode: 'ai', model } 或抛错
 */
export async function generateWithMiniMax(input, options = {}) {
  const apiKey = options.apiKey
  if (!apiKey) throw Object.assign(new Error('missing_api_key'), { code: 'NO_KEY' })

  const fetchImpl = options.fetchImpl ?? fetch
  const controller = new AbortController()
  // 贺卡是"等得起"的场景，但也不能让人干等。20 秒是实测下来的上限，
  // M3 正常在 3~8 秒返回。
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 20000)

  try {
    const response = await fetchImpl(options.endpoint ?? MINIMAX_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model ?? MINIMAX_MODEL,
        max_tokens: 400,
        // 官方推荐 1.0。调低会让每次输出都差不多，失去"换一个说法"的意义。
        temperature: 1.0,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: [{ type: 'text', text: buildUserPrompt(input) }] }],
      }),
      signal: controller.signal,
    })

    // fetch 不会因为 4xx/5xx 抛错，必须自己看 ok
        // ============ P4 第2课 任务 TODO 04（中等）：fetch 不会因为 500 抛错 ============
    // **这是对接外部接口最容易踩的坑。**
    // 页面上看得到的结果：把密钥改错一个字符，现在页面出现空白或乱码文案；
    // 做完之后页面退回本地文案库，并老实说明"未配置模型密钥"。
    //
    // 为什么会这样：**只要请求发出去了，fetch 就算成功**，
    // 哪怕对方返回 401（密钥错）、429（限流）、500（对方挂了）。
    // 不自己检查的话，下面 response.json() 解析出一个错误对象，
    // 程序拿着它继续跑，最后用户收到一张内容是 "undefined" 的贺卡。
    //
    // TODO：补上状态检查，不是 2xx 就抛错，交给调用方去兜底：
    //   if (!response.ok) {
    //     const detail = await response.text().catch(() => '')
    //     throw Object.assign(new Error(`upstream_${response.status}`),
    //       { code: 'UPSTREAM_ERROR', detail: detail.slice(0, 200) })
    //   }
    //
    // detail.slice(0, 200)：**错误详情要截断**。上游可能返回几十 KB 的
    // HTML 错误页，整个塞进日志会把日志刷爆。
    // =====================================================================

    const data = await response.json()
    // MiniMax 用 base_resp.status_code 表示业务层错误，HTTP 仍然是 200
    if (data?.base_resp && data.base_resp.status_code !== 0)
      throw Object.assign(new Error(data.base_resp.status_msg || 'upstream_rejected'), {
        code: 'UPSTREAM_REJECTED',
      })

    const text = cleanOutput((data?.content ?? []).map(part => part?.text ?? '').join(''))
    if (!text) throw Object.assign(new Error('upstream_empty'), { code: 'UPSTREAM_EMPTY' })

    return { text, mode: 'ai', model: options.model ?? MINIMAX_MODEL }
  } finally {
    clearTimeout(timer)
  }
}
