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
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4 px-lg-5 py-3 py-lg-0">
    <RouterLink to="/" class="navbar-brand p-0">
      <h1 class="text-primary m-0"><i class="fa fa-utensils me-3"></i>Restoran</h1>
    </RouterLink>

    <button class="navbar-toggler" type="button" @click="toggleMenu" :aria-expanded="isMenuOpen">
      <span class="fa fa-bars"></span>
    </button>

    <div class="collapse navbar-collapse" :class="{ show: isMenuOpen }" id="navbarCollapse">
      <div class="navbar-nav ms-auto py-0 pe-4">
        <RouterLink to="/" class="nav-item nav-link" :class="{ active: isActive('home') }">
          Home
        </RouterLink>

        <RouterLink to="/about" class="nav-item nav-link" :class="{ active: isActive('about') }">
          About
        </RouterLink>

        <RouterLink
          to="/service"
          class="nav-item nav-link"
          :class="{ active: isActive('service') }"
        >
          Service
        </RouterLink>

        <RouterLink to="/menu" class="nav-item nav-link" :class="{ active: isActive('menu') }">
          Menu
        </RouterLink>

        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown"> Pages </a>
          <div class="dropdown-menu m-0">
            <RouterLink to="/booking" class="dropdown-item">Booking</RouterLink>
            <RouterLink to="/team" class="dropdown-item">Our Team</RouterLink>
            <RouterLink to="/testimonial" class="dropdown-item">Testimonial</RouterLink>
          </div>
        </div>

        <RouterLink
          to="/contact"
          class="nav-item nav-link"
          :class="{ active: isActive('contact') }"
        >
          Contact
        </RouterLink>
      </div>

      <RouterLink to="/booking" class="btn btn-primary py-2 px-4 me-2">
        <i class="fa fa-calendar-check me-2"></i>Book A Table
      </RouterLink>
      <RouterLink
        to="/login"
        class="btn btn-outline-light py-2 px-4"
        style="border-color: var(--primary); color: var(--primary)"
      >
        <i class="fa fa-lock me-2"></i>Admin Login
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar-brand h1 {
  font-family: 'Pacifico', cursive;
}

.nav-link.active {
  color: var(--primary) !important;
}
</style>
