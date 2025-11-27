<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Empleado } from '@/models/Empleado'
import EmpleadoList from '@/components/empleado/EmpleadoList.vue'
import EmpleadoSave from '@/components/empleado/EmpleadoSave.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
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
const empleadosActivos = computed(() => empleados.value.filter((e) => e.activo).length)

const empleadosInactivos = computed(() => empleados.value.filter((e) => !e.activo).length)

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
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calcularEdad = (fechaNacimiento: Date | string) => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

// Lifecycle
onMounted(() => {
  cargarEmpleados()
})
</script>

<template>
  <div class="staff-view">
    <div class="page-header mb-4">
      <div>
        <h2 class="mb-1">
          <i class="pi pi-users me-2"></i>Gestión de Personal
        </h2>
        <p class="text-muted">Administrar empleados del restaurante</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card stat-total">
          <div class="stat-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Empleados</div>
            <div class="stat-value">{{ empleados.length }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card stat-activos">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Empleados Activos</div>
            <div class="stat-value">{{ empleadosActivos }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card stat-inactivos">
          <div class="stat-icon">
            <i class="pi pi-times-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Empleados Inactivos</div>
            <div class="stat-value">{{ empleadosInactivos }}</div>
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
      :header="'Información Detallada del Empleado'"
      :modal="true"
      :style="{ width: '55rem' }"
    >
      <div v-if="empleadoSeleccionado" class="empleado-details">
        <!-- Header del Empleado -->
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <i class="pi pi-user"></i>
            </div>
          </div>
          <div class="profile-info">
            <h3 class="nombre-completo">{{ getNombreCompleto(empleadoSeleccionado) }}</h3>
            <div class="cargo-badge">
              <i class="pi pi-briefcase me-2"></i>{{ empleadoSeleccionado.cargo }}
            </div>
            <div class="mt-2">
              <span
                class="estado-badge"
                :class="empleadoSeleccionado.activo ? 'activo' : 'inactivo'"
              >
                <i
                  class="pi me-1"
                  :class="empleadoSeleccionado.activo ? 'pi-check-circle' : 'pi-times-circle'"
                ></i>
                {{ empleadoSeleccionado.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <hr class="separator" />

        <!-- Información Personal -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-user me-2"></i>Información Personal
          </h6>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon bg-primary">
                <i class="pi pi-id-card"></i>
              </div>
              <div class="info-text">
                <label>Cédula de Identidad</label>
                <span>{{ empleadoSeleccionado.cedulaIdentidad }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon bg-info">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="info-text">
                <label>Fecha de Nacimiento</label>
                <span>{{ formatDate(empleadoSeleccionado.fechaNacimiento) }}</span>
                <small class="text-muted"
                  >({{ calcularEdad(empleadoSeleccionado.fechaNacimiento) }} años)</small
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Información de Contacto -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-phone me-2"></i>Información de Contacto
          </h6>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon bg-success">
                <i class="pi pi-phone"></i>
              </div>
              <div class="info-text">
                <label>Celular</label>
                <a :href="`tel:${empleadoSeleccionado.celular}`" class="text-primary">
                  {{ empleadoSeleccionado.celular }}
                </a>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon bg-warning">
                <i class="pi pi-envelope"></i>
              </div>
              <div class="info-text">
                <label>Email</label>
                <a :href="`mailto:${empleadoSeleccionado.email}`" class="text-primary">
                  {{ empleadoSeleccionado.email }}
                </a>
              </div>
            </div>

            <div class="info-card full-width">
              <div class="info-icon bg-danger">
                <i class="pi pi-map-marker"></i>
              </div>
              <div class="info-text">
                <label>Dirección</label>
                <span>{{ empleadoSeleccionado.direccion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Editar Empleado"
          icon="pi pi-pencil"
          class="me-2"
          @click="
            () => {
              mostrarDetalles = false
              handleEdit(empleadoSeleccionado!)
            }
          "
        />
        <Button label="Cerrar" severity="secondary" @click="mostrarDetalles = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.staff-view {
  max-width: 1600px;
  width: 100%;
  padding: 1rem;
}

.page-header h2 {
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.page-header p {
  font-size: 0.95rem;
}

/* Stats Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-total {
  border-color: #6366f1;
}

.stat-activos {
  border-color: #10b981;
}

.stat-inactivos {
  border-color: #ef4444;
}

.stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
}

.stat-activos .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-inactivos .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

/* Modal de Detalles */
.empleado-details {
  padding: 0.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
}

.profile-info {
  flex: 1;
}

.nombre-completo {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
}

.cargo-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.estado-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.estado-badge.activo {
  background-color: #d1fae5;
  color: #065f46;
}

.estado-badge.inactivo {
  background-color: #fee2e2;
  color: #991b1b;
}

.separator {
  margin: 1.5rem 0;
  border-top: 2px solid #e9ecef;
}

.section-container {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.info-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.info-icon.bg-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.info-icon.bg-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}

.info-icon.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.info-icon.bg-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.info-icon.bg-danger {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-text label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-text span,
.info-text a {
  color: #212529;
  font-size: 1rem;
  font-weight: 500;
}

.info-text a {
  text-decoration: none;
}

.info-text a:hover {
  text-decoration: underline;
}

.info-text small {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .nombre-completo {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-card.full-width {
    grid-column: 1;
  }
}

@media (max-width: 576px) {
  .info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
