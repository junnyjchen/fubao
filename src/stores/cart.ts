import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Goods } from '@/types'

export interface CartItem { goods: Goods; quantity: number; selected: boolean }

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const selectedItems = computed(() => items.value.filter(item => item.selected))
  const totalPrice = computed(() => selectedItems.value.reduce((sum, item) => sum + parseFloat(item.goods.price) * item.quantity, 0))

  function addItem(goods: Goods, quantity = 1) {
    const existing = items.value.find(item => item.goods.id === goods.id)
    if (existing) existing.quantity += quantity
    else items.value.push({ goods, quantity, selected: true })
  }
  function removeItem(goodsId: number) { items.value = items.value.filter(item => item.goods.id !== goodsId) }
  function updateQuantity(goodsId: number, quantity: number) {
    const item = items.value.find(item => item.goods.id === goodsId)
    if (item) item.quantity = quantity
  }
  function toggleSelect(goodsId: number) {
    const item = items.value.find(item => item.goods.id === goodsId)
    if (item) item.selected = !item.selected
  }
  function clearCart() { items.value = [] }
  return { items, totalItems, selectedItems, totalPrice, addItem, removeItem, updateQuantity, toggleSelect, clearCart }
})
