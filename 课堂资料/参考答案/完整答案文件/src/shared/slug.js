// 短链接的名字：把收礼人称呼和日期拼成一段能放进网址的短标识。
//
// 目标是 `林老师-20260922` 这种一眼能看懂的形式，而不是一长串 base64。
// 代价是必须有服务端存储——内容存在服务器上，网址里只放这把"钥匙"。

const STOP = /[\s，。！？、：；""''（）()[\]{}<>《》,.!?:;/\\|#&=+%$@^*~`'"]/g

// 网址里能安全出现的字符：中文、字母、数字、短横线。
// 其余一律去掉，避免出现需要转义的符号让链接变长变丑。
function tidyName(value) {
  return String(value || '')
    .trim()
    .replace(STOP, '')
    .replace(/[-]+/g, '-')
    .slice(0, 8)
}

function todayStamp(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

// 同一个人同一天可能做好几张，所以重名时补一小段随机码。
// 用去掉易混字符的字母表：没有 0/o/1/l/i，抄写时不会认错。
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
export function shortCode(length = 4) {
  let out = ''
  for (let i = 0; i < length; i += 1)
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return out
}

/**
 * 生成候选 slug。第一个是最好看的，后面是重名时的备选。
 *
 * @param receiver 收礼人称呼
 * @param now      当前时间，测试时可传固定值
 */
export function candidateSlugs(receiver, now = new Date()) {
  const name = tidyName(receiver)
  const stamp = todayStamp(now)
  const base = name ? `${name}-${stamp}` : `card-${stamp}`
  // 第一次就用最干净的形式；被占了再往后退
  return [base, `${base}-${shortCode(3)}`, `${base}-${shortCode(4)}`, `${base}-${shortCode(6)}`]
}

// 存储键名不能出现斜杠等字符，这里再兜一道
export function isSafeSlug(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 40 && !/[/\\?#%]/.test(value)
}
