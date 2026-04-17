<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { newsApi } from '@/lib/api'

const route = useRoute()
const newsList = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const typeLabels = ['全球', '行業', '活動', '互動']

async function loadNews() {
  loading.value = true
  try {
    const res = await newsApi.list({ page: currentPage.value, limit: 12 })
    newsList.value = res.data || []
    if (res.pagination) totalPages.value = res.pagination.total_pages
  } catch (error) { console.error('Failed to load news:', error) }
  finally { loading.value = false }
}
function prevPage() { if (currentPage.value > 1) { currentPage.value--; loadNews() } }
function nextPage() { if (currentPage.value < totalPages.value) { currentPage.value++; loadNews() } }
onMounted(() => { loadNews() })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">玄門動態</h1>
    <div v-if="loading" class="grid md:grid-cols-2 gap-4"><div v-for="i in 6" :key="i" class="animate-pulse flex gap-4 p-4 bg-card rounded-xl border"><div class="w-24 h-24 bg-muted rounded-lg"></div><div class="flex-1 space-y-2"><div class="h-4 bg-muted rounded w-3/4"></div><div class="h-4 bg-muted rounded w-1/2"></div></div></div></div>
    <div v-else-if="newsList.length === 0" class="text-center py-16"><p class="text-muted-foreground">暫無新聞</p></div>
    <div v-else class="grid md:grid-cols-2 gap-4">
      <RouterLink v-for="item in newsList" :key="item.id" :to="`/news/${item.slug || item.id}`" class="flex gap-4 p-4 bg-card rounded-xl border hover:shadow-md hover:-translate-y-1 transition-all">
        <div class="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden"><img v-if="item.cover" :src="item.cover" :alt="item.title" class="w-full h-full object-cover"/></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2"><span class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{{ typeLabels[item.type - 1] || '行業' }}</span><span class="text-xs text-muted-foreground">{{ item.views }} 閱讀</span></div>
          <h3 class="font-medium line-clamp-2 mb-2 hover:text-primary transition-colors">{{ item.title }}</h3>
          <p v-if="item.summary" class="text-sm text-muted-foreground line-clamp-1">{{ item.summary }}</p>
          <span v-if="item.published_at" class="text-xs text-muted-foreground mt-2 inline-block">{{ new Date(item.published_at).toLocaleDateString('zh-TW') }}</span>
        </div>
      </RouterLink>
    </div>
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
      <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-accent transition-colors">上一頁</button>
      <span class="px-4 py-2">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-accent transition-colors">下一頁</button>
    </div>
  </div>
</template>
