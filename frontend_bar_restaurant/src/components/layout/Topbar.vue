<script setup lang="ts"></script>
<template>
  <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
    <!-- Sidebar Toggle (Topbar) -->
    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
      <i class="fa fa-bars"></i>
    </button>

    <!-- Search -->
    <form
      class="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"
    >
      <div class="input-group">
        <input type="text" class="form-control bg-light border-0 small" placeholder="Buscar..." />
        <div class="input-group-append">
          <button class="btn btn-primary" type="button">
            <i class="fas fa-search fa-sm"></i>
          </button>
        </div>
      </div>
    </form>

    <!-- User Dropdown -->
    <ul class="navbar-nav ml-auto">
      <li class="nav-item dropdown no-arrow">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" data-bs-toggle="dropdown">
          <span class="mr-2 d-none d-lg-inline text-gray-600 small">Administrador</span>
          <img class="img-profile rounded-circle" src="/src/assets/img/undraw_profile.svg" />
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow animated--grow-in">
          <li>
            <a class="dropdown-item" href="#"
              ><i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>Perfil</a
            >
          </li>
          <li>
            <a class="dropdown-item" href="#"
              ><i class="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>Configuración</a
            >
          </li>
          <li>
            <a class="dropdown-item" href="#"
              ><i class="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>Actividad</a
            >
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item" href="#"
              ><i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>Salir</a
            >
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<style scoped></style>
