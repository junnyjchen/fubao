<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { newsApi } from '@/lib/api'

const route = useRoute()
const news = ref<any>(null)
const loading = ref(true)

async function loadNews() {
  loading.value = true
  try {
    const slug = route.params.slug as string
    const res = await newsApi.detail(slug)
    news.value = res.data
  } catch (error) { console.error('Failed to load news:', error) }
  finally { loading.value = false }
}
onMounted(() => { loadNews() })
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="loading" class="animate-pulse"><div class="h-8 bg-muted rounded w-3/4 mb-4"></div><div class="h-4 bg-muted rounded w-1/2 mb-8"></div><div class="space-y-4"><div v-for="i in 5" :key="i" class="h-4 bg-muted rounded"></div></div></div>
    <article v-else-if="news">
      <header class="mb-8"><h1 class="text-3xl font-bold mb-4">{{ news.title }}</h1><div class="flex items-center gap-4 text-sm text-muted-foreground"><span>{{ news.views }} 閱讀</span><span v-if="news.published_at">{{ new Date(news.published_at).toLocaleDateString('zh-TW') }}</span></div></header>
      <img v-if="news.cover" :src="news.cover" :alt="news.title" class="w-full rounded-xl mb-8"/>
      <div v-if="news.content" v-html="news.content" class="whitespace-pre-wrap"></div>
      <div v-else-if="news.summary" class="text-muted-foreground">{{ news.summary }}</div>
    </article>
    <div v-else class="text-center py-16"><p class="text-muted-foreground">文章不存在</p><RouterLink to="/news" class="text-primary hover:underline mt-4 inline-block">返回列表</RouterLink></div>
  </div>
</template>
