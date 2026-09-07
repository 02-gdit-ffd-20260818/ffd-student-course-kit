export function inspectStyles(css) {
  return {
    hasFlexOrGrid: /display\s*:\s*(?:flex|grid)/i.test(css),
    hasResponsiveRule: /@media\s*\([^)]*(?:min|max)-width/i.test(css),
    hasPrintRule: /@media\s+print/i.test(css),
    hasFocusVisible: /:focus-visible/i.test(css),
    hasBreakProtection: /break-inside\s*:\s*avoid/i.test(css),
  }
}

export function validateStyles(css) {
  const result = inspectStyles(css)
  const failures = []

  if (!result.hasFlexOrGrid) failures.push('缺少 Flex 或 Grid 布局')
  if (!result.hasResponsiveRule) failures.push('缺少响应式宽度媒体查询')
  if (!result.hasPrintRule) failures.push('缺少打印样式')
  if (!result.hasFocusVisible) failures.push('缺少键盘焦点样式')
  if (!result.hasBreakProtection) failures.push('打印时没有防止卡片跨页断开')

  return failures
}
