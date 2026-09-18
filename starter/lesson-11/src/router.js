import { createRouter, createWebHistory } from 'vue-router'
import AboutView from './views/AboutView.vue'
import AdminArticlesView from './views/AdminArticlesView.vue'
import ArticleFormView from './views/ArticleFormView.vue'
import ArticleView from './views/ArticleView.vue'
import HomeView from './views/HomeView.vue'
import NotFoundView from './views/NotFoundView.vue'
import PreviewView from './views/PreviewView.vue'
import LoginView from './views/LoginView.vue'
import { getAccessToken } from './services/authSession.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/tags/:tag', name: 'tag', component: HomeView, props: true },
    { path: '/articles/:slug', name: 'article', component: ArticleView, props: true },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/admin/articles', name: 'admin-articles', component: AdminArticlesView, meta: { requiresAuth: true } },
    { path: '/admin/articles/new', name: 'article-new', component: ArticleFormView, meta: { requiresAuth: true } },
    { path: '/admin/articles/:id/edit', name: 'article-edit', component: ArticleFormView, props: true, meta: { requiresAuth: true } },
    { path: '/admin/articles/:id/preview', name: 'article-preview', component: PreviewView, props: true, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach((to) => to.meta.requiresAuth && !getAccessToken() ? { name: 'login', query: { redirect: to.fullPath } } : true)

export default router
