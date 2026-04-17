<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderApi } from '@/lib/api'

const route = useRoute()
const order = ref<any>(null)
const loading = ref(true)
const statusLabels = ['待付款', '待發貨', '已發貨', '已完成', '已取消']

async function loadOrder() {
  loading.value = true
  try {
    const id = parseInt(route.params.id as string)
    const res = await orderApi.detail(id)
    order.value = res.data
  } catch (error) { console.error('Failed to load order:', error) }
  finally { loading.value = false }
}
onMounted(() => { loadOrder() })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">訂單詳情</h1>
    <div v-if="loading" class="animate-pulse space-y-4"><div class="h-24 bg-muted rounded-lg"></div><div class="h-48 bg-muted rounded-lg"></div></div>
    <div v-else-if="order" class="space-y-6">
      <div class="bg-card rounded-xl border p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">訂單編號</p><p class="font-medium">{{ order.order_no }}</p></div><span class="px-4 py-2 rounded-full text-sm font-medium" :class="{ 'bg-yellow-100 text-yellow-800': order.status === 0, 'bg-blue-100 text-blue-800': order.status === 1, 'bg-green-100 text-green-800': order.status === 3, 'bg-gray-100 text-gray-800': order.status === 4 }">{{ statusLabels[order.status] }}</span></div></div>
      <div class="bg-card rounded-xl border overflow-hidden"><div class="p-4 border-b"><h3 class="font-medium">商品列表</h3></div><div class="divide-y"><div v-for="item in order.items" :key="item.id" class="flex gap-4 p-4"><div class="w-20 h-20 rounded-lg bg-muted"><img v-if="item.main_image" :src="item.main_image" :alt="item.goods_name" class="w-full h-full object-cover rounded-lg"/></div><div class="flex-1"><h4 class="font-medium">{{ item.goods_name }}</h4><div class="flex items-center justify-between mt-2 text-sm text-muted-foreground"><span>HK${{ item.price }} × {{ item.quantity }}</span><span class="font-medium">HK${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span></div></div></div></div><div class="p-4 bg-muted/50"><div class="flex justify-between text-lg font-bold"><span>合計</span><span class="text-primary">HK${{ order.total_amount }}</span></div></div></div>
      <div class="bg-card rounded-xl border p-6"><h3 class="font-medium mb-4">訂單信息</h3><div class="grid grid-cols-2 gap-4 text-sm"><div><p class="text-muted-foreground">下單時間</p><p>{{ new Date(order.created_at).toLocaleString('zh-TW') }}</p></div><div><p class="text-muted-foreground">支付方式</p><p>{{ order.payment_method || '在線支付' }}</p></div></div></div>
    </div>
    <div v-else class="text-center py-16"><p class="text-muted-foreground">訂單不存在</p><RouterLink to="/" class="text-primary hover:underline mt-4 inline-block">返回首頁</RouterLink></div>
  </div>
</template>
