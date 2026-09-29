import { createRouter, createWebHistory } from 'vue-router'
import AboutView from './views/AboutView.vue'
import AdminArticlesView from './views/AdminArticlesView.vue'
import ArticleFormView from './views/ArticleFormView.vue'
import ArticleView from './views/ArticleView.vue'
import HomeView from './views/HomeView.vue'
import NotFoundView from './views/NotFoundView.vue'
import PreviewView from './views/PreviewView.vue'
import RegisterView from './views/RegisterView.vue'
import LoginView from './views/LoginView.vue'
import { getAccessToken, readAuthSession } from './services/authSession.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/tags/:tag', name: 'tag', component: HomeView, props: true },
    { path: '/articles/:slug', name: 'article', component: ArticleView, props: true },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/admin/articles', name: 'admin-articles', component: AdminArticlesView, meta: { requiresAuth: true } },
    { path: '/admin/articles/new', name: 'article-new', component: ArticleFormView, meta: { requiresAuth: true } },
    { path: '/admin/articles/:id/edit', name: 'article-edit', component: ArticleFormView, props: true, meta: { requiresAuth: true } },
    { path: '/admin/articles/:id/preview', name: 'article-preview', component: PreviewView, props: true, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach(to => { if(!to.meta.requiresAuth)return true; // ============ TODO 05（中等）：前端也要挡一道（体验层） ============
// 页面上看得到的结果：用普通账号登录，在地址栏直接输
// /admin/articles，**会被弹回首页**，而不是进到一个全是错误的空页面。
//
// TODO：补全这个路由守卫
//   没有令牌            → 跳登录页，并把原地址放进 query.redirect，
//                         登录完能自动回来
//   有令牌但角色不是 admin → 跳回首页
//
//   if(!getAccessToken())
//     return {name:'login',query:{redirect:to.fullPath}}
//   return readAuthSession()?.user?.role==='admin' ? true : {name:'home'}
//
// **这一道拦截是"体验"，不是"安全"。**
// 前端代码全在用户浏览器里，改一改就绕过去了。
// 真正的安全在 TODO 02 那个 admin 中间件——它在服务器上，绕不过。
//
// 那前端这道还有什么用？让正常用户不会莫名其妙撞进一个满屏 403 的页面。
// **安全靠后端，体验靠前端，两者都要有，但不能互相替代。**
// ========================================================
if(!getAccessToken())return {name:'login'};return true })

export default router
