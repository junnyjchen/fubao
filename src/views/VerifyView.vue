<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/lib/api'

const certificateNo = ref('')
const result = ref<any>(null)
const loading = ref(false)
const error = ref('')

async function verifyCertificate() {
  if (!certificateNo.value.trim()) return
  loading.value = true; error.value = ''; result.value = null
  try {
    const res = await api(`/certificate/verify?no=${certificateNo.value.trim()}`)
    result.value = res.data
  } catch (err: any) { error.value = err.message || '驗證失敗' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-center">證書驗證</h1>
      <div class="bg-card rounded-xl border p-6 mb-8">
        <p class="text-muted-foreground mb-4">輸入證書編號查詢商品真偽</p>
        <form @submit.prevent="verifyCertificate" class="flex gap-2">
          <input v-model="certificateNo" type="text" placeholder="請輸入證書編號，例如：FB-FU-2024-001" class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
          <button type="submit" :disabled="loading || !certificateNo.trim()" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{{ loading ? '驗證中...' : '驗證' }}</button>
        </form>
      </div>
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{{ error }}</div>
      <div v-if="result" class="bg-card rounded-xl border overflow-hidden">
        <div class="p-6 bg-gold/10 border-b border-gold/30"><div class="flex items-center gap-2 text-gold"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg><span class="font-semibold">驗證成功</span></div></div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div><p class="text-sm text-muted-foreground">商品名稱</p><p class="font-medium">{{ result.goods_name }}</p></div>
            <div><p class="text-sm text-muted-foreground">證書編號</p><p class="font-medium">{{ result.certificate_no }}</p></div>
            <div><p class="text-sm text-muted-foreground">發證機構</p><p class="font-medium">{{ result.issued_by }}</p></div>
            <div><p class="text-sm text-muted-foreground">發證日期</p><p class="font-medium">{{ result.issue_date }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
