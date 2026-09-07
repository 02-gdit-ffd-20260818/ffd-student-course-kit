export function inspectHtml(html) {
  const count = pattern => [...html.matchAll(pattern)].length
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0])

  return {
    h1Count: count(/<h1\b/gi),
    sectionCount: count(/<section\b/gi),
    hasMain: /<main\b/i.test(html),
    hasHeader: /<header\b/i.test(html),
    hasFooter: /<footer\b/i.test(html),
    imagesHaveAlt: imageTags.every(tag => /\balt\s*=\s*["'][^"']+["']/i.test(tag)),
    hasWindowsPath: /(?:[A-Za-z]:\\|file:\/\/)/i.test(html),
  }
}

export function validateHtml(html) {
  const result = inspectHtml(html)
  const failures = []

  if (result.h1Count !== 1) failures.push(`应有且只有一个 h1，实际为 ${result.h1Count}`)
  if (!result.hasHeader) failures.push('缺少 header')
  if (!result.hasMain) failures.push('缺少 main')
  if (!result.hasFooter) failures.push('缺少 footer')
  if (result.sectionCount < 3) failures.push('section 少于 3 个')
  if (!result.imagesHaveAlt) failures.push('存在没有有效 alt 的图片')
  if (result.hasWindowsPath) failures.push('页面包含本机绝对路径')

  return failures
}
