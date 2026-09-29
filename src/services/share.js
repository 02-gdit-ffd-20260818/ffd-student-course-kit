// 分享链接：把整张贺卡编码进网址的 # 片段里，不需要数据库、不需要后端存储。
//
// 关键是浏览器的一条规则：**# 后面的内容不会发给服务器**。
// 所以祝福语只存在于这条链接本身，服务器日志里一个字都不会留下。
// 链接发给谁，谁就能看到；不发就没人能看到。
//
// 这是"用协议特性换掉一整套后端存储"的典型例子。

// 链接长度上限。浏览器和聊天软件对网址长度都有限制，超了会被悄悄截断，
// 对方打开就是一张坏卡。与其让它断掉，不如提前拦住并告诉用户"精简一下文案"。
const MAX_FRAGMENT_LENGTH = 1800

// 普通 base64 里有 + / = 三个字符，它们在网址里有特殊含义，直接放会出问题。
// Base64URL 就是把它们换掉：+ → -，/ → _，末尾的 = 直接去掉。
function toBase64Url(text) {
  // 先把中文按 UTF-8 转成字节。btoa 只认单字节字符，直接喂中文会报错。
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

// 上面那一步的逆运算：换回 + /，把去掉的 = 补齐，再解码回中文。
function fromBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  // base64 的长度必须是 4 的倍数，缺多少补多少个 =
  const binary = atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
}

// 把一张贺卡变成 #card=xxxx 形式的链接片段。
export function createShareHash(card) {
  // **只挑需要的字段，并且逐个限长**。不直接把整个 card 塞进去有两个原因：
  //   1. card 上可能挂着一堆界面用的临时字段，编进链接纯属浪费长度
  //   2. 每个字段限长之后，链接长度就有了上限，不会被超长文案撑爆
  const safe = {
    receiver: String(card.receiver || '').slice(0, 20),
    occasion: String(card.occasion || '').slice(0, 10),
    tone: String(card.tone || '').slice(0, 10),
    message: String(card.message || '').slice(0, 260),
    themeId: String(card.themeId || 'rose').slice(0, 20),
  }
  const hash = `#card=${toBase64Url(JSON.stringify(safe))}`
  if (hash.length > MAX_FRAGMENT_LENGTH) throw new Error('分享内容过长，请精简文案')
  return hash
}

// 从链接片段还原出贺卡。**这个函数的每一行都在防备"链接被改坏了"**——
// 链接会被人手动编辑、被聊天软件截断、被换行符弄脏，什么情况都可能出现。
// 任何一关不过都返回 null，调用方只要 if (!shared) return 就行，不用 try/catch。
export function readShareHash(hash) {
  // 第一关：格式对不对、长度超没超。?. 是可选链，hash 为 undefined 时不会报错。
  if (!hash?.startsWith('#card=') || hash.length > MAX_FRAGMENT_LENGTH) return null
  try {
    // 第二关：解码和解析都放在 try 里。slice(6) 是跳过开头的 "#card=" 六个字符。
    const value = JSON.parse(fromBase64Url(hash.slice(6)))
    // 第三关：**解出来了也不等于是对的**。必须确认关键字段真的存在、类型也对，
    // 否则界面渲染时才报错，那时候已经来不及了。
    if (!value.receiver || !value.message || typeof value.message !== 'string') return null
    return value
  } catch {
    return null
  }
}
