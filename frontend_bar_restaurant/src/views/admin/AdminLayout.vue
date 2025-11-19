<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, logout } = useAuth()
const sidebarCollapsed = ref(false)
const showLogoutModal = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const openLogoutModal = () => {
  showLogoutModal.value = true
}

const closeLogoutModal = () => {
  showLogoutModal.value = false
}

const confirmLogout = () => {
  logout()
  showLogoutModal.value = false
  router.push('/login')
}

const menuItems = [
  { icon: 'fa-tachometer-alt', text: 'Panel', route: 'admin-dashboard' },
  //{ icon: 'fa-calendar-check', text: 'Reservas', route: 'admin-bookings' },
  { icon: 'fa-table', text: 'Mesas', route: 'admin-mesas' },
  { icon: 'fa-user-plus', text: 'Registrar', route: 'admin-registrar' },
  { icon: 'fa-utensils', text: 'Gestión de Menus', route: 'admin-menu' },
  { icon: 'fa-shopping-cart', text: 'Ordenes', route: 'admin-orders' },
  { icon: 'fa-users', text: 'Personal', route: 'admin-staff' },
  { icon: 'fa-receipt', text: 'Recetas', route: 'admin-recipes' },
  { icon: 'fa-box-open', text: 'Proveedores', route: 'admin-suppliers' },
  { icon: 'fa-boxes-stacked', text: 'Inventarios', route: 'admin-products' },
  { icon: 'fa-user-friends', text: 'Usuarios', route: 'admin-users' },
  { icon: 'fa-shopping-bag', text: 'Compras', route: 'admin-purchases' },
  { icon: 'fa-cash-register', text: 'Ventas', route: 'admin-sales' },
]
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 v-if="!sidebarCollapsed"><i class="fa fa-utensils me-2"></i>Restoran</h3>
        <i v-else class="fa fa-utensils fa-2x text-primary"></i>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.route"
          :to="{ name: item.route }"
          class="nav-item"
          active-class="active"
        >
          <i :class="`fa ${item.icon}`"></i>
          <span v-if="!sidebarCollapsed">{{ item.text }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="toggleSidebar" class="btn-toggle">
          <i :class="sidebarCollapsed ? 'fa fa-angle-right' : 'fa fa-angle-left'"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navbar -->
      <header class="top-navbar">
        <div class="navbar-left">
          <button @click="toggleSidebar" class="btn-menu">
            <i class="fa fa-bars"></i>
          </button>
        </div>

        <div class="navbar-right">
          <!-- Notifications -->
          <div class="nav-item dropdown">
            <button class="btn-icon" data-bs-toggle="dropdown">
              <i class="fa fa-bell"></i>
              <span class="badge">3</span>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <h6 class="dropdown-header">Notificaciones</h6>
              <a class="dropdown-item" href="#">New booking received</a>
              <a class="dropdown-item" href="#">Menu item low stock</a>
              <a class="dropdown-item" href="#">New staff member added</a>
            </div>
          </div>

          <!-- User Menu -->
          <div class="nav-item dropdown">
            <button class="btn-user" data-bs-toggle="dropdown">
              <img :src="user?.avatar || '/img/team-1.jpg'" alt="User" class="user-avatar" />
              <span class="user-name">{{ user?.name }}</span>
              <i class="fa fa-chevron-down ms-2"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <div class="dropdown-header">
                <strong>{{ user?.name }}</strong>
                <small class="d-block text-muted">{{ user?.email }}</small>
              </div>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#"> <i class="fa fa-user me-2"></i>Perfil </a>
              <a class="dropdown-item" href="#"> <i class="fa fa-cog me-2"></i>Configuracion </a>
              <div class="dropdown-divider"></div>
              <RouterLink to="/" class="dropdown-item">
                <i class="fa fa-home me-2"></i>View Website
              </RouterLink>
              <button @click="openLogoutModal" class="dropdown-item text-danger">
                <i class="fa fa-sign-out-alt me-2"></i>Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de Logout -->
        <div v-if="showLogoutModal" class="modal fade show" tabindex="-1" style="display: block">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Confirmar Cierre de Sesión</h5>
                <button type="button" class="btn-close" @click="closeLogoutModal"></button>
              </div>
              <div class="modal-body">¿Estás seguro que deseas cerrar sesión?</div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeLogoutModal">
                  Cancelar
                </button>
                <button type="button" class="btn btn-danger" @click="confirmLogout">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showLogoutModal" class="modal-backdrop fade show"></div>
      </header>

      <!-- Page Content -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, var(--dark) 0%, #1a2332 100%);
  color: white;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-header h3 {
  margin: 0;
  font-family: 'Pacifico', cursive;
  color: var(--primary);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 15px 0;
}

.nav-item i {
  font-size: 18px;
  min-width: 30px;
}

.nav-item span {
  margin-left: 10px;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(254, 161, 22, 0.1);
  color: var(--primary);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-toggle {
  width: 100%;
  padding: 10px;
  background: rgba(254, 161, 22, 0.1);
  border: none;
  color: var(--primary);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-toggle:hover {
  background: var(--primary);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 70px;
}

/* Top Navbar */
.top-navbar {
  height: 70px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 999;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-menu,
.btn-icon {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark);
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  transition: all 0.3s;
  position: relative;
}

.btn-menu:hover,
.btn-icon:hover {
  background: rgba(254, 161, 22, 0.1);
  color: var(--primary);
}

.btn-icon .badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #dc3545;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
}

.btn-user {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 25px;
  transition: all 0.3s;
}

.btn-user:hover {
  background: rgba(254, 161, 22, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid var(--primary);
}

.user-name {
  font-weight: 600;
  color: var(--dark);
}

/* Content */
.content {
  flex: 1;
  padding: 30px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .user-name {
    display: none;
  }
}
</style>
