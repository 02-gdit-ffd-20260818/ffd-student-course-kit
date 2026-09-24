// 第 5 课：把数据渲染成页面，并支持筛选和排序。
//
// 本课六个 TODO：01、02 在 works-data.js 里，03—06 在这个文件里。
// 另有一段"根据数据生成标签按钮"已经写好，读懂即可。
// 搜 `TODO 0` 逐个定位，**按顺序做**。
//
// 这个文件里不应该出现任何一个写死的作品标题或网址——全部来自 works-data.js。
// 想加作品、改标题、换封面，都只动数据文件。这就是"数据与视图分离"。

// ---------- 当前的筛选和排序状态 ----------
// 把"界面现在是什么状态"集中放在这里，而不是散落在各个函数里。
// 状态一改就重新渲染一次，界面永远跟着状态走。
let activeTag = '全部'
let newestFirst = true

// ============================ TODO 03（简单） ============================
// 把一条数据变成一张卡片
//
// 操作前：四张卡片是空白的——有框有底色，但没有标题、说明和图片。
// 操作后：每张卡片显示出对应作品的封面、标题、说明和右上角的年份徽标。
//
// 下面的骨架已经把元素都创建好了，**只差把数据填进去**。
// TODO：补全六处 `/* 填这里 */`。
//
// 三个要点：
//   1) 用 textContent 而不是 innerHTML。
//      数据里万一有 < > 会被当成纯文字，不会被当成标签执行——这是安全习惯。
//   2) alt 要说清楚图上是什么：`${work.title}的网页截图`，不能只写"图片"。
//   3) img 的 width / height 不要删。浏览器靠它们提前留好位置，
//      图片加载时页面才不会"跳一下"（这个问题叫布局偏移 CLS）。
// =================================================================
function createWorkCard(work) {
  const item = document.createElement('li')
  item.className = 'work-card'

  // 年份徽标，贴在封面右上角
  const year = document.createElement('span')
  year.className = 'work-year'
  year.textContent = '' /* 填这里：work 的年份 */
  item.append(year)

  const link = document.createElement('a')
  link.href = '' /* 填这里：work 的网址 */
  link.target = '_blank'
  // 凡是 target="_blank" 的外链都要带上它，防止新页面反过来操纵本页
  link.rel = 'noopener noreferrer'

  const cover = document.createElement('div')
  cover.className = 'work-cover'
  const image = document.createElement('img')
  image.src = '' /* 填这里：work 的封面图路径 */
  image.alt = '' /* 填这里：用模板字符串拼出「XX的网页截图」 */
  image.width = 1200
  image.height = 800
  cover.append(image)

  const copy = document.createElement('div')
  copy.className = 'work-copy'
  const title = document.createElement('h3')
  title.textContent = '' /* 填这里：work 的标题 */
  const description = document.createElement('p')
  description.textContent = '' /* 填这里：work 的说明 */
  copy.append(title, description)

  link.append(cover, copy)
  item.append(link)
  return item
}

// ======================= TODO 05、06（中等） =======================
// 按当前状态算出"要显示哪些、按什么顺序"
//
// 这个函数是筛选（TODO 05）和排序（TODO 06）的共同出口。
// 标签按钮已经写好（下面那一段），直接做这里。
//
// TODO 05 筛选：
//   activeTag 是 '全部' 就返回 works 本身；
//   否则用 works.filter(work => work.tags.includes(activeTag))
//   filter 保留满足条件的元素，返回**新数组**，不动原数组——
//   这样反复筛选也不会把数据越筛越少。
//
// TODO 06 排序：
//   [...filtered].sort((a, b) => (newestFirst ? b.year - a.year : a.year - b.year))
//   **一定要先用 [...] 复制一份再 sort。**
//   sort 是"就地排序"，会直接改动原数组。忘了复制的话，
//   切换几次排序，works 里的原始顺序就被永久打乱了。
//
//   比较函数返回负数表示 a 排前面，正数表示 b 排前面。
//   b.year - a.year 就是"年份大的排前面"，也就是新→旧。
// ====================================================================
function getVisibleWorks() {
  return works
}

// ============================ TODO 02、04 ============================
// 渲染列表
//
// TODO 02 的体现：下面的 forEach 只写一遍，数据里有几条就渲染几张卡。
// TODO 04 空数据兜底：
//   操作前：把某个标签筛到没有作品时，列表区域一片空白，用户以为页面坏了。
//   操作后：显示一句「这个标签下还没有作品。」
//
//   TODO：补全 if 分支里的内容——创建一个 li，
//   className 设成 'works-empty'，textContent 写上那句提示。
// ====================================================================
function renderWorks() {
  const list = document.querySelector('.portfolio-list')
  const items = getVisibleWorks()
  const fragment = document.createDocumentFragment()

  if (items.length === 0) {
    // TODO 04：在这里创建并 append 一个提示元素
  } else {
    items.forEach(work => fragment.append(createWorkCard(work)))
  }

  // 先把卡片都放进 fragment（一个"暂存容器"），最后一次性塞进页面。
  // 好处：浏览器只重排一次，不是每加一张卡就重排一次。
  // replaceChildren 会先清空再放入，所以重复调用不会越加越多。
  list.replaceChildren(fragment)
}

// ======================= 已写好（不用改）：根据数据生成标签按钮 =======================
// 这一段**已经替你写好了**，读懂就行。
//
// 效果：作品列表上方出现「全部 / 前端 / 数据库 / AI …」一排圆角按钮，
//       **按钮有几个、叫什么，完全由 works-data.js 里写的 tags 决定**。
//
// 用到的 flatMap 和 Set 超出本课的基础范围，所以直接写好：
//   works.flatMap(work => work.tags)   把每个作品的 tags 数组摊平成一个大数组
//   new Set(...)                        去重：同样的值只存一份
//   [...集合]                           再展开回普通数组
//
// 你要做的 TODO 05（筛选）会用到这里点按钮时设置的 activeTag。
// =================================================================================
function renderTags() {
  const box = document.querySelector('#works-tags')

  // flatMap 把每个作品的 tags 数组摊平成一个大数组；
  // new Set 去重（Set 里同样的值只存一份）；再展开回数组。
  // 这样标签列表**完全由数据决定**，以后加一个新标签不用改这里。
  const tags = ['全部', ...new Set(works.flatMap(work => work.tags))]

  box.replaceChildren(
    ...tags.map(tag => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = tag
      // aria-pressed 既让 CSS 知道该高亮谁，也告诉读屏软件"这个按钮是按下状态"
      button.setAttribute('aria-pressed', String(tag === activeTag))
      button.addEventListener('click', () => {
        activeTag = tag
        renderTags() // 重画按钮，更新高亮
        renderWorks() // 重画列表
      })
      return button
    }),
  )
}

// ============================ TODO 06 的按钮部分 ============================
// 排序按钮
//
// 操作前：点排序按钮没有任何反应。
// 操作后：点一下，按钮文字在「按年份：新→旧」和「按年份：旧→新」之间切换，
//         **下面的卡片顺序肉眼可见地重新排列**。
//
// TODO：给按钮加 click 监听，做三件事：
//   1) newestFirst = !newestFirst   （! 是取反，true 变 false、false 变 true）
//   2) 更新按钮上的文字
//   3) 调用 renderWorks() 重画列表
// ==========================================================================
const sortButton = document.querySelector('#works-sort')

// ---------- 首次渲染 ----------
renderTags()
renderWorks()
