import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminLogin from '../views/AdminLoginView.vue'
import RegisterMerchantView from '@/views/RegisterMerchantView.vue'
import ActivationSuccessView from '@/views/ActivationSuccessView.vue'
import CreateTransaction from '../views/CreateTransaction.vue'
import TransactionDetailsView from '@/views/TransactionDetailsView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import CartView from '../views/SimulatePaymentView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import ProductView from '@/views/ProductView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import PayementProcessView from '@/views/PayementProcessView.vue'
import PaymentSuccessView from '@/views/PaymentSuccessView.vue'
import PaymentCancelView from '@/views/PaymentCancelView.vue'
const routes = [
  { path: '/', redirect: '/product' },
  { path: '/login', component: LoginView },
  { path: '/activation-success', component: ActivationSuccessView },
  { path: '/dashboard', component: DashboardView },
  { path: '/register', component: RegisterMerchantView },
  { path: '/admin/dashboard', component: AdminDashboardView },
  {
    path: '/dashboard/create-transaction',
    component: CreateTransaction,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/transactions/:id',
    component: TransactionDetailsView,
  },
  {
    path: '/cart',
    component: CartView,
  },
  {
    path: '/transactions',
    component: TransactionsView,
  },
  {
    path: '/product',
    component: ProductView,
  },
  {
    path: '/checkout',
    component: CheckoutView,
  },
  {
    path: '/payment-processing',
    component: PayementProcessView,
  },
  { path: '/admin/login', component: AdminLogin },
  { path: '/payment-success', component: PaymentSuccessView },
  { path: '/payment-cancel', component: PaymentCancelView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
