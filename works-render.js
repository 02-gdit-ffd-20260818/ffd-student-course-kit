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
  // TODO-DATA-A：增加 title.textContent = work.title;
  // 等号右边 work.title 用“对象.属性名”读取当前作品对象的 title 数据。
  // 等号左边 title.textContent 指刚创建的 h3 元素中的纯文字内容；等号表示把右边的值赋给左边。
  // textContent 会把内容按文字处理，不会把数据中的 <...> 当成 HTML 标签执行。
  // 操作前 h3 已创建但内容为空；操作后每张卡片显示对应的作品标题。
  const description = document.createElement('p');
  // TODO-DATA-B：增加 description.textContent = work.description;
  // work.description 读取当前作品对象的说明文字，description.textContent 把它写进新建的 p 元素。
  // 每次 createWorkCard(work) 收到的 work 不同，所以四个对象会显示各自的说明。
  // 操作前 p 元素为空；操作后标题下方出现作品说明。
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
// TODO-DATA-C：增加 renderWorks(works);
// renderWorks 是上面定义的函数名；圆括号表示调用函数；works 是传入函数的作品数组；分号结束语句。
// 只定义 function 不会自动执行，必须调用后才会遍历数组并创建 DOM 元素。
// 操作前作品区为空；操作后数组中的每个对象生成一张卡片并放入 .portfolio-list。
