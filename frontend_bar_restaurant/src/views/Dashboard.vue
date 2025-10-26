<template>
  <div class="d-sm-flex align-items-center justify-content-between mb-4">
    <h1 class="h3 mb-0 text-gray-800">Dashboard</h1>
    <button class="btn btn-sm btn-primary shadow-sm">
      <i class="fas fa-download fa-sm text-white-50"></i> Generar Reporte
    </button>
  </div>

  <div class="row">
    <div class="col-xl-3 col-md-6 mb-4" v-for="(card, i) in cards" :key="i">
      <div :class="`card border-left-${card.color} shadow h-100 py-2`">
        <div class="card-body">
          <div class="row no-gutters align-items-center">
            <div class="col mr-2">
              <div class="text-xs font-weight-bold text-uppercase mb-1">{{ card.title }}</div>
              <div class="h5 mb-0 font-weight-bold text-gray-800">{{ card.value }}</div>
            </div>
            <div class="col-auto">
              <i :class="`fas ${card.icon} fa-2x text-gray-300`"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cards = [
  { title: 'Ventas Mensuales', value: '$40,000', color: 'primary', icon: 'fa-calendar' },
  { title: 'Ventas Anuales', value: '$215,000', color: 'success', icon: 'fa-dollar-sign' },
  { title: 'Tareas', value: '50%', color: 'info', icon: 'fa-clipboard-list' },
  { title: 'Pedidos Pendientes', value: '18', color: 'warning', icon: 'fa-comments' },
]
</script>
