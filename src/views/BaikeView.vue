<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { baikeApi } from '@/lib/api'

const articles = ref<any[]>([])
const loading = ref(true)
const categories = ['全部', '符籙', '法器', '宮觀', '道教科儀', '風水命理']
const activeCategory = ref('全部')

async function loadArticles() {
  loading.value = true
  try {
    const res = await baikeApi.list()
    articles.value = res.data || []
  } catch (error) { console.error('Failed to load articles:', error) }
  finally { loading.value = false }
}
onMounted(() => { loadArticles() })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">符寶百科</h1>
    <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
      <button v-for="cat in categories" :key="cat" @click="activeCategory = cat" class="px-4 py-2 rounded-full whitespace-nowrap transition-colors" :class="activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'">{{ cat }}</button>
    </div>
    <div v-if="loading" class="grid md:grid-cols-3 gap-6"><div v-for="i in 6" :key="i" class="animate-pulse bg-card rounded-xl border p-6"><div class="h-6 bg-muted rounded w-3/4 mb-4"></div><div class="space-y-2"><div class="h-4 bg-muted rounded"></div><div class="h-4 bg-muted rounded w-2/3"></div></div></div></div>
    <div v-else-if="articles.length === 0" class="text-center py-16"><p class="text-muted-foreground">暫無文章</p></div>
    <div v-else class="grid md:grid-cols-3 gap-6">
      <RouterLink v-for="article in articles" :key="article.id" :to="`/baike/${article.slug || article.id}`" class="bg-card rounded-xl border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
        <div class="aspect-video bg-muted"><img v-if="article.cover_image" :src="article.cover_image" :alt="article.title" class="w-full h-full object-cover"/></div>
        <div class="p-6">
          <h3 class="font-semibold mb-2 hover:text-primary transition-colors">{{ article.title }}</h3>
          <p v-if="article.summary" class="text-sm text-muted-foreground line-clamp-2">{{ article.summary }}</p>
          <div class="flex items-center gap-4 mt-4 text-xs text-muted-foreground"><span>{{ article.view_count }} 閱讀</span></div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
