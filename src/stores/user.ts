import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  function setUser(userData: User | null) { user.value = userData }
  function setToken(tokenData: string | null) {
    token.value = tokenData
    if (tokenData) localStorage.setItem('token', tokenData)
    else localStorage.removeItem('token')
  }
  function logout() {
    user.value = null; token.value = null; localStorage.removeItem('token')
  }
  return { user, token, setUser, setToken, logout }
})
