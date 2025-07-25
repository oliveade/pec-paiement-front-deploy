
<script setup>
import { ref} from 'vue'
import { useRouter } from 'vue-router'
import SiteTestNavbarView from '@/components/SiteTestNavbarView.vue'

const router = useRouter()
const error = ref('')

// onMounted(() => {
//   const appId = sessionStorage.getItem('test_app_id')
//   const appSecret = sessionStorage.getItem('test_app_secret')

//   if (!appId || !appSecret) {
//     error.value = "Veuillez d’abord configurer vos credentials."
//     setTimeout(() => {
//       router.push('/configuration')
//     }, 1500)
//   }
// })
const products = ref([
  {
    id: 1,
    name: 'T-shirt Unisexe',
    price: 20,
    image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSYmwszJCXqkBzI1hXgcZhCn6PKP-8OyZqiLWcV7gqeZG6pQ_MJWa2MtoKOv2WaIGNvU_SBXmcd4G6TO2sfbc5BGhAUeBTgZmLkbYcyHSrFIozFCbC1BnZEp6E&usqp=CAc'
  },
  {
    id: 2,
    name: 'Casquette en Coton',
    price: 15,
    image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQmJ5sMuSNJ_B0OB4pG0D0m7VPg5IAOXZLDN45J10bCRj6Bn5zWv3UiwlpAhMNFBa_TreTG3a7TxOzG47pKa643fEiH98zMuRyK1sFlT9Nm5FhvBxWSrVjbVWFsebWN-20KqeGQSvu7&usqp=CAc'
  },
  {
    id: 3,
    name: 'Sac à dos Urbain',
    price: 35,
    image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ1fEXDicOuQEz2lyfPAWlbObINvzvnSyqqAgR_ZNQkCposLuyAXwlI-EGmjuCUIN8nkjmBjvs4A7JAsKyWWijcsQPOX-f-7E5tXYeTA__2oaWAaatcn51KcfMVS9xUHHA4fpxStQ&usqp=CAc'
  },
  {
    id: 4,
    name: 'Montre Classique',
    price: 70,
    image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTTkgEFfkz-fFZNoecsPk46y2DDh64a1TcR9L1a4avkTWN6TSm71ghjx0yWI1xGoL6H6kkW5lX4n-2jn0dnLz_JpMaOotrJUsPKbbReJm1QV_mPrC82ZLgd3zAPMxZje0_iCRJkKQ&usqp=CAc'
  },
  {
    id: 5,
    name: 'Lunettes de Soleil',
    price: 25,
    image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT8XVItYbMGxOM4DdVVB-KfG5RJy3x3pYyFsjKxQlCQ8EBUdxdLqBPwCSjVM9K-O-6f2T-ZQAW0pJD4CrULnXXrf0iI2Vq76kHr_IfzTLKZ_9RJOoW-Q6Nd_3Rlz1tynk-X_JzKskHcy6M&usqp=CAc'
  },
  {
    id: 6,
    name: 'Chaussures',
    price: 40,
    image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRazUteOcJGah3q4fRDLjbdJ9qYqDqXRHs7T7sM0CDrHhX_aAiLkGLQT8oUtX1TjqTcTuRVJZVHqpn-u0l1xf08ko-ugixdDktFwi86BXcA48TDUfJWdgPJigjHDaEKiGBp04vcW_k0iA&usqp=CAc'
  }
])

const addToCart = (product) => {
  const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
  currentCart.push(product)
  localStorage.setItem('cart', JSON.stringify(currentCart))
  window.dispatchEvent(new Event('cart-updated'))
  alert(`${product.name} ajouté au panier !`)
}
</script>

<template>
<SiteTestNavbarView/>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">Nos Produits</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white shadow rounded-lg p-4 flex flex-col"
      >
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-40 object-cover rounded mb-4"
        />
        <h2 class="text-lg font-semibold text-gray-800 mb-2">{{ product.name }}</h2>
        <p class="text-amber-600 font-bold mb-4">{{ product.price }} €</p>
        <button
          @click="addToCart(product)"
          class="mt-auto bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  </div>
</template>
