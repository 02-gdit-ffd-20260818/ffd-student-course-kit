import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    proxy: {
      '/media/uploads': 'http://127.0.0.1:3000',
      '/api': 'http://127.0.0.1:3000',
      '/health': 'http://127.0.0.1:3000',
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
