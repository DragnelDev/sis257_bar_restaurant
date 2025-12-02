<script setup lang="ts">
import type { Empleado } from '@/models/Empleado'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import { computed, onMounted, ref, watch } from 'vue'

const ENDPOINT = 'empleados'
const empleados = ref<Empleado[]>([])
const cargando = ref<boolean>(false)
const error = ref<string>('')
const busqueda = ref<string>('')

const emit = defineEmits(['edit', 'view', 'create', 'cargo'])
const empleadoDelete = ref<Empleado | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)

// Selector de cargo (emit 'cargo')
const selectedCargo = ref<string>('Todos')
const uniqueCargos = computed(() => {
  const set = new Set<string>()
  empleados.value.forEach((e) => {
    if (e.cargo) set.add(e.cargo)
  })
  return Array.from(set).sort()
})

watch(selectedCargo, (val) => {
  emit('cargo', val)
  // resetear página al cambiar filtro
  pagina.value = 1
})

function handleCreate() {
  emit('create')
}

// Función para obtener nombre completo
const getNombreCompleto = (empleado: Empleado) => {
  return `${empleado.nombre} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno}`
}

// Paginación
const pagina = ref<number>(1)
const paginaSize = ref<number>(10)

const empleadosFiltrados = computed(() => {
  const searchTerm = busqueda.value.toLowerCase()
  return empleados.value.filter((empleado) => {
    const matchesSearch =
      empleado.nombre.toLowerCase().includes(searchTerm) ||
      empleado.apellidoPaterno.toLowerCase().includes(searchTerm) ||
      empleado.apellidoMaterno.toLowerCase().includes(searchTerm) ||
      empleado.cargo.toLowerCase().includes(searchTerm)

    const matchesCargo = selectedCargo.value === 'Todos' || empleado.cargo === selectedCargo.value

    return matchesSearch && matchesCargo
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(empleadosFiltrados.value.length / paginaSize.value)),
)

const paginas = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const paginatedEmpleados = computed(() => {
  const start = (pagina.value - 1) * paginaSize.value
  return empleadosFiltrados.value.slice(start, start + paginaSize.value)
})

// Reset page when search or page size changes
watch(busqueda, () => (pagina.value = 1))
watch(paginaSize, () => (pagina.value = 1))

async function obtenerLista() {
  cargando.value = true
  error.value = ''
  try {
    const response = await http.get(ENDPOINT)
    empleados.value = response.data
  } catch (err) {
    console.error('Error al obtener empleados:', err)
    error.value = err instanceof Error ? err.message : 'Error al cargar los empleados'
    empleados.value = []
  } finally {
    cargando.value = false
  }
}

function emitirEdicion(empleado: Empleado) {
  emit('edit', empleado)
}

function prevPage() {
  if (pagina.value > 1) pagina.value -= 1
}

function nextPage() {
  if (pagina.value < totalPages.value) pagina.value += 1
}

function goToPage(n: number) {
  if (n >= 1 && n <= totalPages.value) {
    pagina.value = n
  }
}

function changePageSize(n: number) {
  paginaSize.value = n
}

function mostrarEliminarConfirm(empleado: Empleado) {
  empleadoDelete.value = empleado
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${empleadoDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}

onMounted(() => {
  obtenerLista()
})

defineExpose({ obtenerLista })
</script>

<template>
  <div class="p-4 p-datatable-list">
    <h2 class="mb-4 text-xl font-semibold text-color-secondary">Gestión de Empleados</h2>

    <div class="flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div class="d-flex flex-wrap gap-3">
        <div class="w-full sm:w-12rem md:w-18rem">
          <InputGroup>
            <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
            <InputText
              v-model="busqueda"
              type="text"
              placeholder="Buscar (Nombre, C.I., Cargo)"
              class="w-full"
            />
          </InputGroup>
        </div>

        <div class="d-flex align-items-center gap-2">
          <label for="cargoFilter" class="font-semibold text-900">Cargo:</label>
          <select
            id="cargoFilter"
            v-model="selectedCargo"
            class="p-dropdown p-inputtext p-component p-4 w-12rem"
          >
            <option value="Todos">Todos los cargos</option>
            <option v-for="c in uniqueCargos" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div>
        <Button
          label="Nuevo Empleado"
          icon="pi pi-plus"
          @click="handleCreate"
          severity="success"
          class="p-button-lg"
        />
      </div>
    </div>

    <div v-if="error" class="p-alert p-alert-danger mb-4">
      <i class="pi pi-exclamation-triangle mr-2"></i> {{ error }}
    </div>

    <div v-if="cargando" class="p-4 bg-white border-round shadow-1 text-center text-primary">
      <i class="pi pi-spin pi-spinner mr-2 text-2xl"></i> Cargando empleados...
    </div>

    <div v-if="!cargando && !error" class="p-datatable p-component shadow-1 border-round bg-white">
      <div class="table-responsive">
        <table class="p-datatable-table">
          <thead class="bg-gray-100">
            <tr>
              <th style="width: 50px">Nro.</th>
              <th>C.I.</th>
              <th style="width: 25%">Empleado</th>
              <th>Cargo</th>
              <th>Celular</th>
              <th>Email</th>
              <th>Estado</th>
              <th style="width: 150px; text-align: center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(empleado, index) in paginatedEmpleados"
              :key="empleado.id"
              class="p-datatable-row"
            >
              <td>{{ (pagina - 1) * paginaSize + index + 1 }}</td>
              <td>{{ empleado.cedulaIdentidad }}</td>
              <td class="font-semibold text-900">{{ getNombreCompleto(empleado) }}</td>
              <td>
                <span class="p-tag p-tag-info">{{ empleado.cargo }}</span>
              </td>
              <td>{{ empleado.celular }}</td>
              <td class="text-sm">{{ empleado.email }}</td>
              <td>
                <span :class="['p-tag', empleado.activo ? 'p-tag-success' : 'p-tag-danger']">
                  {{ empleado.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="text-center">
                <Button
                  icon="pi pi-eye"
                  aria-label="Ver"
                  text
                  rounded
                  class="p-button-sm p-button-info"
                  @click="$emit('view', empleado)"
                  v-tooltip.top="'Ver detalles'"
                />
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  text
                  rounded
                  class="p-button-sm p-button-warning"
                  @click="emitirEdicion(empleado)"
                  v-tooltip.top="'Editar empleado'"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  text
                  rounded
                  severity="danger"
                  class="p-button-sm"
                  @click="mostrarEliminarConfirm(empleado)"
                  v-tooltip.top="'Eliminar empleado'"
                />
              </td>
            </tr>
            <tr v-if="empleadosFiltrados.length === 0">
              <td colspan="8" class="text-center p-3 text-muted">No se encontraron empleados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="empleadosFiltrados.length > 0"
      class="mt-4 p-paginator p-component border-round shadow-1"
    >
      <div class="flex justify-content-between align-items-center p-3">
        <div class="p-paginator-summary text-sm">
          Mostrando {{ (pagina - 1) * paginaSize + 1 }} -
          {{ Math.min(pagina * paginaSize, empleadosFiltrados.length) }} de
          {{ empleadosFiltrados.length }} empleados
        </div>

        <div class="d-flex align-items-center gap-2">
          <select
            v-model="paginaSize"
            class="p-dropdown p-inputtext p-component p-4"
            @change="changePageSize(paginaSize)"
          >
            <option :value="5">5 por pág.</option>
            <option :value="10">10 por pág.</option>
            <option :value="25">25 por pág.</option>
            <option :value="50">50 por pág.</option>
          </select>

          <Button
            icon="pi pi-angle-left"
            @click="prevPage"
            :disabled="pagina <= 1"
            aria-label="Anterior"
            text
            rounded
          />
          <span v-for="p in paginas" :key="p">
            <Button
              :label="p.toString()"
              :severity="pagina === p ? 'primary' : 'secondary'"
              text
              rounded
              @click="goToPage(p)"
            />
          </span>
          <Button
            icon="pi pi-angle-right"
            @click="nextPage"
            :disabled="pagina >= totalPages"
            aria-label="Siguiente"
            text
            rounded
          />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
      modal
    >
      <div class="d-flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-danger text-2xl" />
        <span
          >¿Estás seguro de que deseas eliminar a **{{
            getNombreCompleto(empleadoDelete!)
          }}**?</span
        >
      </div>
      <div class="flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          outlined
          @click="mostrarConfirmDialog = false"
        />
        <Button type="button" label="Eliminar" @click="eliminar" severity="danger" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* === CONTENEDOR PRINCIPAL === */
.p-datatable-list {
  background-color: var(--gray); /* Fondo claro */
  min-height: 80vh;
}

/* === TABLA === */
.p-datatable {
  border: 1px solid #e9ecef;
}

/* Encabezado */
.p-datatable-table thead th {
  background-color: var(--secondary); /* naranja cálido */
  color: var(--light); /* texto blanco */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Filas */
.p-datatable-table tbody tr {
  transition: background-color 0.3s;
}
.p-datatable-table tbody tr:hover {
  background-color: rgba(254,161,22,0.1); /* hover naranja suave */
}
.p-datatable-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

/* === BOTONES === */
/* Botón "Nuevo Empleado" → verde éxito */
.p-button.p-button-success {
  background-color: #28a745;
  border-color: #28a745;
  color: var(--light) !important;
}
.p-button.p-button-success:hover {
  background-color: #218838;
  border-color: #218838;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* Botón Editar → rosa vibrante */
.p-button.p-button-warning {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--light);
}
.p-button.p-button-warning:hover {
  background-color: #d93670;
  border-color: #d93670;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* Botón Eliminar → rojo peligro */
.p-button.p-button-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: var(--light);
}
.p-button.p-button-danger:hover {
  background-color: #b02a37;
  border-color: #b02a37;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* === SELECTORES === */
.p-dropdown {
  color: var(--text);
  background-color: var(--light);
}

/* === TAGS DE ESTADO === */
.p-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.p-tag-success {
  background-color: #e6ffed;
  color: #1a7e43;
}
.p-tag-danger {
  background-color: #fff0f0;
  color: #c81d25;
}
.p-tag-info {
  background-color: var(--accent); /* azul eléctrico */
  color: var(--light);
}

/* === PAGINADOR === */
.p-paginator {
  background-color: var(--light);
  border: 1px solid #e9ecef;
}
.p-paginator .p-paginator-page:hover {
  background-color: var(--secondary);
  color: var(--light);
  border-radius: var(--radius);
}

/* === UTILIDADES === */
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-4 { margin-top: 1.5rem; }
.shadow-1 {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1),
              0 1px 2px rgba(0,0,0,0.06);
}
.border-round { border-radius: 6px; }

/* Columnas centradas */
.p-datatable-table th:nth-child(1),
.p-datatable-table td:nth-child(1),
.p-datatable-table th:last-child,
.p-datatable-table td:last-child {
  text-align: center;
}

/* Labels */
label { color: var(--dark) !important; }
.text-900 { color: var(--dark) !important; }

/* Errores */
.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}
</style>


