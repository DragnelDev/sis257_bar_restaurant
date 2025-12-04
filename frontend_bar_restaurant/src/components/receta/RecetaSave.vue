<script setup lang="ts">
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, InputText, Textarea, Dropdown } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch, onMounted } from 'vue'
import type { PropType } from 'vue'

const toast = useToast()
const ENDPOINT = 'recetas'

interface Categoria {
  id: number
  nombre: string
  tipoCategoria: 'INVENTARIO' | 'MENÚ'
}

interface CreateDetalleRecetaDto {
  idProducto: number
  cantidadConsumida: number
}

interface CreateRecetaDto {
  nombreReceta: string
  descripcion: string
  precioVentaActual: number
  urlImagen: string
  idCategoria: number
  detalles: CreateDetalleRecetaDto[]
}

const props = defineProps({
  mostrar: Boolean,
  receta: { type: Object, default: () => ({}) },
  modoEdicion: Boolean,
  productos: {
    type: Array as PropType<Producto[]>,
    default: () => [],
  },
})

const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (v: boolean) => {
    if (!v) emit('close')
  },
})

/* ---------------- ESTADOS ---------------- */
const nombreReceta = ref('')
const descripcion = ref('')
const precioVentaActual = ref(0)
const urlImagen = ref('')
const categoria = ref<Categoria | null>(null)

const productos = ref<Producto[]>([])
const categorias = ref<Categoria[]>([])
const detalles = ref<CreateDetalleRecetaDto[]>([])

const productoSeleccionado = ref<Producto | null>(null)
const unidadSeleccionada = ref('')

const nuevoDetalle = ref<CreateDetalleRecetaDto>({
  idProducto: 0,
  cantidadConsumida: 1,
})

const saving = ref(false)
const imagenPreview = computed(() =>
  urlImagen.value && urlImagen.value.trim() !== '' ? urlImagen.value : null,
)

// Validación de errores similar a empleado
const errors = ref<Record<string, string>>({})

/* ---------------- CARGA DE DATOS ---------------- */
onMounted(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([
      http.get<Producto[]>('productos'),
      http.get<Categoria[]>('categorias'),
    ])
    productos.value = prodRes.data.filter((p) => !p.esVendible)
    categorias.value = catRes.data.filter((c) => c.tipoCategoria === 'MENÚ')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos.',
      life: 2500,
    })
  }
})

/* ---------------- WATCH EDICIÓN ---------------- */
watch(
  () => props.receta,
  (r) => {
    if (!r) return
    nombreReceta.value = r.nombreReceta || ''
    descripcion.value = r.descripcion || ''
    precioVentaActual.value = r.precioVentaActual || 0
    urlImagen.value = r.urlImagen || ''
    categoria.value = r.categoria || null
    detalles.value = r.detalles
      ? r.detalles.map((d: any) => ({
          idProducto: d.idProducto,
          cantidadConsumida: d.cantidadConsumida,
        }))
      : []
  },
  { immediate: true },
)

/* ---------------- WATCH PRODUCTO ---------------- */
watch(productoSeleccionado, (p) => {
  if (p) {
    nuevoDetalle.value.idProducto = p.id
    unidadSeleccionada.value = p.unidadMedida?.nombre || 'unidad'
  } else {
    nuevoDetalle.value.idProducto = 0
    unidadSeleccionada.value = ''
  }
})

/* ---------------- VALIDACIONES ---------------- */
const canAdd = computed(() => {
  if (!productoSeleccionado.value) return false
  if (nuevoDetalle.value.cantidadConsumida <= 0) return false
  return true
})

function agregarDetalle() {
  if (!canAdd.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cantidad inválida',
      detail: 'Debe seleccionar un producto y una cantidad válida.',
      life: 2500,
    })
    return
  }

  // Verificar si el producto ya existe en los detalles
  const yaExiste = detalles.value.find((d) => d.idProducto === nuevoDetalle.value.idProducto)
  if (yaExiste) {
    toast.add({
      severity: 'warn',
      summary: 'Producto duplicado',
      detail: 'Este producto ya está en la lista.',
      life: 2500,
    })
    return
  }

  detalles.value.push({ ...nuevoDetalle.value })
  productoSeleccionado.value = null
  unidadSeleccionada.value = ''
  nuevoDetalle.value = {
    idProducto: 0,
    cantidadConsumida: 1,
  }

  toast.add({ severity: 'success', summary: 'Agregado', detail: 'Detalle añadido.', life: 1800 })
}

function eliminarDetalle(i: number) {
  detalles.value.splice(i, 1)
  toast.add({ severity: 'warn', summary: 'Eliminado', detail: 'Producto eliminado.', life: 1800 })
}

