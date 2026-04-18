<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const messages = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([
  {
    role: 'assistant',
    content: '您好！我是符寶網的 AI 助手，專門為您解答關於玄門文化的問題。\n\n您可以向我詢問：\n• 符籙的種類與用途\n• 風水學的基本知識\n• 如何選擇吉日\n• 各種法器的使用方法\n• 傳統文化習俗等\n\n請問有什麼可以幫到您的？'
  }
])
const inputMessage = ref('')
const loading = ref(false)

async function sendMessage() {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''
  loading.value = true

  // Simulate AI response
  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: '感謝您的提問！\n\n關於您詢問的內容，讓我為您詳細解答：\n\n我們平台提供專業的知識科普內容，您可以前往「百科」頁面了解更多詳細資訊。如果需要選購相關商品，也可以瀏覽我們的商城。\n\n還有其他問題嗎？'
    })
    loading.value = false
  }, 1500)
}

const quickQuestions = [
  '符籙如何使用？',
  '什麼是風水學？',
  '如何選擇吉日？',
  '法器有哪些？'
]
</script>

<template>
  <div class="container mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
    <!-- Header -->
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
        </svg>
        AI 助手
      </h1>
      <p class="text-muted-foreground">24小時在線為您解答玄門文化疑問</p>
    </div>

    <!-- Chat Container -->
    <Card class="flex-1 flex flex-col overflow-hidden">
      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <!-- Avatar -->
          <div 
            class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium"
            :class="msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
          >
            <svg v-if="msg.role === 'assistant'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          <!-- Message Content -->
          <div 
            class="max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap"
            :class="msg.role === 'user' 
              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
              : 'bg-muted rounded-tl-sm'"
          >
            {{ msg.content }}
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
          </div>
          <div class="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Questions -->
      <div v-if="messages.length === 1" class="px-4 pb-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="q in quickQuestions"
            :key="q"
            @click="inputMessage = q; sendMessage()"
            class="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-border">
        <div class="flex gap-2">
          <input 
            v-model="inputMessage"
            type="text"
            placeholder="輸入您的問題..."
            class="flex-1 h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="sendMessage"
          />
          <Button @click="sendMessage" :disabled="loading || !inputMessage.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </Button>
        </div>
      </div>
    </Card>

    <!-- Mobile Bottom Spacer -->
    <div class="h-20 md:hidden"></div>
  </div>
</template>
