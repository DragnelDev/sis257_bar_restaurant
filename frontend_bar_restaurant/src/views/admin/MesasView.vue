<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../../plugins/axios'

const ENDPOINT = 'mesas'
interface Mesa {
  id: number
  numeroMesa: number
  capacidad: number
  estado: 'LIBRE' | 'OCUPADA' | 'MANTENIMIENTO'
  idVentaActiva: number | null
  tiempoOcupada: string
}

// Datos de mesas (cargadas desde API)
const mesas = ref<Mesa[]>([])
const loadingMesas = ref(false)

// Estado del modal para agregar mesa
const showModalAgregar = ref(false)
const formNuevaMesa = ref({ numeroMesa: '', capacidad: '', estado: 'LIBRE' })
const loadingGuardar = ref(false)

// Cargar mesas desde la API
const loadMesas = async () => {
  loadingMesas.value = true
  try {
    const res = await axios.get(`/${ENDPOINT}`)
    let data = res?.data
    if (data && (data as any).data) data = (data as any).data
    if (data && (data as any).items) data = (data as any).items

    if (!Array.isArray(data)) {
      console.warn('Respuesta de /mesas inesperada:', res)
      mesas.value = []
      return
    }

    mesas.value = (data as any[]).map((m: any) => ({
      id: m.id,
      numeroMesa: m.numeroMesa || m.numero || 0,
      capacidad: m.capacidad,
      estado: m.estado || 'LIBRE',
      idVentaActiva: m.idVentaActiva || null,
      tiempoOcupada: m.tiempoOcupada || '',
    }))
    console.debug(`Mesas cargadas: ${mesas.value.length}`)
  } catch (err) {
    console.warn('No se pudo cargar mesas desde /mesas:', err)
    // Fallback en desarrollo
    if (import.meta.env.DEV) {
      mesas.value = [
        {
          id: 1,
          numeroMesa: 1,
          capacidad: 4,
          estado: 'LIBRE',
          idVentaActiva: null,
          tiempoOcupada: '',
        },
        {
          id: 2,
          numeroMesa: 2,
          capacidad: 2,
          estado: 'LIBRE',
          idVentaActiva: null,
          tiempoOcupada: '',
        },
      ]
    } else {
      mesas.value = []
    }
  } finally {
    loadingMesas.value = false
  }
}

// Agregar nueva mesa
const agregarMesa = async () => {
  if (!formNuevaMesa.value.numeroMesa || !formNuevaMesa.value.capacidad) {
    alert('Por favor completa todos los campos')
    return
  }

  loadingGuardar.value = true
  try {
    const payload = {
      numeroMesa: Number(formNuevaMesa.value.numeroMesa),
      capacidad: Number(formNuevaMesa.value.capacidad),
      estado: formNuevaMesa.value.estado,
    }
    await axios.post(`/${ENDPOINT}`, payload)
    alert('✅ Mesa agregada con éxito')
    formNuevaMesa.value = { numeroMesa: '', capacidad: '', estado: 'LIBRE' }
    showModalAgregar.value = false
    await loadMesas() // Recargar lista
  } catch (err) {
    console.error('Error al agregar mesa:', err)
    alert('❌ Error al agregar mesa. Intente de nuevo.')
  } finally {
    loadingGuardar.value = false
  }
}

onMounted(() => {
  loadMesas()
})

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
const router = useRouter()

const handleMesaAction = (mesa: Mesa) => {
  selectedMesa.value = mesa

  if (mesa.estado === 'LIBRE') {
    // Navegar a RegistrarVenta para iniciar nueva venta con mesaId
    router.push({ name: 'admin-registrar', query: { mesaId: String(mesa.id) } })
    return
  }

  if (mesa.estado === 'OCUPADA') {
    // Abrir venta activa (si existe) para editar/pagar
    if (mesa.idVentaActiva) {
      router.push({
        name: 'admin-registrar',
        query: { mesaId: String(mesa.id), ventaId: String(mesa.idVentaActiva) },
      })
      return
    }
    // Si no hay venta activa, ir a crear una
    router.push({ name: 'admin-registrar', query: { mesaId: String(mesa.id) } })
    return
  }

  // Mantenimiento: no hacer nada o mostrar info
  if (mesa.estado === 'MANTENIMIENTO') {
    // dejar como estaba: no navegar
    return
  }
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
            <button class="btn btn-success me-2" @click="showModalAgregar = true">
              <i class="fa fa-plus me-1"></i> Agregar Mesa
            </button>
            <button class="btn btn-primary me-2" @click="loadMesas" :disabled="loadingMesas">
              <i class="fa fa-sync-alt me-1"></i>
              {{ loadingMesas ? 'Sincronizando...' : 'Sincronizar' }}
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

    <!-- Modal para agregar mesa -->
    <div v-if="showModalAgregar" class="modal-overlay" @click.self="showModalAgregar = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Agregar Nueva Mesa</h5>
          <button type="button" class="btn-close" @click="showModalAgregar = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-bold">Número de Mesa:</label>
            <input
              type="number"
              class="form-control"
              v-model="formNuevaMesa.numeroMesa"
              placeholder="Ej: 8"
              min="1"
            />
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Capacidad (personas):</label>
            <input
              type="number"
              class="form-control"
              v-model="formNuevaMesa.capacidad"
              placeholder="Ej: 4"
              min="1"
            />
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado:</label>
            <select class="form-select" v-model="formNuevaMesa.estado">
              <option value="LIBRE">Libre</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModalAgregar = false">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="agregarMesa"
            :disabled="loadingGuardar"
          >
            {{ loadingGuardar ? 'Guardando...' : 'Guardar Mesa' }}
          </button>
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

/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header .modal-title {
  margin: 0;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.btn-close:hover {
  color: #000;
}
</style>
