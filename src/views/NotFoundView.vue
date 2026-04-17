<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-8xl font-bold text-primary/20 mb-4">404</h1>
      <h2 class="text-2xl font-bold mb-2">頁面未找到</h2>
      <p class="text-muted-foreground mb-6">抱歉，您訪問的頁面不存在或已被移除。</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink to="/" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          返回首頁
        </RouterLink>
        <RouterLink to="/shop" class="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors">搜索商品</RouterLink>
      </div>
      <div class="mt-8 pt-6 border-t"><p class="text-sm text-muted-foreground mb-3">您可能在尋找：</p><div class="flex flex-wrap gap-2 justify-center"><RouterLink to="/shop" class="text-sm text-primary hover:underline">商品商城</RouterLink><RouterLink to="/baike" class="text-sm text-primary hover:underline">玄門百科</RouterLink><RouterLink to="/verify" class="text-sm text-primary hover:underline">證書驗證</RouterLink></div></div>
    </div>
  </div>
</template>
