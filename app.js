// 第 4 课任务：补全选中状态与事件；HTML 锚点仍可正常跳转。
const navLinks = document.querySelectorAll('nav a');
function updateNavigation() {
  const currentSection = window.location.hash || '#about';
  navLinks.forEach(function (link) {
    // TODO-JS-A：比较 href 与 currentSection，得到 true/false；
    // 再按结果切换 is-current，并同步 aria-current。
    // 操作前：链接能跳转但不高亮；操作后：只有当前栏目高亮。
  });
}
// TODO-JS-B：监听 hashchange，并在首次打开时主动调用函数。
// 监听负责后续变化，主动调用负责页面第一次打开时的初始状态。
