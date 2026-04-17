<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { goodsApi } from '@/lib/api'

const route = useRoute()
const goods = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

async function loadGoods() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: currentPage.value, limit: 20 }
    const res = await goodsApi.list(params)
    goods.value = res.data || []
    if (res.pagination) totalPages.value = res.pagination.total_pages
  } catch (error) { console.error('Failed to load goods:', error) }
  finally { loading.value = false }
}

function prevPage() { if (currentPage.value > 1) { currentPage.value--; loadGoods() } }
function nextPage() { if (currentPage.value < totalPages.value) { currentPage.value++; loadGoods() } }

onMounted(() => { loadGoods() })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">寶品商城</h1>
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="animate-pulse"><div class="aspect-square bg-muted rounded-lg mb-3"></div><div class="h-4 bg-muted rounded w-3/4 mb-2"></div><div class="h-4 bg-muted rounded w-1/2"></div></div>
    </div>
    <div v-else-if="goods.length === 0" class="text-center py-16"><p class="text-muted-foreground">暫無商品</p></div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <RouterLink v-for="item in goods" :key="item.id" :to="`/shop/${item.id}`" class="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
        <div class="aspect-square bg-muted relative overflow-hidden">
          <img v-if="item.main_image" :src="item.main_image" :alt="item.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div v-else class="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5"><span class="text-4xl text-primary/30">符</span></div>
          <span v-if="item.is_certified" class="absolute top-2 left-2 px-2 py-0.5 bg-gold text-xs font-medium rounded">認證</span>
        </div>
        <div class="p-4">
          <h3 class="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{{ item.name }}</h3>
          <div class="flex items-baseline gap-1 mb-2"><span class="text-lg font-bold text-primary">HK${{ item.price }}</span><span v-if="item.original_price" class="text-xs text-muted-foreground line-through">HK${{ item.original_price }}</span></div>
          <div class="flex items-center justify-between text-xs text-muted-foreground"><span>已售 {{ item.sales }}</span><span class="truncate">{{ item.merchant?.name || '符寶商城' }}</span></div>
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
