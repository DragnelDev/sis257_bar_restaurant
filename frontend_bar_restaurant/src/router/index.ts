import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
        },
        {
          path: '/productos',
          name: 'productos',
          component: () => import('../views/ProductoView.vue'),
        },
        {
          path: '/ventas',
          name: 'ventas',
          component: () => import('../views/VentaView.vue'),
        },
        {
          path: '/compras',
          name: 'compras',
          component: () => import('../views/CompraView.vue'),
        },
        {
          path: '/mesas',
          name: 'mesas',
          component: () => import('../views/MesaView.vue'),
        },
        {
          path: '/usuarios',
          name: 'usuarios',
          component: () => import('../views/UsuarioView.vue'),
        },
      ],
    },
  ],
})

export default router
