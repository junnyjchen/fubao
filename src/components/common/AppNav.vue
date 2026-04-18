<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const navItems = [
  { path: '/', icon: 'home', label: '首頁' },
  { path: '/shop', icon: 'shop', label: '商城' },
  { path: '/baike', icon: 'book', label: '百科' },
  { path: '/ai-assistant', icon: 'ai', label: 'AI' },
  { path: '/cart', icon: 'cart', label: '購物車', badge: true },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-area-bottom">
    <div class="flex justify-around items-center h-16 bg-background/95 backdrop-blur">
      <RouterLink 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors relative"
        :class="isActive(item.path) ? 'text-primary' : 'text-muted-foreground'"
      >
        <!-- Home -->
        <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        
        <!-- Shop -->
        <svg v-else-if="item.icon === 'shop'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        
        <!-- Book -->
        <svg v-else-if="item.icon === 'book'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
        
        <!-- AI -->
        <svg v-else-if="item.icon === 'ai'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
        </svg>
        
        <!-- Cart -->
        <svg v-else-if="item.icon === 'cart'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>

        <span class="text-xs">{{ item.label }}</span>

        <!-- Cart Badge -->
        <span 
          v-if="item.badge && cartStore.totalItems > 0" 
          class="absolute top-1 right-1/4 size-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center"
        >
          {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
        </span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
