<script setup lang="ts">
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { ref, onMounted, computed } from 'vue'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'

const ENDPOINT = 'productos'

// Emitimos eventos al padre
const emit = defineEmits(['edit', 'delete'])

const productos = ref<Producto[]>([])
const productoDetalle = ref<Producto | null>(null)
const mostrarDetalleDialog = ref(false)
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')

// Variables de paginación
const paginaActual = ref<number>(1)
const itemsPorPagina = ref<number>(10)

// Filtrado de datos
const productosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return productos.value.filter(
    (p) =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.categoria?.nombre || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q),
  )
})

// Datos paginados
const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return productosFiltrados.value.slice(inicio, fin)
})

// Total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(productosFiltrados.value.length / itemsPorPagina.value)
})


const paginas = computed(() => {
  return Array.from({ length: totalPaginas.value }, (_, i) => i + 1)
})

async function obtenerLista() {
  try {
    cargando.value = true
    error.value = ''
    const res = await http.get(ENDPOINT)
    productos.value = res.data.map((p: any) => ({
      ...p,
      costoUnitarioPromedio: Number(p.costoUnitarioPromedio ?? 0),
    }))
  } catch (err) {
    console.error('Error al obtener productos', err)
    error.value = err instanceof Error ? err.message : 'Error al cargar productos'
    productos.value = []
  } finally {
    cargando.value = false
  }
}

function handleEdit(p: Producto) {
  emit('edit', p)
}

function handleDelete(p: Producto) {
  emit('delete', p)
}

function mostrarDetalle(p: Producto) {
  productoDetalle.value = p
  mostrarDetalleDialog.value = true
}

function cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

