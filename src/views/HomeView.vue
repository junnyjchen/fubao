<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { goodsApi, newsApi } from '@/lib/api'

const featuredGoods = ref<any[]>([])
const latestNews = ref<any[]>([])
const loading = ref(true)

async function loadData() {
  try {
    const [goodsRes, newsRes] = await Promise.all([
      goodsApi.list({ limit: 8 }),
      newsApi.list({ limit: 4 })
    ])
    featuredGoods.value = goodsRes.data || []
    latestNews.value = newsRes.data || []
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadData() })

const features = [
  { icon: 'book', title: '知識百科', path: '/baike', desc: '學習玄門文化' },
  { icon: 'shield', title: '證書驗證', path: '/verify', desc: '一物一證' },
  { icon: 'ai', title: 'AI助手', path: '/ai-assistant', desc: '智能問答' },
  { icon: 'video', title: '視頻學堂', path: '/video', desc: '視頻教學' },
]
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Hero Banner -->
    <section class="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mb-12 border border-amber-200/50">
      <div class="px-8 py-16 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          符寶網
          <span class="text-[hsl(25,80%,35%)]"> 全球玄門文化科普交易平台</span>
        </h1>
        <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          科普先行 · 交易放心 · 一物一證
        </p>
        <div class="flex gap-4 justify-center">
          <RouterLink 
            to="/shop" 
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(25,80%,35%)] text-white rounded-lg font-medium shadow-sm hover:bg-[hsl(25,80%,30%)] transition-colors"
          >
            瀏覽商城
          </RouterLink>
          <RouterLink 
            to="/baike" 
            class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[hsl(25,80%,35%)] text-[hsl(25,80%,35%)] rounded-lg font-medium hover:bg-[hsl(25,80%,35%)] hover:text-white transition-colors"
          >
            探索百科
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Feature Cards -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <RouterLink 
        v-for="(feature, index) in features" 
        :key="index"
        :to="feature.path"
        class="group p-6 bg-card rounded-xl border hover:shadow-lg transition-all text-center"
      >
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-[hsl(25,80%,35%)]/10 text-[hsl(25,80%,35%)]">
          <span class="text-xl">{{ index === 0 ? '典' : index === 1 ? '證' : index === 2 ? 'AI' : '視' }}</span>
        </div>
        <h3 class="font-medium mb-1">{{ feature.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ feature.desc }}</p>
      </RouterLink>
    </section>

    <!-- Featured Products -->
    <section class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">精選商品</h2>
        <RouterLink to="/shop" class="text-sm text-[hsl(25,80%,35%)] hover:underline">查看全部 →</RouterLink>
      </div>
      
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square bg-muted rounded-lg mb-3"></div>
          <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink 
          v-for="item in featuredGoods" 
          :key="item.id"
          :to="`/shop/${item.id}`"
          class="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
        >
          <div class="aspect-square bg-muted relative">
            <div v-if="!item.main_image" class="flex items-center justify-center w-full h-full bg-[hsl(25,80%,35%)]/5">
              <span class="text-4xl text-[hsl(25,80%,35%)]/30 font-bold">符</span>
            </div>
            <img v-else :src="item.main_image" :alt="item.name" class="w-full h-full object-cover" />
            <span v-if="item.is_certified" class="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-medium rounded">認證</span>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-sm line-clamp-2 mb-2">{{ item.name }}</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-bold text-[hsl(25,80%,35%)]">HK${{ item.price }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Latest News -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">玄門動態</h2>
        <RouterLink to="/news" class="text-sm text-[hsl(25,80%,35%)] hover:underline">查看全部 →</RouterLink>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <RouterLink 
          v-for="item in latestNews" 
          :key="item.id"
          :to="`/news/${item.slug || item.id}`"
          class="flex gap-4 p-4 bg-card rounded-xl border hover:shadow-lg transition-all"
        >
          <div class="w-24 h-24 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
            <span class="text-2xl text-[hsl(25,80%,35%)]/30">{{ item.title?.charAt(0) || '新' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium line-clamp-2 mb-1">{{ item.title }}</h3>
            <p v-if="item.summary" class="text-sm text-muted-foreground line-clamp-1">{{ item.summary }}</p>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
