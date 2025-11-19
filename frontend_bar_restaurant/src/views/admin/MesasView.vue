<script setup lang="ts">
import { ref, computed } from 'vue'

// Adaptamos la interfaz a tu tabla 'mesas'
interface Mesa {
  id: number
  numeroMesa: number // El número visible al público
  capacidad: number // Cuántas personas caben
  estado: 'LIBRE' | 'OCUPADA' | 'MANTENIMIENTO' // Estado operativo
  idVentaActiva: number | null // ID de la venta PENDIENTE asociada a esta mesa
  tiempoOcupada: string // Tiempo que lleva ocupada (simulación)
}

// Datos de Ejemplo (Simulando la lectura de la base de datos)
const mesas = ref<Mesa[]>([
  {
    id: 1,
    numeroMesa: 1,
    capacidad: 4,
    estado: 'OCUPADA',
    idVentaActiva: 101,
    tiempoOcupada: '0:45 min',
  },
  { id: 2, numeroMesa: 2, capacidad: 2, estado: 'LIBRE', idVentaActiva: null, tiempoOcupada: '' },
  {
    id: 3,
    numeroMesa: 3,
    capacidad: 6,
    estado: 'OCUPADA',
    idVentaActiva: 102,
    tiempoOcupada: '1:10 min',
  },
  { id: 4, numeroMesa: 4, capacidad: 4, estado: 'LIBRE', idVentaActiva: null, tiempoOcupada: '' },
  {
    id: 5,
    numeroMesa: 5,
    capacidad: 8,
    estado: 'MANTENIMIENTO',
    idVentaActiva: null,
    tiempoOcupada: '',
  },
  {
    id: 6,
    numeroMesa: 6,
    capacidad: 4,
    estado: 'OCUPADA',
    idVentaActiva: 103,
    tiempoOcupada: '0:20 min',
  },
  { id: 7, numeroMesa: 7, capacidad: 2, estado: 'LIBRE', idVentaActiva: null, tiempoOcupada: '' },
])

const selectedMesa = ref<Mesa | null>(null)
const selectedFilter = ref('all')

// Propiedad computada para filtrar las mesas
const filteredMesas = computed(() => {
  if (selectedFilter.value === 'all') {
    return mesas.value
  }
  return mesas.value.filter((mesa) => mesa.estado === selectedFilter.value)
})

// Mapeo de estado a colores
const getStatusColor = (estado: Mesa['estado']): string => {
  switch (estado) {
    case 'OCUPADA':
      return 'danger'
    case 'LIBRE':
      return 'success'
    case 'MANTENIMIENTO':
      return 'warning'
    default:
      return 'secondary'
  }
}

// Lógica de acciones de mesa
const handleMesaAction = (mesa: Mesa) => {
  selectedMesa.value = mesa

  if (mesa.estado === 'LIBRE') {
    // 1. Iniciar Venta (Simulación)
    console.log(`Iniciando nueva orden para Mesa ${mesa.numeroMesa}`)
    // Aquí se navegaría a la vista POS/Menu con mesa.id preseleccionada
    alert(`Mesa ${mesa.numeroMesa} asignada. Navegando a Toma de Pedido...`)
  } else if (mesa.estado === 'OCUPADA') {
    // 2. Abrir Orden Existente
    console.log(`Abriendo Venta ID ${mesa.idVentaActiva} para Mesa ${mesa.numeroMesa}`)
    // Aquí se navegaría a la vista POS/Menu para editar la venta activa
    alert(`Abriendo orden activa ${mesa.idVentaActiva} de Mesa ${mesa.numeroMesa}.`)
  }

  // En una aplicación real, se usaría un router.push('/pos/' + mesa.id)
}

// Cálculo de estadísticas rápidas
const stats = computed(() => ({
  total: mesas.value.length,
  libres: mesas.value.filter((m) => m.estado === 'LIBRE').length,
  ocupadas: mesas.value.filter((m) => m.estado === 'OCUPADA').length,
  mantenimiento: mesas.value.filter((m) => m.estado === 'MANTENIMIENTO').length,
}))
</script>

