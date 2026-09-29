// 逐套卡面验算文字对比度。
//
// 浅底配浅字是最容易犯、又最难自己发现的错——设计的人屏幕亮、眼神好，
// 觉得"能看清"，换一台屏幕或者在太阳底下就废了。所以让机器来判。
//
// 用的是 WCAG 的相对亮度公式，AA 级正文要求 ≥ 4.5:1。
// 卡面是渐变，两端都要达标，所以取最差的那一端。

import { themes } from '../src/data/themes.js'

const luminance = hex => {
  const channels = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    // sRGB 要先做伽马校正才能算亮度，直接拿 0-255 平均是错的
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (hi + 0.05) / (lo + 0.05)
}

const AA = 4.5
let failed = 0

for (const theme of themes) {
  const worst = Math.min(contrast(theme.ink, theme.colors[0]), contrast(theme.ink, theme.colors[1]))
  const pass = worst >= AA
  if (!pass) failed += 1
  console.log(
    `${pass ? '✓' : '✗'} ${theme.light ? '浅' : '深'} ${theme.name.padEnd(6)} ${worst.toFixed(2)}:1`,
  )
}

if (failed) {
  console.error(`\n${failed} 套卡面文字对比度不足 ${AA}:1，请调 ink 或 colors。`)
  process.exit(1)
}
console.log(`\n卡面对比度检查通过：${themes.length} 套全部达到 WCAG AA（≥ ${AA}:1）。`)
