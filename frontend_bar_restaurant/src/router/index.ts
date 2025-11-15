// src/router/index.ts

import { getTokenFromLocalStorage } from '@/helpers'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('../views/ServiceView.vue'),
  },
  {
    path: '/menu',
    name: 'menu',
    component: () => import('../views/MenuView.vue'),
  },
  {
    path: '/booking',
    name: 'booking',
    component: () => import('../views/BookingView.vue'),
  },
  {
    path: '/team',
    name: 'team',
    component: () => import('../views/TeamView.vue'),
  },
  {
    path: '/testimonial',
    name: 'testimonial',
    component: () => import('../views/TestimonialView.vue'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/ContactView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/DashboardView.vue'),
      },
      {
        path: 'bookings',
        name: 'admin-bookings',
        component: () => import('../views/admin/BookingsView.vue'),
      },
      {
        path: 'menu',
        name: 'admin-menu',
        component: () => import('../views/admin/MenuManagementView.vue'),
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('../views/admin/OrdersView.vue'),
      },
      {
        path: 'staff',
        name: 'admin-staff',
        component: () => import('../views/admin/StaffView.vue'),
      },
      {
        path: 'recipes',
        name: 'admin-recipes',
        component: () => import('../views/admin/RecipesView.vue'),
      },
      {
        path: 'suppliers',
        name: 'admin-suppliers',
        component: () => import('../views/admin/SuppliersView.vue'),
      },
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('../views/admin/ProductsView.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/admin/UsersView.vue'),
      },
      {
        path: 'purchases',
        name: 'admin-purchases',
        component: () => import('../views/admin/PurchasesView.vue'),
      },
      {
        path: 'sales',
        name: 'admin-sales',
        component: () => import('../views/admin/SalesView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
// Navigation Guard: usar meta.requiresAuth / meta.requiresGuest
router.beforeEach((to) => {
  const token = getTokenFromLocalStorage()

  // Ruta protegida -> requiere token
  if (to.matched.some((record) => record.meta?.requiresAuth) && !token) {
    // guardar la URL destino en localStorage para redirigir después del login
    try {
      localStorage.setItem('returnUrl', to.fullPath)
    } catch {
      /* ignore localStorage errors (private mode, etc.) */
    }
    return { name: 'login' }
  }

  // Ruta para invitados -> si ya está autenticado, redirigir al panel
  if (to.matched.some((record) => record.meta?.requiresGuest) && token) {
    return { name: 'admin-dashboard' }
  }

  // Permitir navegación por defecto
  return true
})

export default router
