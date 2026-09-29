import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// 样式全部合并到一份 styles.css 里，用 CSS 变量分浅色/深色。
// 原来拆成 styles/source/host 三份，改一个颜色要翻三个文件。
import './styles.css'

createApp(App).use(createPinia()).mount('#app')
