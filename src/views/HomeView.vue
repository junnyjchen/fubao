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
  { icon: 'book', title: '知識百科', path: '/baike', desc: '學習玄門文化', color: 'text-amber-600' },
  { icon: 'shield', title: '證書驗證', path: '/verify', desc: '一物一證', color: 'text-emerald-600' },
  { icon: 'ai', title: 'AI助手', path: '/ai-assistant', desc: '智能問答', color: 'text-purple-600' },
  { icon: 'video', title: '視頻學堂', path: '/video', desc: '視頻教學', color: 'text-blue-600' },
]
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Hero Banner -->
    <section class="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/20 mb-12 border border-amber-200/50 dark:border-amber-800/30">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.amber.200),transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.orange.200),transparent_50%)]"></div>
      </div>
      <div class="relative px-8 py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-800 dark:text-amber-200 text-sm font-medium mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          全球玄門文化科普交易平台
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          符寶網
          <span class="text-primary"> 全球玄門文化科普交易平台</span>
        </h1>
        <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          科普先行 · 交易放心 · 一物一證
        </p>
        <div class="flex gap-4 justify-center">
          <RouterLink 
            to="/shop" 
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            瀏覽商城
          </RouterLink>
          <RouterLink 
            to="/baike" 
            class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--input)] bg-background rounded-lg font-medium shadow-sm hover:bg-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
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
        class="group p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center"
      >
        <div 
          class="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors"
          :class="[
            index === 0 ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' : '',
            index === 1 ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' : '',
            index === 2 ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-200' : '',
            index === 3 ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' : '',
          ]"
        >
          <svg v-if="feature.icon === 'book'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
          <svg v-else-if="feature.icon === 'shield'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <svg v-else-if="feature.icon === 'ai'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <h3 class="font-medium mb-1 group-hover:text-primary transition-colors">{{ feature.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ feature.desc }}</p>
      </RouterLink>
    </section>

    <!-- Featured Products -->
    <section class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          精選商品
        </h2>
        <RouterLink to="/shop" class="text-sm text-primary hover:underline flex items-center gap-1">
          查看全部
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square bg-muted rounded-lg mb-3"></div>
          <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>

      <!-- Products -->
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink 
          v-for="item in featuredGoods" 
          :key="item.id"
          :to="`/shop/${item.id}`"
          class="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div class="aspect-square bg-muted relative overflow-hidden">
            <img 
              v-if="item.main_image" 
              :src="item.main_image" 
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <span class="text-4xl text-primary/30 font-bold">符</span>
            </div>
            <span v-if="item.is_certified" class="absolute top-2 left-2 px-2 py-0.5 bg-gold text-xs font-medium text-gold-dark rounded shadow-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              認證
            </span>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {{ item.name }}
            </h3>
            <div class="flex items-baseline gap-1 mb-3">
              <span class="text-lg font-bold text-primary">HK${{ item.price }}</span>
              <span v-if="item.original_price" class="text-xs text-muted-foreground line-through">
                HK${{ item.original_price }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <div class="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {{ item.merchant?.name?.charAt(0) || '商' }}
              </div>
              <span class="truncate">{{ item.merchant?.name || '符寶商城' }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Latest News -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/>
            <path d="M15 18h-5"/>
            <path d="M10 6h8v4h-8V6Z"/>
          </svg>
          玄門動態
        </h2>
        <RouterLink to="/news" class="text-sm text-primary hover:underline flex items-center gap-1">
          查看全部
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <RouterLink 
          v-for="item in latestNews" 
          :key="item.id"
          :to="`/news/${item.slug || item.id}`"
          class="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div class="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            <img 
              v-if="item.cover" 
              :src="item.cover" 
              :alt="item.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <span class="text-2xl text-primary/30">動</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {{ item.title }}
            </h3>
            <p v-if="item.summary" class="text-sm text-muted-foreground line-clamp-1">
              {{ item.summary }}
            </p>
            <div class="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ item.views }}
              </span>
              <span v-if="item.published_at">{{ new Date(item.published_at).toLocaleDateString('zh-TW') }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
