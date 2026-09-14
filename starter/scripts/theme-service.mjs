export const THEMES = ['light', 'dark']

export function normalizeTheme(value) {
  return THEMES.includes(value) ? value : 'light'
}

export function readTheme(storage) {
  try {
    return normalizeTheme(storage?.getItem('p1-theme'))
  } catch {
    return 'light'
  }
}

export function writeTheme(storage, theme) {
  // TODO-L5: 标准化后写入 p1-theme，失败也返回可显示的主题。
  return { theme: normalizeTheme(theme), saved: false }
}

export function nextTheme(theme) {
  // TODO-L5: light 与 dark 互相切换。
  return 'light'
}
