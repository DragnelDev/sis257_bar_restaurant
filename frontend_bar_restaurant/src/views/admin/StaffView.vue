<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Empleado } from '@/models/Empleado'
import EmpleadoList from '@/components/empleado/EmpleadoList.vue'
import EmpleadoSave from '@/components/empleado/EmpleadoSave.vue'
import Dialog from 'primevue/dialog'
import http from '@/plugins/axios'

const empleados = ref<Empleado[]>([])
const cargando = ref(false)
const mostrarDialog = ref(false)
const mostrarDetalles = ref(false)
const empleadoSeleccionado = ref<Empleado | null>(null)
const error = ref('')
const busqueda = ref('')
const EmpleadoListRef = ref<InstanceType<typeof EmpleadoList> | null>(null)

// Computed
const empleadosActivos = computed(() =>
  empleados.value.filter(e => e.activo).length
)

const empleadosInactivos = computed(() =>
  empleados.value.filter(e => !e.activo).length
)

// Methods
const cargarEmpleados = async () => {
  cargando.value = true
  error.value = ''

  try {
    const response = await http.get('empleados')
    empleados.value = response.data
  } catch (err) {
    error.value = 'Error al cargar empleados. Verifique la conexión con el servidor.'
    console.error('Error loading employees:', err)
  } finally {
    cargando.value = false
  }
}

const handleCreate = () => {
  empleadoSeleccionado.value = null
  mostrarDialog.value = true
}

const handleEdit = (empleado: Empleado) => {
  empleadoSeleccionado.value = empleado
  mostrarDialog.value = true
}

const handleCloseDialog = () => {
  mostrarDialog.value = false
}

const handleGuardar = () => {
  EmpleadoListRef.value?.obtenerLista()
  cargarEmpleados()
}

const mostrarDetallesEmpleado = (empleado: Empleado) => {
  empleadoSeleccionado.value = empleado
  mostrarDetalles.value = true
}

const getNombreCompleto = (empleado: Empleado) => {
  return `${empleado.nombre} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno}`
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(() => {
  cargarEmpleados()
})
</script>

<template>
  <div class="staff-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">Gestión de Personal</h2>
      <p class="text-muted">Administrar empleados del restaurante</p>
    </div>

    <!-- Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card border-success">
          <div class="stat-icon bg-success">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <h6>Total Empleados</h6>
            <h3>{{ empleados.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-primary">
          <div class="stat-icon bg-primary">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <h6>Activos</h6>
            <h3>{{ empleadosActivos }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-danger">
          <div class="stat-icon bg-danger">
            <i class="pi pi-times-circle"></i>
          </div>
          <div class="stat-content">
            <h6>Inactivos</h6>
            <h3>{{ empleadosInactivos }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista y formulario de empleados -->
    <EmpleadoList
      ref="EmpleadoListRef"
      @edit="handleEdit"
      @view="mostrarDetallesEmpleado"
      @create="handleCreate"
    />

    <EmpleadoSave
      :mostrar="mostrarDialog"
      :empleado="empleadoSeleccionado"
      :modoEdicion="!!empleadoSeleccionado"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />

    <!-- Modal de Detalles del Empleado -->
    <Dialog
      v-model:visible="mostrarDetalles"
      :header="'Detalles del Empleado'"
      :modal="true"
      :style="{ width: '50rem' }"
      class="p-fluid"
    >
      <div v-if="empleadoSeleccionado" class="empleado-details">
        <div class="profile-header">
          <div class="profile-info" style="width:100%">
            <h3>{{ getNombreCompleto(empleadoSeleccionado) }}</h3>
            <p class="cargo">{{ empleadoSeleccionado.cargo }}</p>
            <span :class="['estado-badge', empleadoSeleccionado.activo ? 'activo' : 'inactivo']">
              {{ empleadoSeleccionado.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label><i class="pi pi-id-card"></i> CI:</label>
            <span>{{ empleadoSeleccionado.cedulaIdentidad }}</span>
          </div>
          <div class="info-item">
            <label><i class="pi pi-calendar"></i> Fecha de Nacimiento:</label>
            <span>{{ formatDate(empleadoSeleccionado.fechaNacimiento) }}</span>
          </div>
          <div class="info-item">
            <label><i class="pi pi-phone"></i> Celular:</label>
            <span>{{ empleadoSeleccionado.celular }}</span>
          </div>
          <div class="info-item">
            <label><i class="pi pi-envelope"></i> Email:</label>
            <span>{{ empleadoSeleccionado.email }}</span>
          </div>
          <div class="info-item full-width">
            <label><i class="pi pi-map-marker"></i> Dirección:</label>
            <span>{{ empleadoSeleccionado.direccion }}</span>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template><style scoped>
.staff-view {
  max-width: 1600px;
  width: 100%;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  border-left: 4px solid;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
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
  color: var(--dark);
  margin: 0;
}

/* Estilos para el modal de detalles */
.empleado-details {
  padding: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.cargo {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0.5rem 0;
}

.estado-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.estado-badge.activo {
  background-color: #d4edda;
  color: #155724;
}

.estado-badge.inactivo {
  background-color: #f8d7da;
  color: #721c24;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item label i {
  color: var(--primary-color);
}

.info-item span {
  color: #212529;
  font-size: 1rem;
}
</style>
