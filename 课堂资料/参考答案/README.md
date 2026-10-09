# 第02课：七个任务参考答案

只修改学生工程的 `lesson-02-task.css`，保留个人 HTML 和图片。完整同名文件用于逐条核对，不覆盖整个项目。

|任务|位置|参考改法|验证|
|---|---|---|---|
|01|:root 的 --heading|改为 #3a3a5c|h1、h2 都变成藏蓝|
|02|:root 的 --background|改为 #f7f8f9|页面变为冷灰白|
|03|:root 的 --body-size|改为 18px|正文计算字号18px|
|04|body 的 line-height|用 var(--body-line)，保留变量1.8|计算行高32.4px|
|05|h2|padding: 10px 16px；border-left: 4px solid #b8a27d；background: #e8eee7|标题内边距、左边框和底色变化|
|06|已有a规则及其下方|加入过渡、hover和focus-visible，见下方|鼠标与键盘均有反馈|
|07|TODO07注释结束后的文件末尾|新增.container规则，见下方|宽屏不超过960px，窄屏不横向溢出|

任务06：在已有a规则内加入过渡；两条伪类规则写在a的结束花括号之后：
```css
a {
  color: #42635b;
  transition: color .2s, text-decoration-thickness .2s;
}
a:hover { color: var(--heading); text-decoration-thickness: 2px; }
a:focus-visible { outline: 2px solid var(--heading); outline-offset: 3px; }
```

任务07：起步任务文件末尾没有.container规则，是新增，不是替换不存在的width：
```css
.container {
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}
```

max-width限制上限，不把手机宽度写死为960px；auto把左右剩余空间平分。颜色和字号可以在完成参考实验后个性化，说明理由并重测即可。
