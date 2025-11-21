<script setup lang="ts">
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Dropdown } from 'primevue'
import { computed, ref, watch, onMounted } from 'vue'

const ENDPOINT = 'recetas'

// Tipos locales para el DTO de receta
interface CreateDetalleRecetaDto {
  idProducto: number
  cantidadConsumida: number
  unidadConsumo: string
}

interface CreateRecetaDto {
  nombreReceta: string
  descripcion: string
  precioVentaActual: number
  urlImagen: string
  categoria: string
  detalles: CreateDetalleRecetaDto[]
}

const props = defineProps({
  mostrar: Boolean,
  receta: {
    type: Object,
    default: () => ({}),
  },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (v: boolean) => {
    if (!v) emit('close')
  },
})

// Estado del formulario
const nombreReceta = ref<string>(props.receta?.nombreReceta || '')
const descripcion = ref<string>(props.receta?.descripcion || '')
const precioVentaActual = ref<number>(props.receta?.precioVentaActual || 0)
const urlImagen = ref<string>(props.receta?.urlImagen || '')
const categoria = ref<string>(props.receta?.categoria || '')

// Detalles
const productos = ref<Producto[]>([])
const detalles = ref<CreateDetalleRecetaDto[]>([])
const nuevoDetalle = ref<CreateDetalleRecetaDto>({
  idProducto: 0,
  cantidadConsumida: 1,
  unidadConsumo: '',
})
const productoSeleccionado = ref<Producto | null>(null)
const saving = ref(false)
// Categorías y unidades (enums/locales)
const CATEGORIAS = ['Bebida', 'Comida', 'Postre', 'Entrada', 'Otro']
const UNIDADES = ['Litro', 'Kilo', 'Unidad', 'g', 'ml']
const categoriaSeleccionada = ref<string>(props.receta?.categoria || '')
const categorias = ref<string[]>(CATEGORIAS)

// Mejora: estado derivado para habilitar botón y mostrar stock
const canAddDetalle = computed(() => {
  if (!nuevoDetalle.value.idProducto) return false
  const cantidad = Number(nuevoDetalle.value.cantidadConsumida) || 0
  if (cantidad <= 0) return false
  if (!nuevoDetalle.value.unidadConsumo) return false
  if (props.modoEdicion) return false

  // Si existe stock conocido, la cantidad no debe excederlo
  const stock = selectedProductStock.value
  if (stock !== null && !isNaN(stock)) {
    return cantidad <= stock
  }

  return true
})

const selectedProductStock = computed(() => {
  const p = productoSeleccionado.value
  if (!p) return null
  // stock puede venir como string desde backend
  const s = (p as any).stockActual
  const n = typeof s === 'string' ? parseFloat(s) : Number(s)
  return isNaN(n) ? null : n
})

onMounted(async () => {
  try {
    const res = await http.get<Producto[]>('productos')
    productos.value = res.data
  } catch (err) {
    console.error('Error cargando productos:', err)
  }
})

watch(
  () => props.receta,
  (r) => {
    if (r) {
      nombreReceta.value = r.nombreReceta || ''
      descripcion.value = r.descripcion || ''
      precioVentaActual.value = r.precioVentaActual || 0
      urlImagen.value = r.urlImagen || ''
      categoria.value = r.categoria || ''
      categoriaSeleccionada.value = r.categoria || ''
      // Mapear detalles si vienen (compatibilidad)
      detalles.value = (r as any).detalles
        ? (r as any).detalles.map((d: any) => ({
            idProducto: d.idProducto,
            cantidadConsumida: d.cantidadConsumida || d.cantidad || 0,
            unidadConsumo: d.unidadConsumo || d.unidad || '',
          }))
        : []
    }
  },
  { immediate: true },
)

function agregarDetalle() {
  if (!canAddDetalle.value) return

  detalles.value.push({ ...nuevoDetalle.value })
  // reset
  nuevoDetalle.value = { idProducto: 0, cantidadConsumida: 1, unidadConsumo: '' }
  productoSeleccionado.value = null
}

