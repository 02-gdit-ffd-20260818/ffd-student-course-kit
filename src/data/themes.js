// 贺卡卡面。数据和界面分开放：以后加一套只改这个文件，
// 编辑器和分享页会同时生效——这就是"数据驱动界面"。
//
// 每套卡面五个字段：
//   colors  卡面渐变的两端
//   ink     卡面上文字的颜色。**浅底必须配深字**，否则看不清；
//           每一套都用对比度公式验算过，全部达到 WCAG AA（≥4.5:1）
//   page    分享页的整页背景。比卡面再淡一档，让卡片"浮"在纸上
//   light   是不是浅色卡面。界面上要分组显示，浅色卡还要多描一道边，
//           不然放在白色面板上看不出边界
const dark = (id, name, icon, from, to, ink, page) => ({
  id,
  name,
  icon,
  colors: [from, to],
  ink,
  page,
  light: false,
})
const light = (id, name, icon, from, to, ink, page) => ({
  id,
  name,
  icon,
  colors: [from, to],
  ink,
  page,
  light: true,
})

export const themes = [
  // ---------- 浅色：清淡、干净，适合大多数场合 ----------
  light('moon', '月白', '○', '#F4F6F7', '#DCE4E8', '#2C3940', '#F7F9FA'),
  light('lotus', '藕荷', '❀', '#FAEEF1', '#E9D2DB', '#5B3945', '#FBF4F6'),
  light('aqua', '天水碧', '≈', '#EAF4F0', '#C9E2DA', '#27473F', '#F2F8F6'),
  light('bamboo', '竹青', '❋', '#EEF3E9', '#D4E1CB', '#38492F', '#F4F8F1'),
  light('apricot', '杏仁黄', '✿', '#FBF4E4', '#F0E1C2', '#55452A', '#FCF8EE'),
  light('lilac', '丁香紫', '✧', '#F1EDF7', '#DAD2EC', '#3D3355', '#F6F3FB'),
  light('sky', '晴山蓝', '◐', '#EBF2F9', '#CDDFEE', '#284257', '#F3F8FC'),
  light('linen', '素麻', '◇', '#F7F4EE', '#E5DDCE', '#4A4034', '#FAF8F3'),

  // ---------- 深色：正式、有分量，适合毕业和典雅语气 ----------
  dark('rose', '暮山紫', '❁', '#6E4B63', '#2E2438', '#F7EFF3', '#F4EFF2'),
  dark('forest', '松间绿', '❖', '#3E6152', '#1B3330', '#EFF5F0', '#EDF2EE'),
  dark('sunrise', '晨光橘', '☼', '#9C5431', '#53293A', '#FCF1E8', '#F7EEE8'),
  dark('ink', '砚台墨', '◈', '#2B2B31', '#111114', '#EDE8DF', '#EFEDE8'),
  dark('dawn', '天青色', '◑', '#3B5A72', '#1B2C3C', '#ECF3F8', '#EBF0F4'),
]

// 按 id 找卡面。两个细节都不能省：
//   find 找不到时返回 undefined，直接拿去用会报错
//   ?? themes[0] 兜底：别人把分享链接里的 themeId 改成乱码时，
//                      退回第一套卡面照样能显示，而不是白屏
// ============ P4 第1课 任务 TODO 05（简单）：让卡面切换真正生效 ============
// 页面上看得到的结果：现在点哪个色块，贺卡背景都不变——因为这个函数
// 永远返回第一套卡面。做完之后 13 套卡面都能正常切换。
//
// TODO 两件事：
//   1) 用 themes.find(theme => theme.id === id) 按 id 找到对应的卡面对象
//   2) 用 ?? themes[0] 兜底：传进来的 id 不存在时退回第一套
//
// 为什么一定要兜底：分享链接里带着 themeId，别人手改一个字，
// 这里就会返回 undefined，下一行 theme.colors[0] 直接让整页崩掉。
// **凡是"按 id 去找"的地方，都要想一想找不到会怎样。**
// ================================================================
export function findTheme(id) {
  return themes[0]
}

export const lightThemes = themes.filter(item => item.light)
export const darkThemes = themes.filter(item => !item.light)