<template>
  <div class="table-management">
    <div class="page-header mb-4">
      <h2 class="mb-1">🛋️ Gestión de Mesas</h2>
      <p class="text-muted">Estado operativo y asignación de mesas.</p>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card border-secondary">
          <div class="stat-icon bg-secondary"><i class="fa fa-chair"></i></div>
          <div class="stat-content">
            <h6>Total de Mesas</h6>
            <h3>{{ stats.total }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-success">
          <div class="stat-icon bg-success"><i class="fa fa-smile"></i></div>
          <div class="stat-content">
            <h6>Mesas Libres</h6>
            <h3>{{ stats.libres }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-danger">
          <div class="stat-icon bg-danger"><i class="fa fa-users"></i></div>
          <div class="stat-content">
            <h6>Mesas Ocupadas</h6>
            <h3>{{ stats.ocupadas }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-warning">
          <div class="stat-icon bg-warning"><i class="fa fa-tools"></i></div>
          <div class="stat-content">
            <h6>En Mantenimiento</h6>
            <h3>{{ stats.mantenimiento }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <label class="form-label mb-0">Filtrar por Estado:</label>
            <select class="form-select" v-model="selectedFilter">
              <option value="all">Ver Todas</option>
              <option value="LIBRE">Libres</option>
              <option value="OCUPADA">Ocupadas</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          </div>
          <div class="col-md-8 text-end">
            <button class="btn btn-primary me-2">
              <i class="fa fa-sync-alt me-1"></i> Sincronizar
            </button>
            <button class="btn btn-outline-secondary">
              <i class="fa fa-map-marked-alt me-1"></i> Ver Layout
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mesa-grid">
      <div v-for="mesa in filteredMesas" :key="mesa.id" class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div
          class="mesa-card text-center"
          :class="`border-${getStatusColor(mesa.estado)} bg-light-${getStatusColor(mesa.estado)}`"
          @click="handleMesaAction(mesa)"
          :style="{ cursor: mesa.estado !== 'MANTENIMIENTO' ? 'pointer' : 'default' }"
        >
          <div class="card-header-mesa" :class="`bg-${getStatusColor(mesa.estado)}`">
            MESA #{{ mesa.numeroMesa }}
          </div>
          <div class="card-body-mesa p-3">
            <i
              class="fa fa-4x mb-2"
              :class="{
                'fa-chair text-success': mesa.estado === 'LIBRE',
                'fa-users text-danger': mesa.estado === 'OCUPADA',
                'fa-tools text-warning': mesa.estado === 'MANTENIMIENTO',
              }"
            ></i>

            <h5 class="fw-bold mb-1">
              {{ mesa.estado }}
            </h5>
            <p class="small text-muted mb-1">Capacidad: {{ mesa.capacidad }} personas</p>

            <div v-if="mesa.estado === 'OCUPADA'">
              <p class="fw-bold text-danger mb-1">Orden #{{ mesa.idVentaActiva }}</p>
              <p class="small text-danger">Ocupada: {{ mesa.tiempoOcupada }}</p>
            </div>

            <button v-if="mesa.estado === 'LIBRE'" class="btn btn-sm btn-success mt-2">
              <i class="fa fa-plus-circle me-1"></i>Iniciar Orden
            </button>
            <button v-if="mesa.estado === 'OCUPADA'" class="btn btn-sm btn-danger mt-2">
              <i class="fa fa-pen-square me-1"></i>Ver/Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Estilos para las tarjetas de estadísticas */
.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  border-left: 4px solid;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}
.stat-content h6 {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}
.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}
.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Estilos específicos de la tarjeta de Mesa */
.mesa-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 2px solid;
  transition: transform 0.2s;
}

.mesa-card:hover {
  transform: scale(1.03);
}

.mesa-card.border-success:hover {
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3); /* Verde */
}
.mesa-card.border-danger:hover {
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3); /* Rojo */
}

.card-header-mesa {
  padding: 10px;
  color: white;
  font-weight: bold;
  font-size: 1.1em;
}

/* Clases de fondo ligero para Bootstrap (simuladas) */
.bg-light-success {
  background-color: #d4edda !important;
}
.bg-light-danger {
  background-color: #f8d7da !important;
}
.bg-light-warning {
  background-color: #fff3cd !important;
}

/* Hacer el cursor predeterminado para mantenimiento */
.mesa-card[style*='default'] {
  cursor: default !important;
}
</style>
