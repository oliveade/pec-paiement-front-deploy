<template>
  <div class="min-h-screen bg-gray-100">
    <AppNavbar v-if="showNavbar" />

    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/NavbarView.vue'

const route = useRoute()

const hiddenRoutes = ['/login', '/admin/login', '/choose', '/register', '/cart', '/credentials', '/product', '/transactions', '/checkout','/payment-success','/payment-cancel', '/payment-processing','/activation-success']

const showNavbar = computed(() => !hiddenRoutes.includes(route.path))
</script>
