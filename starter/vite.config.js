import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/ffd-p1-portfolio/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
