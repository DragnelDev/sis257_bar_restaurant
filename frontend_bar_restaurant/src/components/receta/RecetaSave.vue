<script setup lang="ts">
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, InputText, Textarea, Dropdown } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch, onMounted, PropType } from 'vue'

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

/* ---------------- CARGA DE DATOS ---------------- */
onMounted(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([
      http.get<Producto[]>('productos'),
      http.get<Categoria[]>('categorias'),
    ])
    productos.value = prodRes.data.filter((p) => !p.esVendible)
    categorias.value = catRes.data.filter((c) => c.tipoCategoria === 'MENÚ')
  } catch (err) {
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
  // CORREGIDO: Removida validación de stock que puede no aplicar en recetas
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

/* ---------------- GUARDAR (CORREGIDO) ---------------- */
async function handleSave() {
  // Validaciones
  if (!nombreReceta.value.trim()) {
    return toast.add({
      severity: 'warn',
      summary: 'Faltan datos',
      detail: 'El nombre es obligatorio.',
      life: 2500,
    })
  }
  if (!categoria.value) {
    return toast.add({
      severity: 'warn',
      summary: 'Faltan datos',
      detail: 'Seleccione una categoría.',
      life: 2500,
    })
  }
  if (detalles.value.length === 0) {
    return toast.add({
      severity: 'warn',
      summary: 'Sin detalles',
      detail: 'Debe añadir al menos un producto.',
      life: 2500,
    })
  }

  // CORREGIDO: Asegurarse de enviar el ID de la categoría, no el objeto
  const body: CreateRecetaDto = {
    nombreReceta: nombreReceta.value.trim(),
    descripcion: descripcion.value.trim(),
    precioVentaActual: Number(precioVentaActual.value) || 0,
    urlImagen: urlImagen.value.trim(),
    idCategoria: categoria.value.id, // ✅ Enviar solo el ID
    detalles: detalles.value.map((d) => ({
      idProducto: Number(d.idProducto),
      cantidadConsumida: Number(d.cantidadConsumida),
    })),
  }

  console.log('📤 Body a enviar:', JSON.stringify(body, null, 2))

  try {
    saving.value = true
    let savedReceta: any = null

    if (props.modoEdicion && props.receta?.id) {
      const res = await http.patch(`${ENDPOINT}/${props.receta.id}`, body)
      savedReceta = res?.data
      console.log('✅ Receta actualizada:', savedReceta)
    } else {
      const res = await http.post(ENDPOINT, body)
      savedReceta = res?.data
      console.log('✅ Receta creada:', savedReceta)
    }

    // Intentar recuperar la receta completa si no vienen los detalles
    try {
      const hasProducto =
        savedReceta &&
        Array.isArray(savedReceta.detalles) &&
        savedReceta.detalles[0] &&
        savedReceta.detalles[0].producto

      if (!hasProducto && savedReceta?.id) {
        console.log('🔄 Recuperando receta completa...')
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
    console.error('📋 Response status:', err?.response?.status)
    console.error('📋 Response data:', err?.response?.data)
    console.error('📋 Response headers:', err?.response?.headers)
    console.error('📋 Request data:', err?.config?.data)

    const serverMsg = err?.response?.data?.message
    const serverErrors = err?.response?.data?.errors
    const serverError = err?.response?.data?.error
    const serverStatusCode = err?.response?.data?.statusCode

    let errDetail = 'Error al guardar la receta.'

    // Manejo detallado de errores del backend
    if (serverErrors && Array.isArray(serverErrors)) {
      errDetail = serverErrors.join(', ')
    } else if (serverMsg) {
      errDetail = serverMsg
    } else if (serverError) {
      errDetail = serverError
    } else if (err?.response?.data) {
      try {
        errDetail = JSON.stringify(err.response.data, null, 2)
      } catch {
        errDetail = String(err.response.data)
      }
    } else if (err?.message) {
      errDetail = err.message
    }

    console.error('🔴 Error detallado:', errDetail)

    toast.add({
      severity: 'error',
      summary: `Error ${serverStatusCode || err?.response?.status || ''}`,
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
    modal
    :header="props.modoEdicion ? 'Editar Receta' : 'Registrar Receta'"
    style="width: 45rem"
    scrollable
  >
    <form class="row g-3">
      <div class="col-12">
        <label for="nombreReceta" class="form-label">Nombre Receta *</label>
        <InputText id="nombreReceta" v-model="nombreReceta" class="form-control" autofocus />
      </div>

      <div class="col-md-6">
        <label for="categoria" class="form-label">Categoría *</label>
        <Dropdown
          id="categoria"
          v-model="categoria"
          :options="categorias"
          optionLabel="nombre"
          placeholder="Seleccione"
          class="form-control"
        />
      </div>

      <div class="col-md-6">
        <label for="precioVenta" class="form-label">Precio Venta</label>
        <InputNumber
          id="precioVenta"
          v-model="precioVentaActual"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          :min="0"
          :step="0.01"
          class="form-control"
        />
      </div>

      <div class="col-12">
        <label for="urlImagen" class="form-label">URL Imagen</label>
        <InputText
          id="urlImagen"
          v-model="urlImagen"
          placeholder="https://..."
          class="form-control"
        />
      </div>

      <div class="col-12">
        <label for="descripcion" class="form-label">Descripción</label>
        <Textarea id="descripcion" v-model="descripcion" autoResize rows="3" class="form-control" />
      </div>

      <div v-if="imagenPreview" class="col-12 text-center">
        <img
          :src="imagenPreview"
          class="mx-auto w-40 h-40 object-cover rounded shadow"
          alt="Previsualización de imagen"
        />
      </div>

      <div class="col-12 mt-3 border-top pt-3">
        <h4 class="font-bold">Ingredientes Necesarios *</h4>
      </div>

      <div class="col-12 d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label for="productoSeleccionado" class="form-label">Producto/Ingrediente</label>
          <Dropdown
            id="productoSeleccionado"
            v-model="productoSeleccionado"
            :options="productos"
            optionLabel="nombre"
            placeholder="Seleccionar"
            class="form-control"
            filter
          />
        </div>

        <div class="d-flex align-items-center" style="width: 150px">
          <div class="flex-grow-1">
            <label for="cantidadConsumida" class="form-label">
              Cant. / <span class="fw-semibold">{{ unidadSeleccionada || 'Unid.' }}</span>
            </label>
            <InputNumber
              id="cantidadConsumida"
              v-model="nuevoDetalle.cantidadConsumida"
              :min="0.001"
              :step="0.01"
              :maxFractionDigits="3"
              class="form-control"
            />
          </div>
        </div>

        <Button
          icon="pi pi-plus"
          class="p-button-success p-button-sm mt-3"
          :disabled="!canAdd"
          @click="agregarDetalle"
        />
      </div>

      <div
        v-if="detalles.length > 0"
        class="col-12 mt-3 border rounded p-3"
        style="max-height: 250px; overflow-y: auto"
      >
        <div
          v-for="(d, i) in detalles"
          :key="i"
          class="d-flex justify-content-between align-items-center border-bottom py-2"
        >
          <div>
            <strong>{{ productos.find((p) => p.id === d.idProducto)?.nombre }}</strong>
            <div class="text-sm text-muted">
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

      <div class="col-12 d-flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          class="p-button-sm p-button-text"
          @click="dialogVisible = false"
        />
        <Button
          type="submit"
          label="Guardar"
          icon="pi pi-save"
          class="p-button-sm"
          :loading="saving"
          @click.prevent="handleSave"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
:deep(.p-dropdown.form-control),
:deep(.p-inputnumber.form-control),
:deep(.p-inputtext.form-control),
:deep(.p-textarea.form-control) {
  width: 100%;
}

:deep(.p-inputnumber.form-control) input {
  width: 100%;
}
</style>
