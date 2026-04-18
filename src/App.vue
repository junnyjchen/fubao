<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppNav from '@/components/common/AppNav.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader />
    <AppNav />
    <main class="flex-1 pb-16 md:pb-0">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
