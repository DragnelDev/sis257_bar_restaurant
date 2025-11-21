<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import Spinner from './components/layout/Spinner.vue'

const route = useRoute()
const { checkAuth } = useAuth()
const loading = ref(true)

const isAdminRoute = () => {
  return route.path.startsWith('/admin')
}

const isAuthRoute = () => {
  return route.path.startsWith('/login')
}

onMounted(() => {
  checkAuth()
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<template>
  <div class="container-xxl bg-white p-0">
    <Spinner v-if="loading" />

    <!-- Mostrar Navbar y Footer solo si NO es ruta admin o login -->
    <template v-if="!isAdminRoute() && !isAuthRoute()">
      <Navbar />
      <RouterView />
      <Footer />
      <a href="#" class="btn btn-lg btn-primary btn-lg-square back-to-top">
        <i class="bi bi-arrow-up"></i>
      </a>
    </template>

    <!-- Para rutas admin y login, solo mostrar el contenido -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style>
/* Font Awesome, Bootstrap Icons y Animate ya se importan globalmente en `main.ts` */

/* Agrega aquí los estilos personalizados o importa el CSS de la plantilla */
:root {
  --primary: #fea116;
  --dark: #0f172b;
}

.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
}

.text-primary {
  color: var(--primary) !important;
}

.bg-dark {
  background-color: var(--dark) !important;
}

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 99;
}
</style>
