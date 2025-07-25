<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import { Pie, Bar, Line } from 'vue-chartjs'
import AdminTransactionView from '@/components/AdminTransactionView.vue'
import AdminMerchantsTableView from '@/components/AdminMerchantsTableView.vue'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

const stats = ref(null)
const error = ref('')
const token = localStorage.getItem('admin_token')
const apiUrl = import.meta.env.VITE_API_URL

const realtimeMetrics = ref(null)
const sseConnected = ref(false)
const eventSource = ref(null)
const lastUpdate = ref(null)

const advancedStats = ref(null)

const connectToSSE = () => {
  try {
    eventSource.value = new EventSource(`${apiUrl}/api/dashboard-stream`)

    eventSource.value.onopen = () => {
      sseConnected.value = true
      console.log('Connexion SSE établie')
    }

    eventSource.value.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'initial_metrics' || data.type === 'metrics_update') {
        realtimeMetrics.value = data.data
        lastUpdate.value = new Date().toLocaleTimeString()
        console.log('Métriques mises à jour:', data.data)
      }

      if (data.type === 'heartbeat') {
        console.log('Heartbeat SSE')
      }
    }

    eventSource.value.onerror = (error) => {
      console.error('Erreur SSE:', error)
      sseConnected.value = false

      setTimeout(() => {
        if (eventSource.value?.readyState === EventSource.CLOSED) {
          console.log('Tentative de reconnexion SSE...')
          connectToSSE()
        }
      }, 5000)
    }

  } catch (error) {
    console.error('Impossible de se connecter au SSE:', error)
    error.value = 'Connexion temps réel indisponible'
  }
}

const disconnectSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
    sseConnected.value = false
    console.log('Connexion SSE fermée')
  }
}

