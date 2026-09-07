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
  const normalized = normalizeTheme(theme)
  try {
    storage?.setItem('p1-theme', normalized)
  } catch {
    return { theme: normalized, saved: false }
  }
  return { theme: normalized, saved: true }
}

export function nextTheme(theme) {
  return normalizeTheme(theme) === 'dark' ? 'light' : 'dark'
}
