<script setup lang="ts">
import type { DetalleReceta } from '@/models/DetalleReceta'
import type { Receta } from '@/models/Receta'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'recetas'
const detallesReceta = ref<DetalleReceta[]>([])
const recetaDelete = ref<Receta | null>(null)
const recetaDetalle = ref<Receta | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const mostrarDetalleDialog = ref<boolean>(false)
const busqueda = ref<string>('')

// Variables de paginación
const paginaActual = ref<number>(1)
const itemsPorPagina = ref<number>(10)

// El evento 'edit' emitirá el objeto Receta
const emit = defineEmits(['edit'])

// Filtrado de datos
const detallesFiltrados = computed(() => {
  return detallesReceta.value.filter((detalle) => {
    const q = busqueda.value.toLowerCase()
    const receta = detalle.receta

    return (
      receta?.nombreReceta?.toLowerCase().includes(q) ||
      detalle.producto?.nombre?.toLowerCase().includes(q) ||
      detalle?.producto?.categoria?.nombre?.includes(q)
    )
  })
})

// Datos paginados
const detallesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return detallesFiltrados.value.slice(inicio, fin)
})

// Total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(detallesFiltrados.value.length / itemsPorPagina.value)
})

// Rango de páginas para mostrar
const rangosPaginas = computed(() => {
  const paginas = []
  const maxPaginas = 5
  let inicio = Math.max(1, paginaActual.value - Math.floor(maxPaginas / 2))
  let fin = Math.min(totalPaginas.value, inicio + maxPaginas - 1)

  if (fin - inicio < maxPaginas - 1) {
    inicio = Math.max(1, fin - maxPaginas + 1)
  }

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  return paginas
})

// Detalles de la receta seleccionada agrupados
const detallesRecetaSeleccionada = computed(() => {
  if (!recetaDetalle.value) return []
  return detallesReceta.value.filter((d) => d.idReceta === recetaDetalle.value?.id)
})

async function obtenerLista() {
  try {
    const response = await http.get(ENDPOINT)
    let data = response?.data

    if (data && data.data) data = data.data

    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('idReceta')) {
      detallesReceta.value = data as DetalleReceta[]
      return
    }

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      (data[0].hasOwnProperty('detalles') || data[0].hasOwnProperty('ingredientes'))
    ) {
      const flattened: DetalleReceta[] = []
      ;(data as any[]).forEach((recetaObj) => {
        const receta = recetaObj as any
        const detallesArr = receta.detalles || receta.ingredientes || []
        detallesArr.forEach((d: any) => {
          flattened.push({
            id: d.id ?? 0,
            idReceta: d.idReceta ?? receta.id,
            idProducto: d.idProducto ?? d.producto?.id ?? 0,
            cantidadConsumida: Number(d.cantidadConsumida ?? d.cantidad ?? 0),
            receta: receta,
            producto: d.producto ?? null,
          })
        })
      })
      detallesReceta.value = flattened
      return
    }

    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('nombreReceta')) {
      console.warn(
        'Recetas recibidas pero no contienen detalles. Debería usar un endpoint de detalles.',
      )
      detallesReceta.value = []
      return
    }

    if (Array.isArray(data)) detallesReceta.value = data as DetalleReceta[]
    else detallesReceta.value = []
  } catch (err) {
    console.error('Error obteniendo recetas:', err)
    detallesReceta.value = []
  }
}

function emitirEdicion(receta: Receta) {
  emit('edit', receta)
}

function mostrarEliminarConfirm(receta: Receta) {
  recetaDelete.value = receta
  mostrarConfirmDialog.value = true
}

