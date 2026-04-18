<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

const certificateCode = ref('')
const result = ref<any>(null)
const loading = ref(false)
const error = ref('')

async function verifyCertificate() {
  if (!certificateCode.value.trim()) {
    error.value = '請輸入證書編號'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  // Simulate API call
  setTimeout(() => {
    loading.value = false
    // Mock result
    if (certificateCode.value.toUpperCase().startsWith('FB')) {
      result.value = {
        valid: true,
        certificate: {
          code: certificateCode.value.toUpperCase(),
          goods: {
            name: '開光招財符',
            category: '符籙',
            image: null
          },
          merchant: '符寶商城',
          issueDate: '2024-01-15',
          expiryDate: '2029-01-15',
          verifiedAt: new Date().toISOString()
        }
      }
    } else {
      error.value = '未找到匹配的證書記錄'
    }
  }, 1500)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        證書驗證
      </h1>
      <p class="text-muted-foreground max-w-xl mx-auto">
        輸入您在商品外包裝或證書上找到的證書編號，驗證商品真偽及相關信息
      </p>
    </div>

    <!-- Search -->
    <Card class="max-w-xl mx-auto p-6 mb-8">
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">證書編號</label>
          <div class="flex gap-2">
            <Input 
              v-model="certificateCode"
              placeholder="請輸入證書編號（例如：FB2024XXXX）"
              class="flex-1 h-12 text-base font-mono"
              @keyup.enter="verifyCertificate"
            />
            <Button 
              @click="verifyCertificate" 
              :disabled="loading"
              class="h-12 px-8"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                驗證中
              </span>
              <span v-else>驗證</span>
            </Button>
          </div>
        </div>
        
        <p class="text-xs text-muted-foreground">
          提示：證書編號通常以「FB」開頭，位於商品吊牌或包裝盒上
        </p>
      </div>
    </Card>

    <!-- Error -->
    <div v-if="error" class="max-w-xl mx-auto p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-destructive/60 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      <p class="text-destructive font-medium">{{ error }}</p>
      <p class="text-sm text-muted-foreground mt-1">請檢查證書編號是否正確</p>
    </div>

    <!-- Result -->
    <Card v-if="result?.valid" class="max-w-xl mx-auto p-6">
      <!-- Valid Badge -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-emerald-600 mb-2">驗證成功</h2>
        <p class="text-muted-foreground">此證書為真品，平臺認證有效</p>
      </div>

      <!-- Certificate Details -->
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">證書編號</p>
            <p class="font-mono font-medium">{{ result.certificate.code }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">認證商戶</p>
            <p class="font-medium">{{ result.certificate.merchant }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">商品名稱</p>
            <p class="font-medium">{{ result.certificate.goods.name }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">商品類別</p>
            <p class="font-medium">{{ result.certificate.goods.category }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">發證日期</p>
            <p class="font-medium">{{ new Date(result.certificate.issueDate).toLocaleDateString('zh-TW') }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">有效期至</p>
            <p class="font-medium">{{ new Date(result.certificate.expiryDate).toLocaleDateString('zh-TW') }}</p>
          </div>
        </div>

        <!-- Verification Time -->
        <div class="pt-4 border-t border-border text-center">
          <p class="text-xs text-muted-foreground">
            本次驗證時間：{{ new Date(result.certificate.verifiedAt).toLocaleString('zh-TW') }}
          </p>
        </div>
      </div>
    </Card>

    <!-- Info -->
    <div class="max-w-xl mx-auto mt-12">
      <h3 class="font-medium mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        如何找到證書編號？
      </h3>
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>1. 查看商品吊牌上的金色二維碼下方</p>
        <p>2. 檢查包裝盒側面的標籤貼紙</p>
        <p>3. 打開包裝內的產品保修卡</p>
        <p>4. 掃描商品上的二維碼可直達驗證頁面</p>
      </div>
    </div>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
