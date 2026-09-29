import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// 这个项目有**两套测试**，各管各的：
//
//   tests/*.test.mjs   纯函数，用 node --test 跑。不需要浏览器、不需要依赖，最快。
//   tests/*.spec.js    组件，用 vitest + jsdom 跑。要渲染真的 DOM。
//
// 所以这里只 include .spec.js，别把 .test.mjs 也扫进来——
// 那些文件用的是 node:test 的写法，vitest 认不出里面的用例。
export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['tests/**/*.spec.js'],
    environment: 'jsdom',
  },
})
