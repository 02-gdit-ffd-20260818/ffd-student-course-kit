// 第 4 课任务：补全选中状态与事件；HTML 锚点仍可正常跳转。
const navLinks = document.querySelectorAll('nav a');
function updateNavigation() {
  const currentSection = window.location.hash || '#about';
  navLinks.forEach(function (link) {
    // TODO-JS-A：比较 href 与 currentSection，然后切换 is-current。
  });
}
// TODO-JS-B：监听 hashchange，并在首次打开时调用函数。
