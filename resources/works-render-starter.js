// 原生 DOM 渲染：数据和布局分离；用 textContent 写入文字。
function createWorkCard(work) {
  const item = document.createElement('li');
  item.className = 'work-card';
  const link = document.createElement('a');
  link.href = work.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const cover = document.createElement('div');
  cover.className = 'work-cover';
  const image = document.createElement('img');
  image.src = work.image;
  image.alt = work.title + '的网页截图';
  image.width = 1200;
  image.height = 800;
  cover.append(image);
  const copy = document.createElement('div');
  copy.className = 'work-copy';
  const title = document.createElement('h3');
  // TODO-DATA-A：把作品标题赋给 title.textContent。
  const description = document.createElement('p');
  // TODO-DATA-B：把作品说明赋给 description.textContent。
  copy.append(title, description);
  link.append(cover, copy);
  item.append(link);
  return item;
}

function renderWorks(items) {
  const list = document.querySelector('.portfolio-list');
  const fragment = document.createDocumentFragment();
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = '暂时没有作品，请稍后补充。';
    fragment.append(empty);
  } else {
    items.forEach(function (work) {
      fragment.append(createWorkCard(work));
    });
  }
  // 一次替换，重复调用也不会把四个作品变成八个。
  list.replaceChildren(fragment);
}
// TODO-DATA-C：调用 renderWorks(works)，再检查数量与空数组。
