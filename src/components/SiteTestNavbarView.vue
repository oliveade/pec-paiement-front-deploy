<template>
  <nav class="bg-white shadow p-4 flex justify-between items-center">
    <router-link to="/product" class="text-xl font-bold text-amber-600 hover:text-amber-700">
      Site Test Paiement
    </router-link>
    <div class="space-x-8">
      <router-link to="/admin/login" class="text-xl text-gray-700 hover:text-amber-600">
        Connexion Admin
      </router-link>
      <router-link to="/login" class="text-xl text-gray-700 hover:text-amber-600">
        Connexion Marchand
      </router-link>
      <router-link to="/configuration" class="text-xl text-gray-700 hover:text-amber-600">
        Identifiantq
      </router-link>
    </div>
    <div class="flex items-center space-x-4">
      <router-link to="/cart" class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-700 hover:text-amber-600" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 1.293a1 1 0 001.414 1.414L7 13zm10 0l1.293 1.293a1 1 0 01-1.414 1.414L17 13zm-5 8a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        <span v-if="cartCount > 0"
          class="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {{ cartCount }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const cartCount = ref(0)

onMounted(() => {
  updateCartCount()
  window.addEventListener('cart-updated', updateCartCount)
  window.addEventListener('storage', updateCartCount)
})
onUnmounted(() => {
  window.removeEventListener('cart-updated', updateCartCount)
  window.removeEventListener('storage', updateCartCount)
})

const updateCartCount = () => {
  const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
  cartCount.value = storedCart.length
}
</script>