function mostrarDetalle(receta: Receta) {
  recetaDetalle.value = receta
  mostrarDetalleDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${recetaDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
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
          placeholder="Buscar por receta, categoria o producto"
          @input="onBusqueda"
        />
      </InputGroup>
    </div>

    <div class="table-responsive mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro.</th>
            <th>Nombre Receta</th>
            <th style="width: 110px">Imagen</th>
            <th>Descripcion</th>
            <th>Precio Venta</th>
            <th>Costo Actual</th>
            <th>Cant.</th>
            <th>Unidad</th>
            <th>Producto</th>
            <th>Stock</th>
            <th style="width: 160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(detalle, index) in detallesPaginados" :key="detalle.id">
            <td class="text-center">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
            <td class="fw-bold">{{ detalle?.receta?.nombreReceta ?? 'N/A' }}</td>
            <td>
              <img
                :src="detalle?.receta?.urlImagen || '/public/img/default-recipe.png'"
                :alt="`Imagen de ${detalle?.receta?.nombreReceta || 'receta'}`"
                class="imagen-receta-tabla"
              />
            </td>
            <td class="text-truncate" style="max-width: 280px">
              {{ detalle?.receta?.descripcion ?? 'N/A' }}
            </td>
            <td>Bs. {{ detalle?.receta?.precioVentaActual ?? '0.00' }}</td>
            <td>Bs. {{ detalle?.receta?.costoActual ?? '0.00' }}</td>
            <td class="text-center">{{ detalle.cantidadConsumida }}</td>
            <td class="text-center">{{ detalle.producto.unidadMedida.nombre }}</td>
            <td>{{ detalle.producto?.nombre ?? 'N/A' }}</td>
            <td class="text-center">{{ detalle.producto?.stockActual ?? 'N/A' }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button
                  icon="pi pi-eye"
                  aria-label="Ver Detalle"
                  class="p-button-text p-button-sm text-info"
                  @click="mostrarDetalle(detalle.receta)"
                />
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  class="p-button-text p-button-sm"
                  @click="emitirEdicion(detalle.receta)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  class="p-button-text p-button-sm text-danger"
                  @click="mostrarEliminarConfirm(detalle.receta)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="detallesPaginados.length === 0">
            <td colspan="11" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted">
        Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} a
        {{ Math.min(paginaActual * itemsPorPagina, detallesFiltrados.length) }}
        de {{ detallesFiltrados.length }} registros
      </div>

      <nav aria-label="Paginación">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: paginaActual === 1 }">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual - 1)">
              <i class="pi pi-angle-left"></i>
            </a>
          </li>

          <li v-if="rangosPaginas[0] > 1" class="page-item">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(1)">1</a>
          </li>
          <li v-if="rangosPaginas[0] > 2" class="page-item disabled">
            <span class="page-link">...</span>
          </li>

          <li
            v-for="pagina in rangosPaginas"
            :key="pagina"
            class="page-item"
            :class="{ active: pagina === paginaActual }"
          >
            <a class="page-link" href="#" @click.prevent="cambiarPagina(pagina)">
              {{ pagina }}
            </a>
          </li>

          <li
            v-if="rangosPaginas[rangosPaginas.length - 1] < totalPaginas - 1"
            class="page-item disabled"
          >
            <span class="page-link">...</span>
          </li>
          <li v-if="rangosPaginas[rangosPaginas.length - 1] < totalPaginas" class="page-item">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(totalPaginas)">
              {{ totalPaginas }}
            </a>
          </li>

          <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual + 1)">
              <i class="pi pi-angle-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Dialog de Confirmación de Eliminación -->
    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar la receta de **{{ recetaDelete?.nombreReceta }}**?</p>
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

    <!-- Dialog de Detalle de Receta -->
    <Dialog
      v-model:visible="mostrarDetalleDialog"
      :header="`Detalle de: ${recetaDetalle?.nombreReceta}`"
      :style="{ width: '50rem' }"
      :modal="true"
    >
      <div v-if="recetaDetalle" class="detalle-receta">
        <div class="row mb-3">
          <div class="col-md-4">
            <img
              :src="recetaDetalle.urlImagen || '/public/img/default-recipe.png'"
              :alt="recetaDetalle.nombreReceta"
              class="imagen-detalle"
            />
          </div>
          <div class="col-md-8">
            <h5 class="mb-3">{{ recetaDetalle.nombreReceta }}</h5>
            <p class="text-muted">{{ recetaDetalle.descripcion }}</p>

            <div class="info-grid mt-3">
              <div class="info-item">
                <strong>Precio de Venta:</strong>
                <span class="text-success">Bs. {{ recetaDetalle.precioVentaActual }}</span>
              </div>
              <div class="info-item">
                <strong>Costo Actual:</strong>
                <span class="text-primary">Bs. {{ recetaDetalle.costoActual }}</span>
              </div>
            </div>
          </div>
        </div>

        <hr />

        <h6 class="mb-3">Ingredientes</h6>
        <div class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead class="table-light">
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th class="text-center">Cantidad</th>
                <th class="text-center">Unidad</th>
                <th class="text-center">Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detalle in detallesRecetaSeleccionada" :key="detalle.id">
                <td>{{ detalle.producto?.nombre }}</td>
                <td>{{ detalle.producto?.categoria?.nombre }}</td>
                <td class="text-center">{{ detalle.cantidadConsumida }}</td>
                <td class="text-center">{{ detalle.producto?.unidadMedida?.nombre }}</td>
                <td class="text-center">
                  <span :class="detalle.producto?.stockActual < 10 ? 'text-danger fw-bold' : ''">
                    {{ detalle.producto?.stockActual }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" @click="mostrarDetalleDialog = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.imagen-receta-tabla {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.imagen-receta-tabla:hover {
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
  font-size: 1.125rem;
  font-weight: 600;
}

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

.detalle-receta {
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
}
</style>