const fetchStats = async () => {
  try {
    const response = await axios.get(`${apiUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = response.data
  } catch (err) {
    error.value = 'Erreur de chargement des statistiques'
  }
}

const fetchAdvancedStats = async () => {
  try {
    const response = await axios.get(`${apiUrl}/admin/stats/graph-data`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    advancedStats.value = response.data
  } catch (err) {
    console.error('Erreur récupération des stats graphiques', err)
  }
}

const displayStats = computed(() => {
  if (realtimeMetrics.value) {
    return {
      merchants: stats.value?.merchants || 0,
      transactions: realtimeMetrics.value.totalTransactions,
      totalAmount: realtimeMetrics.value.totalRevenue,
      successCount: realtimeMetrics.value.successfulTransactions,
      successRate: realtimeMetrics.value.conversionRate
    }
  }
  return stats.value
})

const pieData = computed(() => {
  if (!realtimeMetrics.value) {
    if (!stats.value) return null
    return {
      labels: ['Succès', 'Échec', 'En attente'],
      datasets: [{
        data: [
          stats.value.successCount,
          stats.value.transactions - stats.value.successCount,
          stats.value.transactions * 0.1
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B']
      }]
    }
  }

  return {
    labels: ['Succès', 'Échec', 'En attente', 'Annulées'],
    datasets: [{
      data: [
        realtimeMetrics.value.successfulTransactions,
        realtimeMetrics.value.failedTransactions,
        realtimeMetrics.value.pendingTransactions,
        realtimeMetrics.value.cancelledTransactions
      ],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6B7280']
    }]
  }
})

const barData = computed(() => {
  if (!advancedStats.value) return { labels: [], datasets: [] }
  return {
    labels: ['Succès', 'Échecs'],
    datasets: [
      {
        label: 'Montant total (€)',
        data: [
          advancedStats.value.totalAmountSuccess,
          advancedStats.value.totalAmountFailed
        ],
        backgroundColor: ['#10B981', '#EF4444']
      }
    ]
  }
})

const dailyData = computed(() => {
  if (!advancedStats.value || !advancedStats.value.transactionsPerDay) return { labels: [], datasets: [] }
  return {
    labels: advancedStats.value.transactionsPerDay.map(t => t.date),
    datasets: [
      {
        label: 'Transactions / jour',
        data: advancedStats.value.transactionsPerDay.map(t => t.count),
        backgroundColor: '#3B82F6'
      }
    ]
  }
})

const dailyAmountData = computed(() => {
  if (!advancedStats.value || !advancedStats.value.transactionsPerDay) return { labels: [], datasets: [] }
  return {
    labels: advancedStats.value.transactionsPerDay.map(t => t.date),
    datasets: [
      {
        label: 'Montant (€) / jour',
        data: advancedStats.value.transactionsPerDay.map(t => t.amount),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

onMounted(() => {
  fetchStats()
  fetchAdvancedStats()
  connectToSSE()
})

onUnmounted(() => {
  disconnectSSE()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-10">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-amber-600">Tableau de bord Administrateur</h1>

      <div class="flex items-center space-x-2">
        <div
          :class="[
            'w-3 h-3 rounded-full',
            sseConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          ]"
        ></div>
        <span class="text-sm font-medium" :class="sseConnected ? 'text-green-600' : 'text-red-600'">
          {{ sseConnected ? 'Temps réel' : 'Hors ligne' }}
        </span>
        <span v-if="lastUpdate" class="text-xs text-gray-500">
          Dernière mise à jour: {{ lastUpdate }}
        </span>
      </div>
    </div>

    <div v-if="error" class="bg-red-100 text-red-800 p-4 rounded mb-6">{{ error }}</div>

    <div v-if="displayStats" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white shadow p-6 rounded border relative">
        <h2 class="text-gray-500 text-sm mb-1">Marchands</h2>
        <p class="text-3xl font-bold text-gray-800">{{ displayStats.merchants }}</p>
      </div>

      <div class="bg-white shadow p-6 rounded border relative">
        <div v-if="sseConnected" class="absolute top-2 right-2">
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
        <h2 class="text-gray-500 text-sm mb-1">Transactions</h2>
        <p class="text-3xl font-bold text-gray-800">{{ displayStats.transactions }}</p>
      </div>

      <div class="bg-white shadow p-6 rounded border relative">
        <div v-if="sseConnected" class="absolute top-2 right-2">
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
        <h2 class="text-gray-500 text-sm mb-1">Montant total (€)</h2>
        <p class="text-3xl font-bold text-gray-800">{{ displayStats.totalAmount.toFixed(2) }}</p>
      </div>

      <div class="bg-white shadow p-6 rounded border relative">
        <div v-if="sseConnected" class="absolute top-2 right-2">
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
        <h2 class="text-gray-500 text-sm mb-1">Succès</h2>
        <p class="text-3xl font-bold text-green-600">{{ displayStats.successCount }}</p>
      </div>

      <div class="bg-white shadow p-6 rounded border relative">
        <div v-if="sseConnected" class="absolute top-2 right-2">
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
        <h2 class="text-gray-500 text-sm mb-1">Taux de succès (%)</h2>
        <p class="text-3xl font-bold text-amber-600">{{ displayStats.successRate }}%</p>
      </div>

      <div v-if="realtimeMetrics" class="bg-white shadow p-6 rounded border relative">
        <div class="absolute top-2 right-2">
          <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            NOUVEAU
          </span>
        </div>
        <h2 class="text-gray-500 text-sm mb-1">Montant moyen (€)</h2>
        <p class="text-3xl font-bold text-blue-600">{{ realtimeMetrics.averageAmount }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
      <div class="bg-white p-6 rounded shadow border relative">
        <div v-if="sseConnected && realtimeMetrics" class="absolute top-4 right-4">
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            TEMPS RÉEL
          </span>
        </div>
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Répartition des statuts</h2>
        <Pie v-if="pieData" :data="pieData" />
      </div>

      <div class="bg-white p-6 rounded shadow border">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Montants des transactions</h2>
        <Bar v-if="barData" :data="barData" />
      </div>

      <div class="bg-white p-6 rounded shadow border">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Transactions par jour</h2>
        <Bar v-if="dailyData" :data="dailyData" />
      </div>

      <div class="bg-white p-6 rounded shadow border">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Montant total par jour</h2>
        <Line v-if="dailyAmountData" :data="dailyAmountData" />
      </div>
    </div>

    <AdminTransactionView />
    <AdminMerchantsTableView />
  </div>
</template>
