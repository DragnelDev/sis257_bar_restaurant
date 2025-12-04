<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { ref, computed, onMounted } from 'vue'

const ENDPOINT = 'categorias'

const categorias = ref<Categoria[]>([])
const busqueda = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const categoriaDelete = ref<Categoria | null>(null)
const categoriaDetalle = ref<Categoria | null>(null)
const mostrarConfirmDialog = ref(false)
const mostrarDetalleDialog = ref(false)

// Variables de paginación
const paginaActual = ref<number>(1)
const itemsPorPagina = ref<number>(10)

const toast = useToast()
const emit = defineEmits(['edit'])

// Filtrado de datos
const categoriasFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  if (!q) return categorias.value

  return categorias.value.filter((c) =>
    [c.nombre, c.tipoCategoria, c.descripcion]
      .map((x) => (x ?? '').toString().toLowerCase())
      .some((x) => x.includes(q))
  )
})

// Datos paginados
const categoriasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return categoriasFiltradas.value.slice(inicio, fin)
})

// Total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(categoriasFiltradas.value.length / itemsPorPagina.value)
})


const paginas = computed(() => {
  return Array.from({ length: totalPaginas.value }, (_, i) => i + 1)
})

async function obtenerLista() {
  try {
    loading.value = true
    errorMessage.value = null
    const response = await http.get(ENDPOINT)
    categorias.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las categorías.'
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage.value, life: 4000 })
  } finally {
    loading.value = false
  }
}

function emitirEdicion(cat: Categoria) {
  emit('edit', cat)
}

function mostrarEliminarConfirm(cat: Categoria) {
  categoriaDelete.value = cat
  mostrarConfirmDialog.value = true
}

function mostrarDetalle(cat: Categoria) {
  categoriaDetalle.value = cat
  mostrarDetalleDialog.value = true
}

async function eliminar() {
  if (!categoriaDelete.value?.id) return

  try {
    await http.delete(`${ENDPOINT}/${categoriaDelete.value.id}`)
    toast.add({
      severity: 'success',
      summary: 'Categoría eliminada',
      detail: `La categoría "${categoriaDelete.value.nombre}" se eliminó correctamente`,
      life: 4000,
    })
    mostrarConfirmDialog.value = false
    obtenerLista()
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Error al eliminar',
      detail: `No se pudo eliminar la categoría "${categoriaDelete.value?.nombre}"`,
      life: 4000,
    })
  }
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

onMounted(() => obtenerLista())

// Exponer método para que el padre pueda actualizar la lista automáticamente
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
          placeholder="Buscar por nombre, tipo o descripción"
          @input="onBusqueda"
        />
      </InputGroup>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    <div v-if="loading" class="alert alert-info mt-3">Cargando categorías...</div>

    <div v-if="!loading && !errorMessage" class="table-responsive mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro</th>
            <th>Nombre</th>
            <th>Tipo de Categoría</th>
            <th>Descripción</th>
            <th style="width: 160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cat, index) in categoriasPaginadas" :key="cat.id">
            <td class="text-center">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
            <td class="fw-bold">{{ cat.nombre }}</td>
            <td>
              <span class="badge" :class="cat.tipoCategoria === 'Producto' ? 'bg-primary' : 'bg-success'">
                {{ cat.tipoCategoria }}
              </span>
            </td>
            <td class="text-truncate" style="max-width: 300px">
              {{ cat.descripcion || 'Sin descripción' }}
            </td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button
                  icon="pi pi-eye"
                  aria-label="Ver Detalle"
                  class="p-button-text p-button-sm text-info"
                  @click="mostrarDetalle(cat)"
                />
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  class="p-button-text p-button-sm"
                  @click="emitirEdicion(cat)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  class="p-button-text p-button-sm text-danger"
                  @click="mostrarEliminarConfirm(cat)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="categoriasPaginadas.length === 0">
            <td colspan="5" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación estilo compras -->
    <div
      v-if="categoriasFiltradas.length > 0"
      class="mt-4 p-paginator p-component border-round shadow-1"
    >
      <div class="flex justify-content-between align-items-center p-3">
        <div class="p-paginator-summary text-sm">
          Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} -
          {{ Math.min(paginaActual * itemsPorPagina, categoriasFiltradas.length) }} de
          {{ categoriasFiltradas.length }} registros
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

    <!-- Dialog de Confirmación de Eliminación -->
    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
        <p class="m-0">
          ¿Eliminar la categoría <b>{{ categoriaDelete?.nombre }}</b>? Esta acción no se puede
          deshacer.
        </p>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="mostrarConfirmDialog = false"
        />
        <Button label="Eliminar" severity="danger" icon="pi pi-trash" @click="eliminar" />
      </template>
    </Dialog>

    <!-- Dialog de Detalle de Categoría -->
    <Dialog
      v-model:visible="mostrarDetalleDialog"
      :header="`Detalle de la Categoría`"
      :style="{ width: '40rem' }"
      :modal="true"
    >
      <div v-if="categoriaDetalle" class="detalle-categoria">
        <div class="info-card mb-3">
          <div class="d-flex align-items-center mb-3">
            <i class="pi pi-tag text-primary me-3" style="font-size: 2.5rem"></i>
            <div>
              <h4 class="mb-1">{{ categoriaDetalle.nombre }}</h4>
              <span
                class="badge"
                :class="categoriaDetalle.tipoCategoria === 'Producto' ? 'bg-primary' : 'bg-success'"
              >
                {{ categoriaDetalle.tipoCategoria }}
              </span>
            </div>
          </div>

          <hr />

          <div class="info-content">
            <div class="info-item">
              <strong>
                <i class="pi pi-info-circle me-2"></i>Descripción:
              </strong>
              <p class="mt-2 text-muted">
                {{ categoriaDetalle.descripcion || 'Sin descripción disponible' }}
              </p>
            </div>

            <div class="info-item mt-3">
              <strong>
                <i class="pi pi-calendar me-2"></i>ID de Categoría:
              </strong>
              <span class="ms-2 badge bg-secondary">{{ categoriaDetalle.id }}</span>
            </div>
          </div>
        </div>

        <div class="alert alert-info d-flex align-items-center">
          <i class="pi pi-info-circle me-2"></i>
          <span>
            Esta categoría se utiliza para clasificar
            {{
              categoriaDetalle.tipoCategoria === 'Producto'
                ? 'productos del inventario'
                : 'recetas del menú'
            }}.
          </span>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" @click="mostrarDetalleDialog = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

table {
  min-width: 600px;
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

/* Estilos para el detalle de la categoría */
.detalle-categoria {
  max-height: 70vh;
  overflow-y: auto;
}

.info-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item strong {
  font-size: 1rem;
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.info-item p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
}

.info-item span {
  font-size: 1rem;
  color: #212529;
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

  .info-card {
    padding: 1rem;
  }
}
</style>
