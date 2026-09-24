// 登录相关的全部密码学操作。这个文件是整个项目**最不能想当然**的地方，
// 每一行都有它必须那么写的理由，下面逐条说明。
//
// 用的是 Node 自带的 crypto，没有引入任何第三方库——
// 少一个依赖就少一个供应链风险，课堂上也少一次装包失败。

import crypto from 'node:crypto'

// 令牌有效期 8 小时。不设过期的令牌一旦泄露就永远有效。
const TOKEN_TTL_SECONDS = 8 * 60 * 60

// 把明文口令变成不可逆的散列。**数据库里永远不存明文**。
//
// salt（盐）是每个用户一份的随机串，和口令拼在一起再算散列。
// 没有盐的话，两个人用同样的口令会得到同样的散列，攻击者拖库后
// 用一张预先算好的彩虹表就能批量还原。
// 参数默认值现场生成随机盐；注册时不用传，校验时把库里的盐传进来。
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  // 长度是口令强度里最有效的一项，12 位是本课程的下限
  if (typeof password !== 'string' || password.length < 12)
    throw new Error('password must contain at least 12 characters')
  // scrypt 是**故意设计得很慢、很费内存**的算法。慢对正常登录没影响
  // （一次几十毫秒），但让攻击者拖库之后暴力穷举的代价高到不现实。
  // 千万不要用 md5 / sha1 / sha256 直接算口令——它们快得正好帮了攻击者。
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') }
}

// 校验口令：用同样的盐再算一次，比对结果。
export function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false
  const actual = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(expectedHash, 'hex')
  // **不能用 === 或 Buffer.compare 比对**。普通比较从第一个字节开始，
  // 一旦不同就立刻返回，于是"猜对前几个字节"会比"第一个字节就错"慢一点点。
  // 攻击者反复测量这点时间差，就能一个字节一个字节地把散列试出来（时序攻击）。
  // timingSafeEqual 无论内容是否相同都走完全程，耗时恒定。
  // 注意它要求两个 Buffer 长度一致，否则直接抛错，所以先比长度。
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

// 签发访问令牌。格式是 载荷.签名，和 JWT 很像但更简单，便于课堂讲清原理。
//
// **载荷只是 base64，不是加密**：任何人都能把它解开看见里面的内容。
// 所以令牌里只放 id、角色、用户名、过期时间这类不敏感信息，绝不放口令。
// 它的安全性不来自"看不见"，而来自"改了就对不上签名"。
//
// now 写成参数是为了测试能传假时间，不用真的等 8 小时验证过期。
export function createAccessToken(user, secret, now = Date.now()) {
  // 密钥太短，签名就能被暴力破解，那整套机制就白做了
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters')
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      username: user.username,
      exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS,
    }),
  ).toString('base64url')
  // HMAC：用只有服务器知道的 secret 给载荷算一个指纹。
  // 别人可以改载荷（比如把 role 改成 admin），但**算不出对应的新签名**，
  // 服务器一验就发现对不上。
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

// 校验令牌。任何一处不对都返回 null，调用方只判断 null 即可。
export function verifyAccessToken(token, secret, now = Date.now()) {
  if (!token || !secret) return null
  const [payload, signature, extra] = token.split('.')
  // 必须正好两段。extra 有值说明格式不对，直接拒绝——
  // 宁可拒绝一个格式古怪的合法令牌，也不要放进一个构造出来的。
  if (!payload || !signature || extra) return null
  const expected = crypto.createHmac('sha256', secret).update(payload).digest()
  const actual = Buffer.from(signature, 'base64url')
  // **先验签名再解析内容**，顺序不能反。
  // 反过来的话，就等于先拿未经验证的数据去做 JSON.parse，白白多一个受攻击面。
  // 这里同样用恒定时间比较。
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    // 签名对了还要看有没有过期。过期的令牌签名当然也是对的。
    return claims.exp > Math.floor(now / 1000) ? claims : null
  } catch {
    return null
  }
}

// 从 Authorization: Bearer xxxxx 这个请求头里把令牌取出来。
// i 表示不区分大小写——有些客户端会写成 bearer。
export function readBearerToken(header = '') {
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1] || ''
}
