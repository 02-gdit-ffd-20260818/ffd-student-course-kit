# 第03课：六个任务参考答案

任务文件是 `lesson-03-task.css`。任务编号与操作手册、起步代码统一为 TODO 01—06；不再使用旧的A1/B1编号。

|任务|定位|替换或补充|预期效果|
|---|---|---|---|
|01|.portfolio-list 的 display|block → grid|启用网格|
|02|同一规则的 grid-template-columns|1fr → repeat(2, minmax(0, 1fr))|桌面两列|
|03|.work-cover img 的 object-fit|fill → cover|保持图片比例、裁切超出部分|
|04|.work-card 及 hover/focus-within|下面两条声明|平滑上移，键盘同样有反馈|
|05|max-width:640px媒体查询内部|列数改为1fr|手机一列|
|06|h1 的 font-size|clamp(28px, 6vw, 46px)|标题字号在28—46px之间随视口变化|

任务04分两个位置，不能都写进同一个规则：
```css
.work-card {
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.work-card:hover,
.work-card:focus-within {
  transform: translateY(-4px);
}
```

任务05必须位于媒体查询内部：
```css
@media (max-width: 640px) {
  .portfolio-list { grid-template-columns: 1fr; }
}
```

完整答案见本目录同名CSS。逐项修改自己的任务文件；不要覆盖个人工程。基础验收时不要添加is-auto-grid类，否则可选自适应列数会覆盖两列/一列实验。
