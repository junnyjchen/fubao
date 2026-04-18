<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { newsApi } from '@/lib/api'
import Badge from '@/components/ui/Badge.vue'

const route = useRoute()
const article = ref<any>(null)
const relatedNews = ref<any[]>([])
const loading = ref(true)

async function loadArticle() {
  loading.value = true
  try {
    const slug = route.params.slug as string
    const id = Number(route.params.slug)
    
    if (slug && !isNaN(id)) {
      const res = await newsApi.detail(id)
      article.value = res.data
      // Load related news
      const listRes = await newsApi.list({ limit: 4 })
      relatedNews.value = (listRes.data || []).filter((n: any) => n.id !== id).slice(0, 3)
    }
  } catch (error) {
    console.error('Failed to load article:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadArticle())
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Back -->
    <RouterLink to="/news" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      返回資訊
    </RouterLink>

    <!-- Loading -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-8 bg-muted rounded w-1/2 mb-4"></div>
      <div class="h-6 bg-muted rounded w-1/3 mb-8"></div>
      <div class="aspect-video bg-muted rounded-xl mb-8"></div>
      <div class="space-y-4">
        <div class="h-4 bg-muted rounded w-full"></div>
        <div class="h-4 bg-muted rounded w-full"></div>
        <div class="h-4 bg-muted rounded w-3/4"></div>
      </div>
    </div>

    <!-- Article -->
    <article v-else-if="article" class="max-w-3xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <Badge v-if="article.category" variant="secondary" class="mb-4">{{ article.category }}</Badge>
        <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ article.title }}</h1>
        
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <span v-if="article.published_at">
            {{ new Date(article.published_at).toLocaleDateString('zh-TW') }}
          </span>
          <span class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {{ article.views || 0 }} 閱讀
          </span>
          <span>符寶網編輯部</span>
        </div>
      </header>

      <!-- Cover -->
      <div v-if="article.cover" class="aspect-video rounded-xl overflow-hidden mb-8 bg-muted">
        <img :src="article.cover" :alt="article.title" class="w-full h-full object-cover" />
      </div>

      <!-- Content -->
      <div class="prose prose-lg max-w-none">
        <p v-if="article.summary" class="text-xl text-muted-foreground mb-6 font-medium">
          {{ article.summary }}
        </p>
        <div v-if="article.content" v-html="article.content" class="whitespace-pre-wrap"></div>
        <p v-else class="text-muted-foreground">
          暫無詳細內容
        </p>
      </div>

      <!-- Share -->
      <div class="mt-12 pt-8 border-t border-border">
        <p class="text-sm text-muted-foreground mb-4">分享這篇文章</p>
        <div class="flex gap-3">
          <button class="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
            </svg>
          </button>
          <button class="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.073c-.401 1.118-1.967 2.02-3.237 2.284-.424.088-.977.15-2.82-.588-2.373-.948-3.89-3.296-4.005-3.44-.117-.144-.92-1.24-1.01-2.33-.093-1.09.42-1.63.577-1.856.157-.227.34-.3.452-.3.112 0 .19 0 .273.012.089.012.209-.033.322.247.113.279.386 1.003.419 1.077.033.074.055.16.011.258-.044.099-.066.16-.133.248-.066.088-.14.197-.198.266-.059.068-.12.15-.052.296.067.145.298.6.639 1.002.438.52.808.68.923.755.114.075.18.063.246-.093.067-.156.28-.328.4-.443.121-.114.243-.135.378-.082.136.054.852.403 1.002.476.15.074.25.111.286.172.036.06.036.349-.086.693z"/>
            </svg>
          </button>
          <button class="w-10 h-10 rounded-full bg-[#4267B2] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>
      </div>
    </article>

    <!-- Related News -->
    <section v-if="relatedNews.length > 0" class="mt-16">
      <h2 class="text-2xl font-bold mb-6">相關資訊</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <RouterLink 
          v-for="item in relatedNews" 
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
          <div class="p-4">
            <Badge v-if="item.category" variant="secondary" class="mb-2">{{ item.category }}</Badge>
            <h3 class="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {{ item.title }}
            </h3>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
