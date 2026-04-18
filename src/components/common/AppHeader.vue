<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const isMenuOpen = ref(false)
const searchQuery = ref('')
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between gap-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 flex-shrink-0">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(25,80%,35%)] text-white font-bold text-lg shadow-sm">
            符
          </div>
          <span class="text-xl font-semibold tracking-tight hidden sm:block">符寶網</span>
        </RouterLink>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-6">
          <RouterLink to="/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">首頁</RouterLink>
          <RouterLink to="/baike" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">符寶百科</RouterLink>
          <RouterLink to="/shop" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">寶品商城</RouterLink>
          <RouterLink to="/news" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">玄門動態</RouterLink>
          <RouterLink to="/ai-assistant" class="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1">AI助手</RouterLink>
        </nav>

        <!-- Search -->
        <div class="hidden md:flex flex-1 max-w-xs">
          <div class="relative w-full">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              v-model="searchQuery"
              type="search" 
              placeholder="搜索符籙、法器、宮觀..." 
              class="w-full h-9 bg-muted/50 rounded-md border border-[hsl(20,14%,90%)] pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(25,80%,35%)] transition-colors"
            />
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <RouterLink to="/verify" class="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">驗證</RouterLink>
          <RouterLink to="/cart" class="relative p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 size-4 rounded-full bg-[hsl(25,80%,35%)] text-white text-xs flex items-center justify-center">
              {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
            </span>
          </RouterLink>
          <RouterLink to="/login" class="text-sm font-medium">登入</RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
