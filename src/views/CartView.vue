<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const cartStore = useCartStore()

const totalAmount = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + item.goods.price * item.quantity, 0)
})

const originalTotal = computed(() => {
  return cartStore.items.reduce((sum, item) => {
    return sum + (item.goods.original_price || item.goods.price) * item.quantity
  }, 0)
})

const savings = computed(() => originalTotal.value - totalAmount.value)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">購物車</h1>
      <p class="text-muted-foreground">共 {{ cartStore.totalItems }} 件商品</p>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto text-muted-foreground/50 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <h3 class="text-xl font-medium mb-2">購物車是空的</h3>
      <p class="text-muted-foreground mb-6">快去挑選心儀的商品吧</p>
      <RouterLink to="/shop">
        <Button>去商城逛逛</Button>
      </RouterLink>
    </div>

    <!-- Cart Content -->
    <div v-else class="grid lg:grid-cols-3 gap-8">
      <!-- Items List -->
      <div class="lg:col-span-2 space-y-4">
        <div 
          v-for="item in cartStore.items" 
          :key="item.goods.id"
          class="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm"
        >
          <!-- Image -->
          <RouterLink :to="`/shop/${item.goods.id}`" class="flex-shrink-0">
            <div class="w-24 h-24 rounded-lg overflow-hidden bg-muted">
              <img 
                v-if="item.goods.main_image" 
                :src="item.goods.main_image" 
                :alt="item.goods.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                <span class="text-2xl text-primary/30 font-bold">符</span>
              </div>
            </div>
          </RouterLink>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <RouterLink :to="`/shop/${item.goods.id}`" class="font-medium line-clamp-2 mb-1 hover:text-primary transition-colors">
              {{ item.goods.name }}
            </RouterLink>
            
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-lg font-bold text-primary">HK${{ item.goods.price }}</span>
              <span v-if="item.goods.original_price" class="text-sm text-muted-foreground line-through">
                HK${{ item.goods.original_price }}
              </span>
            </div>

            <!-- Quantity -->
            <div class="flex items-center justify-between">
              <div class="flex items-center border border-border rounded-lg overflow-hidden">
                <button 
                  @click="cartStore.decreaseItem(item.goods.id)"
                  class="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                  </svg>
                </button>
                <span class="w-12 h-8 flex items-center justify-center text-sm border-x border-border bg-background">
                  {{ item.quantity }}
                </span>
                <button 
                  @click="cartStore.addItem(item.goods, 1)"
                  class="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                </button>
              </div>

              <button 
                @click="cartStore.removeItem(item.goods.id)"
                class="text-muted-foreground hover:text-destructive transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button 
          @click="cartStore.clearCart()"
          class="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          清空購物車
        </button>
      </div>

      <!-- Summary -->
      <div>
        <Card class="p-6 sticky top-24">
          <h2 class="font-bold text-lg mb-4">訂單摘要</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">商品總額</span>
              <span>HK${{ originalTotal.toFixed(2) }}</span>
            </div>
            <div v-if="savings > 0" class="flex justify-between text-sm text-emerald-600">
              <span>優惠金額</span>
              <span>-HK${{ savings.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">運費</span>
              <span>{{ totalAmount >= 500 ? '免費' : 'HK$30.00' }}</span>
            </div>
          </div>

          <div class="border-t border-border pt-4 mb-6">
            <div class="flex justify-between font-bold text-lg">
              <span>合計</span>
              <span class="text-primary">HK${{ (totalAmount + (totalAmount >= 500 ? 0 : 30)).toFixed(2) }}</span>
            </div>
            <p v-if="totalAmount < 500" class="text-xs text-muted-foreground mt-2">
              購物滿 HK$500 即可免運費
            </p>
          </div>

          <Button class="w-full h-12 text-base">
            結算
          </Button>

          <div class="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="9" height="11" x="2" y="7" rx="1" ry="1"/>
              <path d="M24 11v2a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z"/>
            </svg>
            安全支付 · 保障隱私
          </div>
        </Card>
      </div>
    </div>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
