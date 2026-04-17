<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between gap-4">
        <RouterLink to="/" class="flex items-center gap-2 flex-shrink-0">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">符</div>
          <span class="text-xl font-semibold tracking-tight hidden sm:block">符寶網</span>
        </RouterLink>
        <nav class="hidden lg:flex items-center gap-6">
          <RouterLink to="/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">首頁</RouterLink>
          <RouterLink to="/baike" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">符寶百科</RouterLink>
          <RouterLink to="/shop" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">寶品商城</RouterLink>
          <RouterLink to="/news" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">玄門動態</RouterLink>
          <RouterLink to="/ai-assistant" class="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">AI助手</RouterLink>
        </nav>
        <div class="hidden md:flex flex-1 max-w-xs">
          <div class="relative w-full">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="search" placeholder="搜索符籙、法器..." class="w-full h-9 bg-muted/50 rounded-md border border-input pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="size-9 rounded-md hover:bg-accent flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </button>
          <RouterLink to="/cart" class="size-9 rounded-md hover:bg-accent flex items-center justify-center relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </RouterLink>
          <RouterLink to="/login" class="hidden sm:flex h-9 px-4 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">登入</RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