/* ---------------- GUARDAR ---------------- */
async function handleSave() {
  // Validaciones
  errors.value = {}

  if (!nombreReceta.value.trim()) {
    errors.value.nombreReceta = 'El nombre es obligatorio.'
  }
  if (!categoria.value) {
    errors.value.categoria = 'Seleccione una categoría.'
  }
  if (detalles.value.length === 0) {
    errors.value.detalles = 'Debe añadir al menos un producto.'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const body: CreateRecetaDto = {
    nombreReceta: nombreReceta.value.trim(),
    descripcion: descripcion.value.trim(),
    precioVentaActual: Number(precioVentaActual.value) || 0,
    urlImagen: urlImagen.value.trim(),
    idCategoria: categoria.value.id,
    detalles: detalles.value.map((d) => ({
      idProducto: Number(d.idProducto),
      cantidadConsumida: Number(d.cantidadConsumida),
    })),
  }

  try {
    saving.value = true
    let savedReceta: any = null

    if (props.modoEdicion && props.receta?.id) {
      const res = await http.patch(`${ENDPOINT}/${props.receta.id}`, body)
      savedReceta = res?.data
    } else {
      const res = await http.post(ENDPOINT, body)
      savedReceta = res?.data
    }

    // Intentar recuperar la receta completa si no vienen los detalles
    try {
      const hasProducto =
        savedReceta &&
        Array.isArray(savedReceta.detalles) &&
        savedReceta.detalles[0] &&
        savedReceta.detalles[0].producto

      if (!hasProducto && savedReceta?.id) {
        const fullRes = await http.get(`${ENDPOINT}/${savedReceta.id}`)
        savedReceta = fullRes?.data
      }
    } catch (e) {
      console.warn('⚠️ No fue posible recuperar receta completa:', e)
    }

    toast.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Receta guardada correctamente.',
      life: 2500,
    })

    emit('guardar', savedReceta)
    dialogVisible.value = false
  } catch (err: any) {
    console.error('❌ Error guardando receta:', err)

    const serverMsg = err?.response?.data?.message
    const serverErrors = err?.response?.data?.errors
    const serverError = err?.response?.data?.error

    let errDetail = 'Error al guardar la receta.'

    if (serverErrors && Array.isArray(serverErrors)) {
      errDetail = serverErrors.join(', ')
    } else if (serverMsg) {
      errDetail = serverMsg
    } else if (serverError) {
      errDetail = serverError
    } else if (err?.message) {
      errDetail = err.message
    }

    toast.add({
      severity: 'error',
      summary: `Error ${err?.response?.status || ''}`,
      detail: errDetail,
      life: 10000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Receta' : 'Registrar Receta'"
    style="width: 100%; max-width: 650px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
  >
    <div class="form-container">
      <!-- Información Básica -->
      <div class="form-row">
        <div class="form-field">
          <label for="nombreReceta" class="form-label">Nombre Receta *</label>
          <InputText
            id="nombreReceta"
            v-model="nombreReceta"
            class="w-full form-input"
            placeholder="Ingrese nombre de la receta"
            autocomplete="off"
          />
          <small v-if="errors.nombreReceta" class="error-text">{{ errors.nombreReceta }}</small>
        </div>

        <div class="form-field">
          <label for="categoria" class="form-label">Categoría *</label>
          <Dropdown
            id="categoria"
            v-model="categoria"
            :options="categorias"
            optionLabel="nombre"
            placeholder="Seleccione categoría"
            class="w-full"
          />
          <small v-if="errors.categoria" class="error-text">{{ errors.categoria }}</small>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="precioVenta" class="form-label">Precio Venta (Bs)</label>
          <InputNumber
            id="precioVenta"
            v-model="precioVentaActual"
            class="w-full"
            mode="decimal"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            placeholder="0.00"
          />
        </div>

        <div class="form-field">
          <label for="urlImagen" class="form-label">URL Imagen</label>
          <InputText
            id="urlImagen"
            v-model="urlImagen"
            class="w-full form-input"
            placeholder="https://..."
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Descripción -->
      <div class="form-field">
        <label for="descripcion" class="form-label">Descripción</label>
        <Textarea
          id="descripcion"
          v-model="descripcion"
          rows="2"
          class="w-full form-input"
          placeholder="Describa la receta..."
        />
      </div>

      <!-- Previsualización de imagen -->
      <div v-if="imagenPreview" class="form-field text-center">
        <img
          :src="imagenPreview"
          class="mx-auto w-32 h-32 object-cover rounded border border-gray-300"
          alt="Previsualización"
          @error="urlImagen = ''"
        />
      </div>

      <!-- Ingredientes Necesarios -->
      <div class="form-section-divider">
        <h3 class="section-title">Ingredientes Necesarios *</h3>
        <small v-if="errors.detalles" class="error-text block">{{ errors.detalles }}</small>
      </div>

      <!-- Campos para agregar ingredientes -->
      <div class="form-row">
        <div class="form-field">
          <label for="productoSeleccionado" class="form-label">Producto/Ingrediente</label>
          <Dropdown
            id="productoSeleccionado"
            v-model="productoSeleccionado"
            :options="productos"
            optionLabel="nombre"
            placeholder="Seleccionar"
            class="w-full"
            filter
          />
        </div>

        <div class="form-field">
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <label for="cantidadConsumida" class="form-label">
                Cant. / <span class="font-semibold">{{ unidadSeleccionada || 'Unid.' }}</span>
              </label>
              <InputNumber
                id="cantidadConsumida"
                v-model="nuevoDetalle.cantidadConsumida"
                :min="0.001"
                :step="0.01"
                :maxFractionDigits="3"
                class="w-full"
              />
            </div>
            <Button
              icon="pi pi-plus"
              class="btn-add-ingredient mt-4"
              :disabled="!canAdd"
              @click="agregarDetalle"
            />
          </div>
        </div>
      </div>

      <!-- Lista de ingredientes agregados -->
      <div v-if="detalles.length > 0" class="form-field">
        <div class="border border-gray-300 rounded p-3 mt-2 max-h-48 overflow-y-auto">
          <div
            v-for="(d, i) in detalles"
            :key="i"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <strong>{{ productos.find((p) => p.id === d.idProducto)?.nombre }}</strong>
              <div class="text-sm text-gray-600">
                Cantidad: {{ d.cantidadConsumida }} ({{
                  productos.find((p) => p.id === d.idProducto)?.unidadMedida?.nombre || 'Unidad'
                }})
              </div>
            </div>
            <Button
              icon="pi pi-trash"
              class="p-button-danger p-button-text p-button-sm"
              @click="eliminarDetalle(i)"
            />
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          class="btn-cancel"
          @click="dialogVisible = false"
        />
        <Button
          type="button"
          label="Guardar"
          class="btn-save"
          @click="handleSave"
          :loading="saving"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Form Row - Grid Layout for multiple fields */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Form Label */
.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333333;
  display: block;
}

/* Form Input - Light Mode */
.form-input {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
  font-family: inherit !important;
}

.form-input:focus {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
  outline: none !important;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Form Section Divider */
.form-section-divider {
  margin-top: 8px;
  margin-bottom: 12px;
  padding-top: 16px;
  border-top: 1px solid #e1e8ed;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 4px;
}

/* PrimeVue Dropdown Light Mode */
:deep(.p-dropdown) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  border-radius: 6px !important;
  width: 100%;
}

:deep(.p-dropdown .p-dropdown-label) {
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
}

:deep(.p-dropdown:hover) {
  border-color: #c1c7cd !important;
}

:deep(.p-dropdown.p-focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
  color: #333333 !important;
  padding: 0.75rem 1rem !important;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background: #ff4081 !important;
  color: white !important;
}

/* PrimeVue Textarea Light Mode */
:deep(.p-inputtextarea) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
  font-family: inherit !important;
}

:deep(.p-inputtextarea:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
  outline: none !important;
}

/* PrimeVue InputNumber Light Mode */
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
}

