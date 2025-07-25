<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import RefundModal from '@/components/RefundModalView.vue'
import {
  KeyIcon,
  PlusIcon,
  CreditCardIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/vue/24/solid'

import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartStats = ref(null)
const merchant = ref(null)
const transactions = ref([])
const showRefundModal = ref(false)
const selectedTransaction = ref(null)
const newAppSecret = ref('')
const error = ref('')
const token = localStorage.getItem('token')
const apiUrl = import.meta.env.VITE_API_URL

const sseStats = ref(null)
const sseConnected = ref(false)
const eventSource = ref(null)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5

const connectSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
  }

  const sseUrl = `${apiUrl}/merchants/dashboard-stream`
  eventSource.value = new EventSource(sseUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  eventSource.value.onopen = () => {
    console.log('SSE Marchand connecté')
    sseConnected.value = true
    reconnectAttempts.value = 0
  }

  eventSource.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('Données SSE reçues:', data)
      sseStats.value = data
    } catch (err) {
      console.error('Erreur parsing SSE:', err)
    }
  }

  eventSource.value.onerror = (error) => {
    console.error('Erreur SSE:', error)
    sseConnected.value = false

    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      console.log(`Tentative de reconnexion ${reconnectAttempts.value}/${maxReconnectAttempts}`)
      setTimeout(() => {
        connectSSE()
      }, 2000 * reconnectAttempts.value)
    }
  }
}

const currentStats = computed(() => {
  return sseStats.value || chartStats.value
})

