<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { baikeApi } from '@/lib/api'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref('all')
const loading = ref(true)
const searchQuery = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await baikeApi.list()
    articles.value = res.data || []
    // Extract unique categories
    const cats = new Set<string>()
    articles.value.forEach((a: any) => {
      if (a.category) cats.add(a.category)
    })
    categories.value = ['全部', ...Array.from(cats)]
  } catch (error) {
    console.error('Failed to load baike:', error)
  } finally {
    loading.value = false
  }
}

function filterByCategory(cat: string) {
  selectedCategory.value = cat === '全部' ? 'all' : cat
}

const filteredArticles = ref<any[]>([])

function handleSearch() {
  if (!searchQuery.value.trim()) {
    filteredArticles.value = articles.value
    return
  }
  const q = searchQuery.value.toLowerCase()
  filteredArticles.value = articles.value.filter((a: any) => 
    a.title.toLowerCase().includes(q) || 
    (a.summary && a.summary.toLowerCase().includes(q))
  )
}

onMounted(() => {
  loadData()
})

const featuredArticles = [
  { id: 1, title: '符籙基礎', summary: '認識道教符籙的起源、分類與使用方法', category: '符籙', icon: 'scroll' },
  { id: 2, title: '風水入門', summary: '了解風水學的基本原理與應用場景', category: '風水', icon: 'compass' },
  { id: 3, title: '擇日要義', summary: '掌握黃道吉日的選擇方法與注意事項', category: '擇日', icon: 'calendar' },
  { id: 4, title: '法器介紹', summary: '認識各種法器的名稱、用途與保養', category: '法器', icon: 'tool' },
  { id: 5, title: '經文導讀', summary: '解讀常用經文的含義與誦讀規範', category: '經文', icon: 'book' },
  { id: 6, title: '命理基礎', summary: '八字、面相、手相的基礎知識概述', category: '命理', icon: 'star' },
]
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">玄門文化百科</h1>
      <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
        探索中華傳統玄學文化，從基礎知識到進階理論，系統化學習
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-xl mx-auto mb-12">
      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <Input 
          v-model="searchQuery"
          placeholder="搜索百科知識..."
          class="pl-12 h-12 text-base"
          @keyup.enter="handleSearch"
        />
        <button 
          @click="handleSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- Featured Categories -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
        知識分類
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <RouterLink 
          v-for="(article, index) in featuredArticles" 
          :key="article.id"
          to="/baike"
          class="group p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <div 
            class="w-12 h-12 mb-4 rounded-xl flex items-center justify-center transition-colors"
            :class="[
              index % 6 === 0 ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' : '',
              index % 6 === 1 ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' : '',
              index % 6 === 2 ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' : '',
              index % 6 === 3 ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-200' : '',
              index % 6 === 4 ? 'bg-red-100 text-red-600 group-hover:bg-red-200' : '',
              index % 6 === 5 ? 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200' : '',
            ]"
          >
            <svg v-if="article.icon === 'scroll'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/>
              <path d="M19 3H7a2 2 0 0 0-2 2v11"/>
            </svg>
            <svg v-else-if="article.icon === 'compass'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <svg v-else-if="article.icon === 'calendar'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <svg v-else-if="article.icon === 'tool'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <svg v-else-if="article.icon === 'book'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <Badge variant="secondary" class="mb-2">{{ article.category }}</Badge>
          <h3 class="font-medium mb-1 group-hover:text-primary transition-colors">{{ article.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ article.summary }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- Latest Articles -->
    <section>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        推薦閱讀
      </h2>

      <!-- Loading -->
      <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="h-48 bg-muted rounded-xl mb-4"></div>
          <div class="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink 
          v-for="article in filteredArticles.length > 0 ? filteredArticles : articles" 
          :key="article.id"
          :to="`/baike/${article.slug || article.id}`"
          class="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all"
        >
          <div class="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span class="text-4xl text-primary/30 font-bold group-hover:scale-110 transition-transform">
              {{ article.title?.charAt(0) || '文' }}
            </span>
          </div>
          <div class="p-5">
            <Badge v-if="article.category" variant="secondary" class="mb-3">{{ article.category }}</Badge>
            <h3 class="font-medium text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {{ article.title }}
            </h3>
            <p v-if="article.summary" class="text-sm text-muted-foreground line-clamp-2">
              {{ article.summary }}
            </p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
