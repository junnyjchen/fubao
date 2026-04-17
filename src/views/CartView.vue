<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
function removeItem(id: number) { cartStore.removeItem(id) }
function updateQuantity(id: number, delta: number) { const item = cartStore.items.find(i => i.goods.id === id); if (item && item.quantity + delta >= 1) cartStore.updateQuantity(id, item.quantity + delta) }
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">購物車</h1>
    <div v-if="cartStore.items.length === 0" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-muted-foreground mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <p class="text-muted-foreground mb-4">購物車是空的</p>
      <RouterLink to="/shop" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium inline-block">去購物</RouterLink>
    </div>
    <div v-else class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cartStore.items" :key="item.goods.id" class="flex gap-4 p-4 bg-card rounded-xl border">
          <div class="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden"><img v-if="item.goods.main_image" :src="item.goods.main_image" :alt="item.goods.name" class="w-full h-full object-cover"/></div>
          <div class="flex-1 min-w-0">
            <RouterLink :to="`/shop/${item.goods.id}`" class="font-medium hover:text-primary transition-colors">{{ item.goods.name }}</RouterLink>
            <div class="flex items-center gap-2 mt-1 text-sm text-muted-foreground"><span>{{ item.goods.merchant?.name || '符寶商城' }}</span><span v-if="item.goods.is_certified" class="text-xs text-gold">認證</span></div>
            <div class="flex items-center justify-between mt-2">
              <span class="text-lg font-bold text-primary">HK${{ item.goods.price }}</span>
              <div class="flex items-center gap-2">
                <button @click="updateQuantity(item.goods.id, -1)" class="w-8 h-8 rounded border hover:bg-accent transition-colors">-</button>
                <span class="w-8 text-center">{{ item.quantity }}</span>
                <button @click="updateQuantity(item.goods.id, 1)" class="w-8 h-8 rounded border hover:bg-accent transition-colors">+</button>
                <button @click="removeItem(item.goods.id)" class="w-8 h-8 rounded border text-red-500 hover:bg-red-50 transition-colors ml-2"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-1">
        <div class="bg-card rounded-xl border p-6 sticky top-24">
          <h3 class="font-semibold mb-4">訂單摘要</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-muted-foreground">商品總數</span><span>{{ cartStore.totalItems }}</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">商品金額</span><span>HK${{ cartStore.totalPrice.toFixed(2) }}</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">運費</span><span>HK$0.00</span></div>
          </div>
          <div class="border-t my-4 pt-4">
            <div class="flex justify-between text-lg font-bold"><span>合計</span><span class="text-primary">HK${{ cartStore.totalPrice.toFixed(2) }}</span></div>
          </div>
          <RouterLink to="/checkout" class="block w-full py-3 bg-primary text-primary-foreground text-center rounded-lg font-medium hover:bg-primary/90 transition-colors">結算 ({{ cartStore.selectedItems.length }})</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
