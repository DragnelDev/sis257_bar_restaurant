<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const isActive = (routeName: string) => {
  return route.name === routeName
}
</script>

<template>
<nav class="navbar navbar-expand-lg px-4 px-lg-5 py-3 py-lg-0 header-top">

    <RouterLink to="/" class="navbar-brand p-0">
      <h1 class="brand-logo m-0">
        <i class="fa fa-utensils me-2" aria-hidden="true"></i>
        <i class="fa fa-microphone me-2" aria-hidden="true"></i>
        <i class="fa fa-cocktail me-3" aria-hidden="true"></i>
        RESET
      </h1>
    </RouterLink>

    <button class="navbar-toggler" type="button" @click="toggleMenu" :aria-expanded="isMenuOpen">
      <span class="fa fa-bars"></span>
    </button>

    <div class="collapse navbar-collapse" :class="{ show: isMenuOpen }" id="navbarCollapse">
      <div class="navbar-nav ms-auto py-0 pe-4">
        <RouterLink to="/" class="nav-item nav-link" :class="{ active: isActive('home') }">
          Inicio
        </RouterLink>

        <RouterLink to="/about" class="nav-item nav-link" :class="{ active: isActive('about') }">
          Acerca de
        </RouterLink>

        <RouterLink
          to="/service"
          class="nav-item nav-link"
          :class="{ active: isActive('service') }"
        >
          Servicio
        </RouterLink>

        <RouterLink to="/menu" class="nav-item nav-link" :class="{ active: isActive('menu') }">
          Menu
        </RouterLink>

        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown"> Paginas </a>
          <div class="dropdown-menu m-0">
            <RouterLink to="/booking" class="dropdown-item">Reseva</RouterLink>
            <RouterLink to="/team" class="dropdown-item">Nuestro equipo</RouterLink>
            <RouterLink to="/testimonial" class="dropdown-item">Testimonio</RouterLink>
          </div>
        </div>

        <RouterLink
          to="/contact"
          class="nav-item nav-link"
          :class="{ active: isActive('contact') }"
        >
          Contacto
        </RouterLink>
      </div>

      <RouterLink to="/booking" class="btn btn-primary py-2 px-4 me-2">
        <i class="fa fa-calendar-check me-2"></i>Recerva una mesa
      </RouterLink>
      <RouterLink
        to="/login"
        class="btn btn-outline-light py-2 px-4"
        style="border-color: var(--primary); color: var(--primary)"
      >
        <i class="fa fa-lock me-2"></i>Inicio de sesión
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.header-top {
  background: linear-gradient(90deg, #2f4250 0%, #22303a 100%);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.brand-logo {
  font-family: 'Pacifico', cursive;
  color: #ffffff !important;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* small logo icon is inline with text (no icon bubbles) */
.brand-logo i { color: #ffffff; font-size: 20px; }
.brand-logo .fa-microphone,
.brand-logo .fa-cocktail { font-size: 18px; opacity: 0.95; }

/* Nav links in header should not be blue; use soft white and pink accent on hover/active */
.header-top .nav-link {
  color: rgba(255,255,255,0.9);
}

.header-top .nav-link:hover,
.header-top .nav-link.active {
  color: #ff4081 !important;
}

.header-top .btn-outline-light {
  border-color: rgba(255,255,255,0.12) !important;
  color: rgba(255,255,255,0.95) !important;
}

.header-top .btn-primary {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%);
  border-color: transparent;
}
</style>