:deep(.p-inputnumber .p-inputnumber-input:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
}

:deep(.p-inputnumber-button) {
  background: #f8f9fa !important;
  border: 1px solid #d1d9df !important;
}

/* Botón Agregar Ingrediente */
.btn-add-ingredient {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(255, 64, 129, 0.25) !important;
}

.btn-add-ingredient:hover:not(:disabled) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(255, 64, 129, 0.35) !important;
}

.btn-add-ingredient:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* Error Text */
.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 500;
  display: block;
  margin-top: 4px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e1e8ed;
}

/* Save Button */
.btn-save {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: white !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.25) !important;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(255, 64, 129, 0.35) !important;
}

.btn-save:active:not(:disabled) {
  transform: translateY(0) !important;
}

.btn-save:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* Cancel Button */
.btn-cancel {
  background-color: #ffffff !important;
  color: #333333 !important;
  border: 2px solid #d1d9df !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

.btn-cancel:hover {
  background-color: #f8f9fa !important;
  border-color: #c1c7cd !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.btn-cancel:active {
  transform: translateY(0) !important;
}

/* Dialog Customization */
:deep(.dialog-header-custom) {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
  border-bottom: 2px solid rgba(255, 64, 129, 0.15) !important;
  padding: 20px !important;
}

:deep(.dialog-header-custom .p-dialog-title) {
  color: #333333 !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
}

:deep(.dialog-content-custom) {
  background-color: #ffffff !important;
  padding: 20px !important;
  color: #333333 !important;
}

/* Focus states for accessibility */
:deep(.p-button:focus) {
  outline: 3px solid rgba(255, 64, 129, 0.25) !important;
  outline-offset: 2px !important;
}

/* Imagen de previsualización */
img {
  max-width: 100%;
  height: auto;
}
</style>
