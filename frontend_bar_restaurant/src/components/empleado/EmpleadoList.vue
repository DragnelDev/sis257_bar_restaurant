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
  <div>
    <div class="col-7 pl-0 mt-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre, apellidos o cargo"
        />
      </InputGroup>
    </div>

    <!-- Barra de controles: selector de cargo y botón Crear (fuera de la tabla) -->
    <div class="flex justify-content-between align-items-center mb-3">
      <div class="flex align-items-center gap-2">
        <label for="cargoFilter" class="font-semibold">Filtrar por cargo:</label>
        <select id="cargoFilter" v-model="selectedCargo" class="p-2 border rounded">
          <option value="Todos">Todos</option>
          <option v-for="c in uniqueCargos" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div>
        <Button
          label="Crear Nuevo Empleado"
          icon="pi pi-plus"
          @click="handleCreate"
          severity="success"
        />
      </div>
    </div>

    <div v-if="error" class="error-message mt-4">
      {{ error }}
    </div>

    <div v-if="cargando" class="loading-message mt-4">Cargando empleados...</div>

    <table v-if="!cargando && !error">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>C.I.</th>
          <th>Empleado</th>
          <th>Fecha de Nacimiento</th>
          <th>Dirección</th>
          <th>Celular</th>
          <th>Email</th>
          <th>Cargo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(empleado, index) in paginatedEmpleados"
          :key="empleado.id"
          :class="{ 'row-alternate': index % 2 === 1 }"
        >
          <td>{{ (pagina - 1) * paginaSize + index + 1 }}</td>
          <td>{{ empleado.cedulaIdentidad }}</td>
          <td>{{ getNombreCompleto(empleado) }}</td>
          <td>
            {{
              typeof empleado.fechaNacimiento === 'string'
                ? empleado.fechaNacimiento.split('T')[0]
                : empleado.fechaNacimiento
            }}
          </td>
          <td>{{ empleado.direccion }}</td>
          <td>{{ empleado.celular }}</td>
          <td>{{ empleado.email }}</td>
          <td>
            {{
              typeof empleado.fechaIngreso === 'string'
                ? empleado.fechaIngreso.split('T')[0]
                : empleado.fechaIngreso
            }}
          </td>
          <td>{{ empleado.cargo }}</td>
          <td>{{ empleado.salario }}</td>
          <td>
            <span :class="['estado-badge', empleado.activo ? 'activo' : 'inactivo']">
              {{ empleado.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>
            <Button
              icon="pi pi-eye"
              aria-label="Ver"
              text
              @click="$emit('view', empleado)"
              tooltip="Ver detalles"
              class="p-button-info"
            />
            <Button
              icon="pi pi-pencil"
              aria-label="Editar"
              text
              @click="emitirEdicion(empleado)"
              tooltip="Editar empleado"
            />
            <Button
              icon="pi pi-trash"
              aria-label="Eliminar"
              text
              severity="danger"
              @click="mostrarEliminarConfirm(empleado)"
              tooltip="Eliminar empleado"
            />
          </td>
        </tr>
        <tr v-if="empleadosFiltrados.length === 0">
          <td colspan="10" class="text-center">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <!-- Controles de paginación -->
    <div v-if="empleadosFiltrados.length > 0" class="mt-4 pagination-controls">
      <div class="flex justify-between items-center">
        <div>
          Mostrando {{ (pagina - 1) * paginaSize + 1 }} -
          {{ Math.min(pagina * paginaSize, empleadosFiltrados.length) }} de
          {{ empleadosFiltrados.length }}
        </div>
        <div class="flex items-center gap-2">
          <Button
            icon="pi pi-angle-left"
            @click="prevPage"
            :disabled="pagina <= 1"
            aria-label="Página anterior"
          />
          <span v-for="p in paginas" :key="p">
            <Button :class="{ 'p-button-primary': pagina === p }" @click="goToPage(p)">
              {{ p }}
            </Button>
          </span>
          <Button
            icon="pi pi-angle-right"
            @click="nextPage"
            :disabled="pagina >= totalPages"
            aria-label="Página siguiente"
          />
          <select
            v-model="paginaSize"
            class="p-2 border rounded"
            @change="changePageSize(paginaSize)"
          >
            <option :value="5">5 por página</option>
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar este registro?</p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="mostrarConfirmDialog = false"
        />
        <Button type="button" label="Eliminar" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

thead th {
  background-color: #f8fafc;
  font-weight: 600;
}

.row-alternate {
  background-color: #f8fafc;
}

tr:hover {
  background-color: #f1f5f9;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.estado-badge.activo {
  background-color: #dcfce7;
  color: #166534;
}

.estado-badge.inactivo {
  background-color: #fee2e2;
  color: #991b1b;
}

.error-message {
  color: #dc2626;
  padding: 1rem;
  border: 1px solid #dc2626;
  border-radius: 0.375rem;
  background-color: #fee2e2;
}

.loading-message {
  color: #1d4ed8;
  padding: 1rem;
  text-align: center;
  font-weight: 500;
}

.pagination-controls {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
}

.text-center {
  text-align: center;
}
</style>
