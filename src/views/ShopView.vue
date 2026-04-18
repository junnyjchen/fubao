<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { goodsApi } from '@/lib/api'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

const route = useRoute()
const goods = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('default')

const categories = [
  { value: 'all', label: '全部' },
  { value: 'talisman', label: '符籙' },
  { value: 'tool', label: '法器' },
  { value: 'book', label: '典籍' },
  { value: 'ornament', label: '擺件' },
]

async function loadGoods() {
  loading.value = true
  try {
    const res = await goodsApi.list({ 
      category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value !== 'default' ? sortBy.value : undefined,
    })
    goods.value = res.data || []
  } catch (error) {
    console.error('Failed to load goods:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  loadGoods()
}

watch([selectedCategory, sortBy], () => {
  loadGoods()
})

onMounted(() => {
  if (route.query.category) {
    selectedCategory.value = route.query.category as string
  }
  loadGoods()
})

const filteredGoods = computed(() => goods.value)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">商城</h1>
      <p class="text-muted-foreground">探索精選玄門文化商品</p>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <div class="flex-1 relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <Input 
          v-model="searchQuery"
          placeholder="搜索商品..."
          class="pl-10"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="flex gap-2">
        <select 
          v-model="selectedCategory"
          class="h-10 px-3 rounded-lg border border-[var(--input)] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <select 
          v-model="sortBy"
          class="h-10 px-3 rounded-lg border border-[var(--input)] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="default">默認排序</option>
          <option value="price_asc">價格從低到高</option>
          <option value="price_desc">價格從高到低</option>
          <option value="sales">銷量優先</option>
        </select>
      </div>
    </div>

    <!-- Category Pills (Mobile) -->
    <div class="flex gap-2 overflow-x-auto pb-4 md:hidden -mx-4 px-4 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="selectedCategory = cat.value"
        class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="selectedCategory === cat.value 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80'"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="i in 10" :key="i" class="animate-pulse">
        <div class="aspect-square bg-muted rounded-lg mb-3"></div>
        <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else-if="filteredGoods.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <RouterLink 
        v-for="item in filteredGoods" 
        :key="item.id"
        :to="`/shop/${item.id}`"
        class="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
      >
        <div class="aspect-square bg-muted relative overflow-hidden">
          <img 
            v-if="item.main_image" 
            :src="item.main_image" 
            :alt="item.name"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div v-else class="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
            <span class="text-5xl text-primary/30 font-bold">符</span>
          </div>
          
          <!-- Badges -->
          <div class="absolute top-2 left-2 right-2 flex justify-between">
            <span v-if="item.is_certified" class="px-2 py-0.5 bg-gold/90 text-gold-dark text-xs font-medium rounded flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              認證
            </span>
            <Badge v-if="item.stock <= 5 && item.stock > 0" variant="destructive" class="ml-auto">
              僅剩 {{ item.stock }}
            </Badge>
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {{ item.name }}
          </h3>
          
          <!-- Price -->
          <div class="flex items-baseline gap-1 mb-3">
            <span class="text-xl font-bold text-primary">HK${{ item.price }}</span>
            <span v-if="item.original_price" class="text-sm text-muted-foreground line-through">
              HK${{ item.original_price }}
            </span>
          </div>
          
          <!-- Meta -->
          <div class="flex items-center justify-between pt-3 border-t border-border/50">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {{ item.merchant?.name?.charAt(0) || '商' }}
              </div>
              <span class="text-xs text-muted-foreground truncate max-w-[80px]">
                {{ item.merchant?.name || '符寶商城' }}
              </span>
            </div>
            <span class="text-xs text-muted-foreground">
              銷量 {{ item.sales || 0 }}
            </span>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted-foreground/50 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
      <h3 class="text-lg font-medium mb-2">未找到商品</h3>
      <p class="text-muted-foreground mb-4">嘗試調整搜索條件或類別</p>
      <Button variant="outline" @click="searchQuery = ''; selectedCategory = 'all'; loadGoods()">
        清除篩選
      </Button>
    </div>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
