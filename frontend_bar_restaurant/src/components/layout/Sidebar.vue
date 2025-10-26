<template>
  <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
    <!-- Sidebar - Brand -->
    <router-link class="sidebar-brand d-flex align-items-center justify-content-center" to="/">
      <div class="sidebar-brand-icon rotate-n-15">
        <i class="fas fa-utensils"></i>
      </div>
      <div class="sidebar-brand-text mx-3">Restaurante</div>
    </router-link>

    <hr class="sidebar-divider my-0" />

    <!-- Dashboard -->
    <li class="nav-item">
      <router-link class="nav-link" to="/">
        <i class="fas fa-fw fa-tachometer-alt"></i>
        <span>Dashboard</span>
      </router-link>
    </li>

    <hr class="sidebar-divider" />

    <div class="sidebar-heading">Gestión</div>

    <li class="nav-item">
      <router-link class="nav-link" to="/productos">
        <i class="fas fa-fw fa-box"></i>
        <span>Productos</span>
      </router-link>
    </li>

    <li class="nav-item">
      <router-link class="nav-link" to="/ventas">
        <i class="fas fa-fw fa-shopping-cart"></i>
        <span>Ventas</span>
      </router-link>
    </li>

    <li class="nav-item">
      <router-link class="nav-link" to="/compras">
        <i class="fas fa-fw fa-truck"></i>
        <span>Compras</span>
      </router-link>
    </li>

    <li class="nav-item">
      <router-link class="nav-link" to="/mesas">
        <i class="fas fa-fw fa-chair"></i>
        <span>Mesas</span>
      </router-link>
    </li>

    <li class="nav-item">
      <router-link class="nav-link" to="/usuarios">
        <i class="fas fa-fw fa-user"></i>
        <span>Usuarios</span>
      </router-link>
    </li>

    <hr class="sidebar-divider d-none d-md-block" />

    <div class="text-center d-none d-md-inline">
      <button class="rounded-circle border-0" id="sidebarToggle" @click="toggleSidebar"></button>
    </div>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const toggleSidebar = () => {
  document.body.classList.toggle('sidebar-toggled')
  const sidebar = document.querySelector('.sidebar')
  sidebar?.classList.toggle('toggled')
}

onMounted(() => {
  // Sidebar toggle animation script
  const sidebarToggle = document.getElementById('sidebarToggle')
  sidebarToggle?.addEventListener('click', toggleSidebar)
})
</script>
