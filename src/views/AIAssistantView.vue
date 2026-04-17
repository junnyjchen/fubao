<script setup lang="ts">
const messages = ref<Array<{role: string, content: string}>>([
  { role: 'assistant', content: '您好！我是符寶網 AI 助手，可以幫您解答關於玄門文化、符籙知識等問題。請問有什麼可以幫到您？' }
])
const input = ref('')
const loading = ref(false)

async function sendMessage() {
  if (!input.value.trim() || loading.value) return
  const userMsg = input.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  input.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg }) })
    if (res.ok) {
      const data = await res.json()
      messages.value.push({ role: 'assistant', content: data.data || '抱歉，我無法回答這個問題。' })
    } else { messages.value.push({ role: 'assistant', content: '抱歉，服務暫時不可用。' }) }
  } catch (error) { messages.value.push({ role: 'assistant', content: '抱歉，網絡錯誤。' }) }
  finally { loading.value = false }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">AI 助手</h1>
      <div class="bg-card rounded-xl border h-[500px] flex flex-col">
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="(msg, index) in messages" :key="index" class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><span class="text-sm">{{ msg.role === 'user' ? '我' : 'AI' }}</span></div>
            <div class="max-w-[70%] px-4 py-2 rounded-lg" :class="msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'">{{ msg.content }}</div>
          </div>
          <div v-if="loading" class="flex gap-3"><div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><span class="text-sm">AI</span></div><div class="bg-muted px-4 py-2 rounded-lg"><span class="animate-pulse">思考中...</span></div></div>
        </div>
        <div class="p-4 border-t">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input v-model="input" type="text" placeholder="輸入您的問題..." class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" :disabled="loading"/>
            <button type="submit" :disabled="loading || !input.trim()" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">發送</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
