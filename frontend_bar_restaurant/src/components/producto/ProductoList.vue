<script setup lang="ts">
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

const ENDPOINT = 'productos'
const productos = ref<Producto[]>([])
const productoDelete = ref<Producto | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const cargando = ref<boolean>(false)
const error = ref<string>('')
const emit = defineEmits(['edit'])

const productosFiltrados = computed(() => {
  return productos.value.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

// Pagination state (client-side)
const pagina = ref<number>(1)
const paginaSize = ref<number>(10)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(productosFiltrados.value.length / paginaSize.value)),
)

const paginas = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const paginatedProductos = computed(() => {
  const start = (pagina.value - 1) * paginaSize.value
  return productosFiltrados.value.slice(start, start + paginaSize.value)
})

// Reset page when search or page size changes
watch(busqueda, () => (pagina.value = 1))
watch(paginaSize, () => (pagina.value = 1))

async function obtenerLista() {
  cargando.value = true
  error.value = ''
  try {
    const response = await http.get(ENDPOINT)
    console.log('Respuesta del servidor (datos completos):', response.data)
    console.log('Ejemplo de un producto:', response.data[0])

    // Si los productos no tienen la relación de categoría cargada, vamos a cargarla
    if (response.data.length > 0 && !response.data[0].categoria) {
      const categoriasResponse = await http.get('categorias')
      const categorias = categoriasResponse.data

      productos.value = response.data.map((producto: Producto) => ({
        ...producto,
        categoria: categorias.find((cat) => cat.id === producto.idCategoria),
      }))
    } else {
      productos.value = response.data
    }
  } catch (err) {
    console.error('Error al obtener productos:', err)
    const msg = err instanceof Error ? err.message : 'Error al cargar los productos'
    error.value = msg
    const toast = useToast()
    toast.add({ severity: 'error', summary: 'Error cargando productos', detail: msg, life: 4000 })
    productos.value = []
  } finally {
    cargando.value = false
  }
}

function emitirEdicion(producto: Producto) {
  emit('edit', producto)
}

function mostrarEliminarConfirm(producto: Producto) {
  productoDelete.value = producto
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${productoDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}

function prevPage() {
  if (pagina.value > 1) pagina.value -= 1
}

function nextPage() {
  if (pagina.value < totalPages.value) pagina.value += 1
}

function goToPage(n: number) {
  if (n < 1) n = 1
  if (n > totalPages.value) n = totalPages.value
  pagina.value = n
}

function changePageSize(n: number) {
  paginaSize.value = n
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre o descripcion" />
      </InputGroup>
    </div>

    <Toast />
    <div v-if="cargando" class="alert alert-info mt-3">Cargando productos...</div>

    <div v-if="!cargando && !error" class="table-responsive mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-light text-dark">
          <tr>
            <th style="width: 48px">Nro.</th>
            <th>Nombre</th>
            <th>Categoria</th>
            <th>Descripcion</th>
            <th>Unidad</th>
            <th class="text-end">Stock</th>
            <th class="text-end">Costo Prom.</th>
            <th>Perecedero</th>
            <th style="width: 120px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in paginatedProductos" :key="producto.id">
            <td class="text-center">{{ (pagina - 1) * paginaSize + index + 1 }}</td>
            <td class="fw-bold">{{ producto.nombre }}</td>
            <td>{{ producto.categoria?.nombre || '—' }}</td>
            <td class="text-truncate" style="max-width: 240px">{{ producto.descripcion }}</td>
            <td class="text-center">{{ producto.unidadMedida }}</td>
            <td class="text-end">{{ producto.stockActual }}</td>
            <td class="text-end">Bs. {{ producto.costoUnitarioPromedio }}</td>
            <td class="text-center">{{ producto.perecedero ? 'Sí' : 'No' }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  class="p-button-text p-button-sm"
                  @click="emitirEdicion(producto)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  class="p-button-text p-button-sm text-danger"
                  @click="mostrarEliminarConfirm(producto)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="productosFiltrados.length === 0">
            <td colspan="9" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Controles de paginación -->
    <div v-if="productosFiltrados.length > 0" class="mt-4 pagination-controls">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem">
        <div>
          Mostrando {{ (pagina - 1) * paginaSize + 1 }} -
          {{ Math.min(pagina * paginaSize, productosFiltrados.length) }} de
          {{ productosFiltrados.length }}
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <button type="button" class="p-button" :disabled="pagina <= 1" @click="prevPage">
            Anterior
          </button>
          <template v-for="p in paginas" :key="p">
            <button
              type="button"
              :class="['p-button', { 'p-button-success': pagina === p }]"
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
          </template>
          <button type="button" class="p-button" :disabled="pagina >= totalPages" @click="nextPage">
            Siguiente
          </button>

          <select
            v-model.number="paginaSize"
            @change="changePageSize(paginaSize)"
            style="margin-left: 0.75rem"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar el producto {{ productoDelete?.nombre }}?</p>
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
  margin-top: 1rem;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
}

/* Forzar cabecera negra */
.table-dark,
thead.table-dark {
  background-color: #000 !important;
  color: #0f0202dc !important;
}

tr:hover {
  background-color: #f8fafc;
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

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 576px) {
  .table-responsive table thead {
    display: none;
  }
  .table-responsive table tbody tr {
    display: block;
    margin-bottom: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 0.375rem;
    padding: 0.5rem;
  }
  .table-responsive table tbody td {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0.5rem;
  }
}
</style>