// Resetear a página 1 cuando se busca
function onBusqueda() {
  paginaActual.value = 1
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
          placeholder="Buscar por nombre, categoría o descripción"
          @input="onBusqueda"
        />
      </InputGroup>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <div v-if="cargando" class="alert alert-info mt-3">Cargando productos...</div>

    <div v-if="!cargando && !error" class="table-container mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro</th>
            <th>Nombre</th>
            <th style="width: 110px">Imagen</th>
            <th>Categoría</th>
            <th>Unidad</th>
            <th>Stock Actual</th>
            <th>Costo Unitario</th>
            <th>Descripción</th>
            <th>Perecedero</th>
            <th>Vendible</th>
            <th style="width: 160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in productosPaginados" :key="producto.id">
            <td class="text-center">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
            <td class="fw-bold">{{ producto.nombre ?? '-' }}</td>
            <td>
              <img
                :src="producto.urlImagen || '/public/img/default-product.png'"
                :alt="`Imagen de ${producto.nombre || 'producto'}`"
                class="imagen-producto-tabla"
              />
            </td>
            <td>{{ producto.categoria?.nombre ?? '-' }}</td>
            <td class="text-center">{{ producto.unidadMedida?.nombre ?? '-' }}</td>
            <td class="text-center">
              <span :class="Number(producto.stockActual ?? 0) < 10 ? 'text-danger fw-bold' : ''">
                {{ Number(producto.stockActual ?? 0) }}
              </span>
            </td>
            <td>Bs. {{ (producto.costoUnitarioPromedio ?? 0).toFixed(2) }}</td>
            <td class="text-truncate" style="max-width: 200px">
              {{ producto.descripcion ?? '-' }}
            </td>
            <td class="text-center">
              <span v-if="producto.perecedero" class="badge bg-warning text-dark">Sí</span>
              <span v-else class="badge bg-secondary">No</span>
            </td>
            <td class="text-center">
              <span v-if="producto.esVendible" class="badge bg-success">Sí</span>
              <span v-else class="badge bg-secondary">No</span>
            </td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button
                  icon="pi pi-eye"
                  aria-label="Ver Detalle"
                  class="p-button-text p-button-sm text-info"
                  @click="mostrarDetalle(producto)"
                />
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  class="p-button-text p-button-sm"
                  @click="handleEdit(producto)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  class="p-button-text p-button-sm text-danger"
                  @click="handleDelete(producto)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="productosPaginados.length === 0">
            <td colspan="11" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación estilo compras -->
    <div
      v-if="productosFiltrados.length > 0"
      class="mt-4 p-paginator p-component border-round shadow-1"
    >
      <div class="flex justify-content-between align-items-center p-3">
        <div class="p-paginator-summary text-sm">
          Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} -
          {{ Math.min(paginaActual * itemsPorPagina, productosFiltrados.length) }} de
          {{ productosFiltrados.length }} registros
        </div>

        <div class="d-flex align-items-center gap-2">
          <Button
            icon="pi pi-angle-left"
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual <= 1"
            aria-label="Anterior"
            rounded
            class="btn-pagina"
          />
          <span v-for="p in paginas" :key="p">
            <Button
              :label="p.toString()"
              :severity="paginaActual === p ? 'primary' : 'secondary'"
              rounded
              @click="cambiarPagina(p)"
              class="btn-pagina"
            />
          </span>
          <Button
            icon="pi pi-angle-right"
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual >= totalPaginas"
            aria-label="Siguiente"
            rounded
            class="btn-pagina"
          />
        </div>
      </div>
    </div>

    <!-- Dialog de Detalle de Producto -->
    <Dialog
      v-model:visible="mostrarDetalleDialog"
      :header="`Detalle del Producto`"
      :style="{ width: '50rem' }"
      :modal="true"
    >
      <div v-if="productoDetalle" class="detalle-producto">
        <div class="row mb-3">
          <div class="col-md-4">
            <img
              :src="productoDetalle.urlImagen || '/public/img/default-product.png'"
              :alt="productoDetalle.nombre"
              class="imagen-detalle"
            />
          </div>
          <div class="col-md-8">
            <h5 class="mb-3">{{ productoDetalle.nombre }}</h5>
            <p class="text-muted">{{ productoDetalle.descripcion || 'Sin descripción' }}</p>

            <div class="info-grid mt-3">
              <div class="info-item">
                <strong>Categoría:</strong>
                <span>{{ productoDetalle.categoria?.nombre ?? '-' }}</span>
              </div>
              <div class="info-item">
                <strong>Unidad de Medida:</strong>
                <span>{{ productoDetalle.unidadMedida?.nombre ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <hr />

        <div class="row">
          <div class="col-md-6">
            <div class="info-card mb-3">
              <h6 class="info-header"><i class="pi pi-box me-2"></i>Información de Inventario</h6>
              <div class="info-content">
                <div class="info-item">
                  <strong>Stock Actual:</strong>
                  <span
                    :class="
                      Number(productoDetalle.stockActual ?? 0) < 10
                        ? 'text-danger fw-bold'
                        : 'text-success fw-bold'
                    "
                  >
                    {{ Number(productoDetalle.stockActual ?? 0) }}
                    {{ productoDetalle.unidadMedida?.nombre }}
                  </span>
                </div>
                <div class="info-item">
                  <strong>Costo Unitario Promedio:</strong>
                  <span class="text-primary fw-bold">
                    Bs. {{ (productoDetalle.costoUnitarioPromedio ?? 0).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="info-card mb-3">
              <h6 class="info-header"><i class="pi pi-info-circle me-2"></i>Características</h6>
              <div class="info-content">
                <div class="info-item">
                  <strong>Perecedero:</strong>
                  <span>
                    <span v-if="productoDetalle.perecedero" class="badge bg-warning text-dark">
                      Sí
                    </span>
                    <span v-else class="badge bg-secondary">No</span>
                  </span>
                </div>
                <div class="info-item">
                  <strong>Vendible:</strong>
                  <span>
                    <span v-if="productoDetalle.esVendible" class="badge bg-success">Sí</span>
                    <span v-else class="badge bg-secondary">No</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" @click="mostrarDetalleDialog = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.imagen-producto-tabla {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.imagen-producto-tabla:hover {
  transform: scale(1.05);
}

.imagen-detalle {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  font-size: 0.875rem;
  color: #6c757d;
}

.info-item span {
  font-size: 1rem;
  color: #212529;
}

.info-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.info-header {
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dee2e6;
  display: flex;
  align-items: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.table-responsive {
  overflow-x: auto;
}

table {
  min-width: 800px;
  border-collapse: collapse;
}

table th,
table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination .page-link {
  cursor: pointer;
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
}

.detalle-producto {
  max-height: 70vh;
  overflow-y: auto;
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    margin-bottom: 1rem;
  }
}
</style>
