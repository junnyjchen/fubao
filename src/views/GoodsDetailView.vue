<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { goodsApi } from '@/lib/api'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const goods = ref<any>(null)
const loading = ref(true)
const quantity = ref(1)

async function loadGoods() {
  loading.value = true
  try {
    const id = parseInt(route.params.id as string)
    const res = await goodsApi.detail(id)
    goods.value = res.data
  } catch (error) { console.error('Failed to load goods:', error) }
  finally { loading.value = false }
}

function addToCart() { if (goods.value) { cartStore.addItem(goods.value, quantity.value); alert('已加入購物車') } }
function buyNow() { if (goods.value) { cartStore.addItem(goods.value, quantity.value); router.push('/cart') } }
function changeQuantity(delta: number) { 
  const maxStock = goods.value?.stock || 99
  const newVal = quantity.value + delta
  if (newVal >= 1 && newVal <= maxStock) {
    quantity.value = newVal
  }
}

onMounted(() => { loadGoods() })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="animate-pulse"><div class="grid md:grid-cols-2 gap-8"><div class="aspect-square bg-muted rounded-lg"></div><div class="space-y-4"><div class="h-8 bg-muted rounded w-3/4"></div><div class="h-4 bg-muted rounded w-1/2"></div></div></div></div>
    <div v-else-if="goods" class="grid md:grid-cols-2 gap-8">
      <div>
        <div class="aspect-square bg-muted rounded-xl overflow-hidden mb-4"><img v-if="goods.main_image" :src="goods.main_image" :alt="goods.name" class="w-full h-full object-cover"/></div>
      </div>
      <div>
        <div class="flex items-center gap-2 mb-2"><span v-if="goods.is_certified" class="px-2 py-0.5 bg-gold text-xs font-medium rounded">認證商品</span></div>
        <h1 class="text-2xl font-bold mb-4">{{ goods.name }}</h1>
        <p v-if="goods.subtitle" class="text-muted-foreground mb-6">{{ goods.subtitle }}</p>
        <div class="bg-muted/50 rounded-xl p-6 mb-6">
          <div class="flex items-baseline gap-2 mb-4"><span class="text-3xl font-bold text-primary">HK${{ goods.price }}</span><span v-if="goods.original_price" class="text-lg text-muted-foreground line-through">HK${{ goods.original_price }}</span></div>
          <div class="flex items-center gap-4 text-sm text-muted-foreground"><span>已售 {{ goods.sales }}</span><span>庫存 {{ goods.stock || 99 }}</span></div>
        </div>
        <div v-if="goods.merchant" class="flex items-center gap-4 p-4 bg-card rounded-xl border mb-6">
          <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">{{ goods.merchant.name?.charAt(0) || '商' }}</div>
          <div><p class="font-medium">{{ goods.merchant.name }}</p><div class="flex items-center gap-2 text-sm text-muted-foreground"><span>⭐ {{ goods.merchant.rating }}</span><span>|</span><span>已售 {{ goods.merchant.total_sales }}</span></div></div>
        </div>
        <div class="flex items-center gap-4 mb-6"><span class="text-muted-foreground">數量</span><div class="flex items-center border rounded-lg"><button @click="changeQuantity(-1)" class="px-4 py-2 hover:bg-accent transition-colors">-</button><span class="px-4 py-2 font-medium">{{ quantity }}</span><button @click="changeQuantity(1)" class="px-4 py-2 hover:bg-accent transition-colors">+</button></div></div>
        <div class="flex gap-4">
          <button @click="addToCart" class="flex-1 px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors">加入購物車</button>
          <button @click="buyNow" class="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">立即購買</button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-16"><p class="text-muted-foreground">商品不存在</p><RouterLink to="/shop" class="text-primary hover:underline mt-4 inline-block">返回商城</RouterLink></div>
  </div>
</template>
