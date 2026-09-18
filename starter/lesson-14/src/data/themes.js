export const themes = [
  { id: 'rose', name: '暮色玫瑰', icon: '✦', colors: ['#7e4651', '#3c2b3e'] },
  { id: 'forest', name: '松间新绿', icon: '❋', colors: ['#466b5d', '#183d3d'] },
  { id: 'sunrise', name: '晨光琥珀', icon: '☼', colors: ['#bd6b3c', '#6b3747'] }
]

export function findTheme(id) {
  return themes.find((theme) => theme.id === id) ?? themes[0]
}
