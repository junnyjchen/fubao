<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(true)
const form = ref({ email: '', password: '', name: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    if (isLogin.value) {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.value.email, password: form.value.password }) })
      const data = await res.json()
      if (data.data) { userStore.setUser(data.data); userStore.setToken(data.token); router.push('/') }
      else { error.value = '登入失敗' }
    } else {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form.value) })
      const data = await res.json()
      if (data.data) { userStore.setUser(data.data); userStore.setToken(data.token); router.push('/') }
      else { error.value = '註冊失敗' }
    }
  } catch (err) { error.value = '請求失敗，請稍後重試' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <div class="max-w-md mx-auto">
      <div class="bg-card rounded-xl border p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">符</div>
          <h1 class="text-2xl font-bold">{{ isLogin ? '登入' : '註冊' }}</h1>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="!isLogin"><label class="block text-sm font-medium mb-2">用戶名</label><input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="請輸入用戶名"/></div>
          <div><label class="block text-sm font-medium mb-2">電子郵箱</label><input v-model="form.email" type="email" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="請輸入電子郵箱"/></div>
          <div><label class="block text-sm font-medium mb-2">密碼</label><input v-model="form.password" type="password" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="請輸入密碼"/></div>
          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
          <button type="submit" :disabled="loading" class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{{ loading ? '處理中...' : (isLogin ? '登入' : '註冊') }}</button>
        </form>
        <div class="mt-6 text-center text-sm"><span class="text-muted-foreground">{{ isLogin ? '還沒有帳戶？' : '已有帳戶？' }}</span><button @click="isLogin = !isLogin" class="text-primary hover:underline ml-1">{{ isLogin ? '立即註冊' : '立即登入' }}</button></div>
      </div>
    </div>
  </div>
</template>
