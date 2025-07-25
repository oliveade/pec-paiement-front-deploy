<template>
  <SiteTestNavbarView />
  <div class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Votre Panier</h1>

    <div v-if="cart.length === 0" class="text-gray-500 text-center">
      Votre panier est vide.
    </div>

    <div v-else>
      <div class="space-y-6">
        <div v-for="(item, index) in cart" :key="index"
          class="flex items-center justify-between bg-white p-4 rounded shadow">
          <div class="flex items-center space-x-4">
            <img :src="item.image || 'https://via.placeholder.com/64'" alt="Produit"
              class="w-16 h-16 object-cover rounded" />
            <div>
              <h2 class="font-semibold text-gray-800">{{ item.name }}</h2>
              <p class="text-amber-600">{{ item.price }} €</p>
            </div>
          </div>
          <button @click="removeItem(index)" class="text-red-500 hover:text-red-700 font-semibold">
            Supprimer
          </button>
        </div>
      </div>

      <div class="mt-10 bg-gray-50 p-6 rounded shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-700">
          Informations Client
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Nom</label>
            <input v-model="client.name" placeholder="Jean Dupont"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Email</label>
            <input v-model="client.email" placeholder="jean@example.com"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-600 mb-1">Adresse</label>
            <input v-model="client.address" placeholder="123 rue Exemple, Paris"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between items-center border-t pt-6">
        <div class="text-xl font-bold text-gray-800">Total : {{ total }} €</div>

        <button :disabled="loading" @click="createTransaction"
          class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded shadow disabled:opacity-50">
          {{ loading ? 'Création...' : 'Valider et Payer' }}
        </button>
      </div>

      <div v-if="error" class="mt-4 text-red-600 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SiteTestNavbarView from '@/components/SiteTestNavbarView.vue'
import axios from 'axios'

const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL
const cart = ref([])
const client = ref({
  name: '',
  email: '',
  address: ''
})
const loading = ref(false)
const error = ref('')

onMounted(() => {
  const storedCart = localStorage.getItem('cart')
  cart.value = storedCart ? JSON.parse(storedCart) : []
})

const removeItem = (index) => {
  cart.value.splice(index, 1)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price, 0)
)

const createTransaction = async () => {
  loading.value = true
  error.value = ''
  const appId = import.meta.env.VITE_MERCHANT_APP_ID
  const appSecret = import.meta.env.VITE_MERCHANT_APP_SECRET
  try {
    const { data } = await axios.post(`${apiUrl}/transactions`, {
      amount: total.value,
      currency: 'EUR',
      customer: client.value,
      metadata: {
        items: cart.value
      },
      redirectSuccessUrl: `${window.location.origin}/payment-success`,
      redirectCancelUrl: `${window.location.origin}/payment-cancel`,
      callbackUrl: `${apiUrl}/callback`

    },
      {
        headers: {
          appId,
          appSecret
        }
      })

    localStorage.setItem('lastTransactionId', data.transactionId)
    router.push('/checkout')
  } catch (err) {
    console.error(err)
    error.value = 'Erreur lors de la création de la transaction.'
  } finally {
    loading.value = false
  }
}

</script>
