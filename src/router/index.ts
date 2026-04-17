import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/shop', name: 'shop', component: () => import('@/views/ShopView.vue') },
    { path: '/shop/:id', name: 'goods-detail', component: () => import('@/views/GoodsDetailView.vue') },
    { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
    { path: '/order/:id', name: 'order-detail', component: () => import('@/views/OrderDetailView.vue') },
    { path: '/news', name: 'news', component: () => import('@/views/NewsView.vue') },
    { path: '/news/:slug', name: 'news-detail', component: () => import('@/views/NewsDetailView.vue') },
    { path: '/ai-assistant', name: 'ai-assistant', component: () => import('@/views/AIAssistantView.vue') },
    { path: '/baike', name: 'baike', component: () => import('@/views/BaikeView.vue') },
    { path: '/verify', name: 'verify', component: () => import('@/views/VerifyView.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
  scrollBehavior() { return { top: 0 } },
})

export default router
