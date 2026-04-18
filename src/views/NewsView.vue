<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { newsApi } from '@/lib/api'
import Badge from '@/components/ui/Badge.vue'

const news = ref<any[]>([])
const loading = ref(true)

async function loadNews() {
  loading.value = true
  try {
    const res = await newsApi.list({ limit: 20 })
    news.value = res.data || []
  } catch (error) {
    console.error('Failed to load news:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadNews())
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">玄門資訊</h1>
      <p class="text-muted-foreground">了解最新的玄學資訊與行業動態</p>
    </div>

    <!-- Featured News -->
    <section class="mb-12">
      <div v-if="news.length > 0" class="grid md:grid-cols-2 gap-6">
        <!-- Main Featured -->
        <RouterLink 
          v-if="news[0]"
          :to="`/news/${news[0].slug || news[0].id}`"
          class="group md:row-span-2 bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all"
        >
          <div class="aspect-video md:aspect-auto md:h-[400px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <img v-if="news[0].cover" :src="news[0].cover" :alt="news[0].title" class="w-full h-full object-cover" />
            <span v-else class="text-6xl text-primary/30 font-bold">頭條</span>
          </div>
          <div class="p-6">
            <Badge v-if="news[0].category" variant="default" class="mb-3">{{ news[0].category }}</Badge>
            <h2 class="text-xl md:text-2xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {{ news[0].title }}
            </h2>
            <p v-if="news[0].summary" class="text-muted-foreground line-clamp-3 mb-4">
              {{ news[0].summary }}
            </p>
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ news[0].views || 0 }} 閱讀
              </span>
              <span v-if="news[0].published_at">
                {{ new Date(news[0].published_at).toLocaleDateString('zh-TW') }}
              </span>
            </div>
          </div>
        </RouterLink>

        <!-- Side News -->
        <template v-if="news.length > 1">
          <RouterLink 
            v-for="item in news.slice(1, 5)" 
            :key="item.id"
            :to="`/news/${item.slug || item.id}`"
            class="group flex gap-4 bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div class="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 overflow-hidden">
              <img v-if="item.cover" :src="item.cover" :alt="item.title" class="w-full h-full object-cover" />
              <div v-else class="flex items-center justify-center w-full h-full text-2xl text-primary/30 font-bold">
                {{ item.title?.charAt(0) || '新' }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <Badge v-if="item.category" variant="secondary" class="mb-2">{{ item.category }}</Badge>
              <h3 class="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {{ item.title }}
              </h3>
              <div class="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span v-if="item.published_at">
                  {{ new Date(item.published_at).toLocaleDateString('zh-TW') }}
                </span>
              </div>
            </div>
          </RouterLink>
        </template>
      </div>
    </section>

    <!-- All News -->
    <section>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/>
          <path d="M15 18h-5"/>
          <path d="M10 6h8v4h-8V6Z"/>
        </svg>
        更多資訊
      </h2>

      <!-- Loading -->
      <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="h-40 bg-muted rounded-xl mb-4"></div>
          <div class="h-5 bg-muted rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>

      <!-- News Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink 
          v-for="item in news.slice(5)" 
          :key="item.id"
          :to="`/news/${item.slug || item.id}`"
          class="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all"
        >
          <div class="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <img v-if="item.cover" :src="item.cover" :alt="item.title" class="w-full h-full object-cover" />
            <span v-else class="text-4xl text-primary/30 font-bold">
              {{ item.title?.charAt(0) || '文' }}
            </span>
          </div>
          <div class="p-5">
            <Badge v-if="item.category" variant="secondary" class="mb-3">{{ item.category }}</Badge>
            <h3 class="font-medium text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {{ item.title }}
            </h3>
            <p v-if="item.summary" class="text-sm text-muted-foreground line-clamp-2 mb-3">
              {{ item.summary }}
            </p>
            <div class="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ item.views || 0 }}
              </span>
              <span v-if="item.published_at">
                {{ new Date(item.published_at).toLocaleDateString('zh-TW') }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