function eliminarDetalle(i: number) {
  detalles.value.splice(i, 1)
}

watch(productoSeleccionado, (p) => {
  if (p) nuevoDetalle.value.idProducto = p.id
})

const totalCosto = computed(() => {
  return detalles.value.reduce((s, d) => s + d.cantidadConsumida, 0)
})

async function handleSave() {
  try {
    if (!nombreReceta.value.trim()) {
      alert('El nombre de la receta es obligatorio.')
      return
    }
    if (detalles.value.length === 0) {
      alert('Agregue al menos un detalle a la receta.')
      return
    }

    const body: CreateRecetaDto = {
      nombreReceta: nombreReceta.value,
      descripcion: descripcion.value,
      precioVentaActual: precioVentaActual.value || 0,
      urlImagen: urlImagen.value,
      categoria: categoriaSeleccionada.value || categoria.value,
      detalles: detalles.value,
    }

    console.debug('Receta request body:', body)
    saving.value = true

    let res
    if (props.modoEdicion && (props.receta as any)?.id) {
      res = await http.patch(`${ENDPOINT}/${(props.receta as any).id}`, body)
    } else {
      res = await http.post(ENDPOINT, body)
    }

    console.debug('Receta response:', res && res.data)
    emit('guardar')
    // reset
    nombreReceta.value = ''
    descripcion.value = ''
    precioVentaActual.value = 0
    urlImagen.value = ''
    categoria.value = ''
    detalles.value = []
    nuevoDetalle.value = { idProducto: 0, cantidadConsumida: 1, unidadConsumo: '' }
    dialogVisible.value = false
  } catch (err: any) {
    console.error('Error guardando receta:', err)
    const serverMsg =
      err?.response?.data?.message || err?.response?.data || err?.message || String(err)
    alert(`Error guardando la receta: ${serverMsg}`)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card d-flex justify-content-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Receta' : 'Nueva Receta'"
      :style="{ width: '95vw', maxWidth: '900px' }"
      :modal="true"
    >
      <div class="container-fluid">
        <form class="row g-3">
          <div class="col-12 col-md-7">
            <label for="nombreReceta" class="form-label fw-bold">Nombre Receta</label>
            <input
              id="nombreReceta"
              name="nombreReceta"
              v-model="nombreReceta"
              type="text"
              class="form-control"
            />
          </div>

          <div class="col-12 col-md-5">
            <label for="categoria" class="form-label fw-bold">Categoria</label>
            <Dropdown
              id="categoria"
              name="categoria"
              v-model="categoriaSeleccionada"
              :options="categorias"
              placeholder="Seleccione categoria"
              class="w-100"
            />
          </div>

          <div class="col-12 col-md-6">
            <label for="precioVentaActual" class="form-label fw-bold">Precio Venta</label>
            <InputNumber
              id="precioVentaActual"
              name="precioVentaActual"
              v-model="precioVentaActual"
              mode="currency"
              currency="BOB"
              locale="es-BO"
              class="form-control"
              :min="0"
            />
          </div>

          <div class="col-12 col-md-6">
            <label for="urlImagen" class="form-label fw-bold">URL Imagen</label>
            <input id="urlImagen" v-model="urlImagen" class="form-control" type="text" />
          </div>

          <div class="col-12">
            <label for="descripcion" class="form-label fw-bold">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              v-model="descripcion"
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <div class="col-12">
            <h5 class="mt-2">
              Detalles de la Receta <small class="text-muted">(Total qty: {{ totalCosto }})</small>
            </h5>
            <div class="border rounded p-3 mb-2">
              <div class="row align-items-end detail-controls">
                <div class="col-12 col-md-6 mb-3">
                  <label for="productoDetalle" class="form-label">Producto</label>
                  <Dropdown
                    id="productoDetalle"
                    name="productoDetalle"
                    v-model="productoSeleccionado"
                    :options="productos"
                    optionLabel="nombre"
                    placeholder="Seleccione producto"
                    filter
                    class="w-100"
                  />
                  <div v-if="selectedProductStock !== null" class="small text-muted mt-1">
                    Stock: {{ selectedProductStock }}
                    <span
                      v-if="
                        selectedProductStock !== null &&
                        nuevoDetalle.cantidadConsumida > selectedProductStock
                      "
                      class="text-danger"
                    >
                      — insuficiente stock</span
                    >
                  </div>
                </div>

                <div class="col-6 col-md-3 mb-3">
                  <label for="cantidadConsumida" class="form-label">Cantidad</label>
                  <InputNumber
                    id="cantidadConsumida"
                    name="cantidadConsumida"
                    v-model="nuevoDetalle.cantidadConsumida"
                    :min="0.001"
                    class="form-control"
                    :step="0.1"
                  />
                </div>

                <div class="col-6 col-md-3 mb-3">
                  <label for="unidadConsumo" class="form-label">Unidad</label>
                  <Dropdown
                    id="unidadConsumo"
                    name="unidadConsumo"
                    v-model="nuevoDetalle.unidadConsumo"
                    :options="UNIDADES"
                    placeholder="Seleccione unidad"
                    class="w-100"
                  />
                </div>

                <div class="col-12 col-md-2 mb-3 d-flex align-items-end ms-auto">
                  <Button
                    icon="pi pi-plus"
                    label="Agregar"
                    class="p-button-sm w-100"
                    @click="agregarDetalle"
                    :disabled="!canAddDetalle"
                    severity="success"
                  />
                </div>
              </div>

              <div class="table-responsive mt-3">
                <table class="table table-sm table-striped w-100">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-end">Cantidad</th>
                      <th class="text-center">Unidad</th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(d, i) in detalles" :key="i">
                      <td>
                        {{
                          (productos.find((p) => p.id === d.idProducto) || {}).nombre ||
                          d.idProducto
                        }}
                      </td>
                      <td class="text-end">{{ d.cantidadConsumida }}</td>
                      <td class="text-center">{{ d.unidadConsumo }}</td>
                      <td class="text-center">
                        <Button
                          icon="pi pi-trash"
                          class="p-button-text p-button-sm text-danger"
                          @click="eliminarDetalle(i)"
                        />
                      </td>
                    </tr>
                    <tr v-if="detalles.length === 0">
                      <td colspan="4" class="text-center">No hay detalles agregados.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-12 d-flex justify-content-end gap-2 mt-2">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              severity="secondary"
              class="p-button-sm"
              @click="dialogVisible = false"
            />
            <Button
              type="button"
              label="Guardar Receta"
              icon="pi pi-save"
              class="p-button-sm p-button-primary"
              @click="handleSave"
              :loading="saving"
              :disabled="saving"
            />
          </div>
        </form>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

/* Responsive tweaks for the detalle row */
.detail-controls {
  gap: 0.5rem;
}

@media (max-width: 576px) {
  /* Force each control to full width on small screens */
  .detail-controls .col-md-5,
  .detail-controls .col-md-3,
  .detail-controls .col-md-1 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  /* Make inputnumber and dropdown full width */
  .detail-controls .w-full,
  .detail-controls .w-100 {
    width: 100% !important;
  }

  /* Hide the button label on small screens to save space */
  .btn-add .p-button-label {
    display: none;
  }

  .btn-add {
    padding: 0.35rem 0.5rem;
  }
}

@media (min-width: 577px) {
  .btn-add .p-button-icon {
    margin-right: 0.5rem;
  }
}

.imagen-receta-preview {
  max-width: 160px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.detail-controls {
  gap: 0.75rem;
}

.p-button-sm {
  padding: 0.45rem 0.6rem;
}
</style>
