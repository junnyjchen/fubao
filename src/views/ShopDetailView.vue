<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { goodsApi } from '@/lib/api'
import { useCartStore } from '@/stores/cart'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref<any>(null)
const loading = ref(true)
const quantity = ref(1)
const activeTab = ref('description')

async function loadProduct() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await goodsApi.detail(id)
    product.value = res.data
  } catch (error) {
    console.error('Failed to load product:', error)
  } finally {
    loading.value = false
  }
}

function addToCart() {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value)
    // Show feedback
    const btn = document.getElementById('add-to-cart-btn')
    if (btn) {
      btn.textContent = '已加入購物車'
      setTimeout(() => {
        btn.textContent = '加入購物車'
      }, 2000)
    }
  }
}

function buyNow() {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value)
    router.push('/cart')
  }
}

onMounted(() => loadProduct())
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Back -->
    <RouterLink to="/shop" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      返回商城
    </RouterLink>

    <!-- Loading -->
    <div v-if="loading" class="animate-pulse">
      <div class="grid md:grid-cols-2 gap-8">
        <div class="aspect-square bg-muted rounded-xl"></div>
        <div>
          <div class="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div class="h-6 bg-muted rounded w-1/2 mb-6"></div>
          <div class="h-32 bg-muted rounded mb-6"></div>
          <div class="h-12 bg-muted rounded w-full"></div>
        </div>
      </div>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="grid md:grid-cols-2 gap-8 mb-12">
      <!-- Images -->
      <div class="space-y-4">
        <div class="aspect-square bg-muted rounded-xl overflow-hidden border border-border">
          <img 
            v-if="product.main_image" 
            :src="product.main_image" 
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
            <span class="text-8xl text-primary/20 font-bold">符</span>
          </div>
        </div>
        
        <!-- Thumbnails -->
        <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
          <button 
            v-for="(img, idx) in product.images" 
            :key="idx"
            class="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
          >
            <img :src="img" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div>
        <!-- Tags -->
        <div class="flex items-center gap-2 mb-3">
          <Badge v-if="product.is_certified" class="bg-gold/90 text-gold-dark hover:bg-gold">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            平臺認證
          </Badge>
          <Badge v-if="product.category" variant="secondary">
            {{ product.category }}
          </Badge>
        </div>

        <!-- Title -->
        <h1 class="text-2xl md:text-3xl font-bold mb-4">{{ product.name }}</h1>

        <!-- Price -->
        <div class="flex items-baseline gap-3 mb-6">
          <span class="text-3xl font-bold text-primary">HK${{ product.price }}</span>
          <span v-if="product.original_price" class="text-lg text-muted-foreground line-through">
            HK${{ product.original_price }}
          </span>
          <Badge v-if="product.original_price" variant="destructive">
            省 HK${{ product.original_price - product.price }}
          </Badge>
        </div>

        <!-- Description -->
        <div class="prose prose-sm max-w-none mb-6">
          <p class="text-muted-foreground">{{ product.description || '暂无詳細描述' }}</p>
        </div>

        <!-- Stock -->
        <div class="flex items-center gap-2 mb-6 text-sm">
          <span class="text-muted-foreground">庫存：</span>
          <span :class="product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'">
            {{ product.stock > 0 ? `${product.stock} 件` : '缺貨' }}
          </span>
          <span v-if="product.stock <= 5 && product.stock > 0" class="text-xs text-amber-600">
            (庫存緊張)
          </span>
        </div>

        <!-- Quantity -->
        <div class="flex items-center gap-4 mb-8">
          <span class="text-muted-foreground">數量：</span>
          <div class="flex items-center border border-border rounded-lg overflow-hidden">
            <button 
              @click="quantity > 1 && quantity--"
              class="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              :disabled="quantity <= 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
              </svg>
            </button>
            <input 
              v-model.number="quantity"
              type="number" 
              min="1" 
              :max="product.stock"
              class="w-16 h-10 text-center border-x border-border bg-background focus:outline-none"
            />
            <button 
              @click="quantity < product.stock && quantity++"
              class="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              :disabled="quantity >= product.stock"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <Button 
            id="add-to-cart-btn"
            @click="addToCart"
            :disabled="product.stock <= 0"
            variant="outline"
            class="flex-1 h-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            加入購物車
          </Button>
          <Button 
            @click="buyNow"
            :disabled="product.stock <= 0"
            class="flex-1 h-12"
          >
            立即購買
          </Button>
        </div>

        <!-- Merchant -->
        <div class="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {{ product.merchant?.name?.charAt(0) || '商' }}
            </div>
            <div>
              <p class="font-medium">{{ product.merchant?.name || '符寶商城' }}</p>
              <p class="text-sm text-muted-foreground">正規授權 · 品質保障</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div v-if="product" class="border-t border-border pt-8">
      <div class="flex gap-1 border-b border-border mb-6">
        <button
          @click="activeTab = 'description'"
          class="px-6 py-3 font-medium transition-colors border-b-2 -mb-px"
          :class="activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          商品詳情
        </button>
        <button
          @click="activeTab = 'reviews'"
          class="px-6 py-3 font-medium transition-colors border-b-2 -mb-px"
          :class="activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          用戶評價
        </button>
        <button
          @click="activeTab = 'certificate'"
          class="px-6 py-3 font-medium transition-colors border-b-2 -mb-px"
          :class="activeTab === 'certificate' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          證書信息
        </button>
      </div>

      <!-- Description Content -->
      <div v-if="activeTab === 'description'" class="prose max-w-none">
        <div v-if="product.description" v-html="product.description" class="whitespace-pre-wrap"></div>
        <p v-else class="text-muted-foreground">暫無商品詳情</p>
      </div>

      <!-- Reviews -->
      <div v-else-if="activeTab === 'reviews'" class="text-center py-12">
        <p class="text-muted-foreground">暫無評價</p>
      </div>

      <!-- Certificate -->
      <div v-else-if="activeTab === 'certificate'">
        <div v-if="product.is_certified && product.certificate" class="p-6 bg-muted/50 rounded-xl border border-border">
          <h3 class="font-medium mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            平臺認證證書
          </h3>
          <p class="text-sm text-muted-foreground mb-2">證書編號：{{ product.certificate }}</p>
          <RouterLink to="/verify" class="text-sm text-primary hover:underline">
            前往驗證 →
          </RouterLink>
        </div>
        <p v-else class="text-muted-foreground">此商品暫無認證證書</p>
      </div>
    </div>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
