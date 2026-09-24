import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'
import { useUserStore } from './stores/user'

// 导入合并后的样式文件
import './assets/css/styles.css'

const app = createApp(App)
const pinia = createPinia()

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && (!userStore.user || (userStore.user.role !== 'admin' && !userStore.user.isAdmin))) {
    // 如果需要管理员权限但用户不是管理员，重定向到首页
    next('/home')
  } else {
    next()
  }
})

app.use(pinia)
app.use(router)
app.mount('#app')