const fetchChartStats = async () => {
  try {
    const response = await axios.get(`${apiUrl}/merchants/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    chartStats.value = response.data
  } catch (err) {
    console.error('Erreur récupération stats chart', err)
  }
}

onMounted(() => {
  fetchMerchant()
  fetchChartStats()
  connectSSE()
})

onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
  }
})

const barData = computed(() => {
  if (!currentStats.value) return null
  return {
    labels: ['Succès', 'Échecs'],
    datasets: [
      {
        label: 'Montant (€)',
        data: [
          currentStats.value.totalAmountSuccess || 0,
          currentStats.value.totalAmountFailed || 0
        ],
        backgroundColor: ['#10B981', '#EF4444']
      }
    ]
  }
})

const dailyData = computed(() => {
  if (!currentStats.value || !currentStats.value.transactionsPerDay) return null
  return {
    labels: currentStats.value.transactionsPerDay.map(t => t.date),
    datasets: [
      {
        label: 'Transactions / jour',
        data: currentStats.value.transactionsPerDay.map(t => t.count),
        backgroundColor: '#3B82F6'
      }
    ]
  }
})

const fetchMerchant = async () => {
  try {
    const response = await axios.get(`${apiUrl}/merchants/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    merchant.value = response.data.merchant
    fetchTransactions()
  } catch (err) {
    const msg = err.response?.data?.error || 'Erreur de chargement du profil.'
    error.value = msg
    if (msg.includes('Token invalide') || msg.includes('expiré')) {
      localStorage.removeItem('token')
      alert('Session expirée. Merci de vous reconnecter.')
      window.location.href = '/login'
    }
  }
}

const fetchTransactions = async () => {
  try {
    const response = await axios.get(`${apiUrl}/transactions/merchant`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    transactions.value = response.data.transactions
  } catch (err) {
    error.value = 'Erreur lors du chargement des transactions'
  }
}

const regenerateCredentials = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/merchants/regenerate-credentials`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    newAppSecret.value = response.data.appSecret
    alert('Nouveau APP_SECRET : ' + newAppSecret.value)
  } catch (err) {
    error.value = err.response?.data?.error || 'Erreur lors de la régénération.'
  }
}

const openRefundModal = (transaction) => {
  selectedTransaction.value = transaction
  showRefundModal.value = true
}

const onRefundSuccess = () => {
  fetchTransactions()
  showRefundModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-amber-600 flex items-center gap-2">
          <CreditCardIcon class="w-7 h-7" /> Tableau de bord Marchand
        </h1>

        <div class="flex items-center gap-2 text-sm">
          <div :class="{
            'text-green-600': sseConnected,
            'text-red-600': !sseConnected
          }" class="flex items-center gap-1">
            <WifiIcon v-if="sseConnected" class="w-4 h-4" />
            <SignalSlashIcon v-else class="w-4 h-4" />
            {{ sseConnected ? 'Temps réel' : 'Hors ligne' }}
          </div>
        </div>
      </div>

      <div v-if="currentStats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-blue-100 text-sm">Total Transactions</p>
              <p class="text-2xl font-bold">{{ currentStats.totalTransactions || 0 }}</p>
            </div>
            <span v-if="sseStats" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
        </div>

        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-green-100 text-sm">Transactions Réussies</p>
              <p class="text-2xl font-bold">{{ currentStats.successfulTransactions || 0 }}</p>
            </div>
            <span v-if="sseStats" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
        </div>

        <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4 shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-amber-100 text-sm">Chiffre d'Affaires (€)</p>
              <p class="text-2xl font-bold">{{ (currentStats.totalAmountSuccess || 0).toFixed(2) }}</p>
            </div>
            <span v-if="sseStats" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
        </div>

        <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-purple-100 text-sm">Taux de Réussite</p>
              <p class="text-2xl font-bold">
                {{ currentStats.totalTransactions ?
                Math.round((currentStats.successfulTransactions / currentStats.totalTransactions) * 100) : 0 }}%
              </p>
            </div>
            <span v-if="sseStats" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
        </div>
      </div>

      <div v-if="merchant" class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div class="bg-gray-100 rounded p-4 border">
          <p class="text-sm text-gray-500">Nom de la société</p>
          <p class="font-semibold text-gray-800">{{ merchant.companyName }}</p>
        </div>
        <div class="bg-gray-100 rounded p-4 border">
          <p class="text-sm text-gray-500">Email de contact</p>
          <p class="font-semibold text-gray-800">{{ merchant.contactEmail }}</p>
        </div>
        <div class="bg-gray-100 rounded p-4 border">
          <p class="text-sm text-gray-500">Devise</p>
          <p class="font-semibold text-gray-800">{{ merchant.currency }}</p>
        </div>
        <div class="bg-gray-100 rounded p-4 border">
          <p class="text-sm text-gray-500">APP ID</p>
          <p class="font-mono text-xs break-all text-amber-700">{{ merchant.appId }}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <button @click="regenerateCredentials"
                class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded shadow flex items-center gap-2">
          <KeyIcon class="w-5 h-5" /> Régénérer APP_SECRET
        </button>
      </div>

      <div v-if="newAppSecret" class="mb-6 p-4 bg-amber-100 text-amber-800 rounded">
        <strong>Nouveau APP_SECRET :</strong>
        <code class="break-all text-sm">{{ newAppSecret }}</code>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-100 text-red-800 rounded">
        {{ error }}
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-12">
        <div class="bg-white p-4 border rounded shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-semibold text-gray-700">Montants des transactions</h2>
            <span v-if="sseStats" class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              TEMPS RÉEL
            </span>
          </div>
          <Bar v-if="barData" :data="barData" />
        </div>
        <div class="bg-white p-4 border rounded shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-semibold text-gray-700">Transactions par jour</h2>
            <span v-if="sseStats" class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              TEMPS RÉEL
            </span>
          </div>
          <Bar v-if="dailyData" :data="dailyData" />
        </div>
      </div>

      <div v-if="transactions.length" class="overflow-x-auto">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Transactions</h2>
        <table class="min-w-full bg-white border text-sm">
          <thead>
          <tr class="bg-amber-100 text-gray-800">
            <th class="text-left px-4 py-2 border">#ID</th>
            <th class="text-left px-4 py-2 border">Montant</th>
            <th class="text-left px-4 py-2 border">Devise</th>
            <th class="text-left px-4 py-2 border">Statut</th>
            <th class="text-left px-4 py-2 border">URL Paiement</th>
            <th class="text-left px-4 py-2 border">Opérations</th>
            <th class="text-left px-4 py-2 border">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 border">{{ tx.id }}</td>
            <td class="px-4 py-2 border">{{ tx.amount }}</td>
            <td class="px-4 py-2 border">{{ tx.currency }}</td>
            <td class="px-4 py-2 border">
                <span :class="{
                  'text-green-600': tx.status === 'success',
                  'text-red-600': tx.status === 'failed',
                  'text-yellow-600': tx.status === 'pending'
                }">
                  {{ tx.status }}
                </span>
            </td>
            <td class="px-4 py-2 border">
              <a :href="tx.paymentUrl" target="_blank" class="text-amber-600 underline">Lien</a>
            </td>
            <td class="px-4 py-2 border">
              <ul>
                <li v-for="op in tx.Operations" :key="op.id" class="flex items-center gap-2">
                  <ClockIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-gray-700">{{ op.type }} – {{ op.status }} – {{ op.amount }}</span>
                </li>
              </ul>
            </td>
            <td class="px-4 py-2 border">
              <button v-if="tx.status === 'success'" @click="openRefundModal(tx)"
                      class="text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded flex items-center gap-1">
                <ArrowUturnLeftIcon class="w-4 h-4" /> Rembourser
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RefundModal :visible="showRefundModal" :transactionId="selectedTransaction?.id" @close="showRefundModal = false"
                 @refunded="onRefundSuccess" />

  </div>
</template>
