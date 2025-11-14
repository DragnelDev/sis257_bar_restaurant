<script setup lang="ts">
import type { Compra, CreateCompraDto, CreateDetalleCompraDto } from '@/models/compra'
import type { Proveedor } from '@/models/Proveedor'
import type { Producto } from '@/models/producto'
import { useAuthStore } from '@/stores'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Dropdown } from 'primevue'
import { computed, ref, watch, onMounted } from 'vue'

const ENDPOINT = 'compras'
const authStore = useAuthStore()

// Resolver id y representación legible del usuario almacenado en el store/localStorage
function getUserId(): number {
  const u: any = authStore.user
  if (!u) return 1
  if (typeof u === 'number') return u
  if (typeof u === 'string') {
    // intentar parsear como número
    const n = parseInt(u)
    if (!isNaN(n)) return n
    // intentar parsear JSON stringificado
    try {
      const parsed = JSON.parse(u)
      if (parsed && typeof parsed === 'object' && parsed.id) return parsed.id
    } catch {}
    return 1
  }
  if (typeof u === 'object' && u !== null) {
    return (u.id as number) || 1
  }
  return 1
}

function getUserDisplay(): string {
  const u: any = authStore.user
  if (!u) return ''
  if (typeof u === 'string') {
    try {
      const parsed = JSON.parse(u)
      if (parsed && parsed.usuario) return parsed.usuario
    } catch {}
    return u
  }
  if (typeof u === 'object') return u.usuario || String(u.id) || ''
  return String(u)
}
// Definir tipos para las props
const props = defineProps({
  mostrar: Boolean,
  compra: {
    type: Object as () => Compra,
    default: () => ({}) as Compra,
  },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

// Estado local para la compra y los detalles
const localCompra = ref<Compra>({ ...(props.compra as Compra) })
// Estado para la lista de detalles de la compra (necesario para creación)
const detallesCompra = ref<CreateDetalleCompraDto[]>([])
// Estado para un nuevo detalle que se está añadiendo
const nuevoDetalleItem = ref<CreateDetalleCompraDto>({
  idProducto: 0,
  cantidad: 1,
  precioUnitarioCompra: 0,
})

// Datos para los selects
const proveedores = ref<Proveedor[]>([])
const productos = ref<Producto[]>([])
const proveedorSeleccionado = ref<Proveedor | null>(null)
const productoSeleccionado = ref<Producto | null>(null)

// Lógica de Inicialización
onMounted(async () => {
  // Cargar proveedores y productos del backend
  try {
    const [proveedoresRes, productosRes] = await Promise.all([
      http.get<Proveedor[]>('proveedores'),
      http.get<Producto[]>('productos'),
    ])
    proveedores.value = proveedoresRes.data
    productos.value = productosRes.data
  } catch (error) {
    console.error('Error cargando proveedores o productos:', error)
  }
})

watch(
  () => props.compra,
  (newVal) => {
    localCompra.value = { ...(newVal as Compra) }
    // Al editar, cargamos los detalles existentes. Al crear, iniciamos vacío.
    detallesCompra.value = newVal?.detalles
      ? newVal.detalles.map((d) => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precioUnitarioCompra: d.precioUnitarioCompra,
        }))
      : []
    // Buscar el proveedor seleccionado en la lista
    if (newVal?.idProveedor) {
      proveedorSeleccionado.value =
        proveedores.value.find((p) => p.id === newVal.idProveedor) || null
    }
  },
  { immediate: true },
)

// Lógica de Detalles
function agregarDetalle() {
  // Validación básica: Producto y precio deben ser válidos
  if (nuevoDetalleItem.value.idProducto > 0 && nuevoDetalleItem.value.cantidad > 0) {
    detallesCompra.value.push({ ...nuevoDetalleItem.value })
    // Resetear el formulario del detalle
    nuevoDetalleItem.value = { idProducto: 0, cantidad: 1, precioUnitarioCompra: 0 }
    productoSeleccionado.value = null
  } else {
    alert('Por favor, selecciona un producto y especifica la cantidad.')
  }
}

function eliminarDetalle(index: number) {
  detallesCompra.value.splice(index, 1)
}

// Actualizar idProveedor cuando se selecciona un proveedor
watch(proveedorSeleccionado, (newVal) => {
  if (newVal) {
    localCompra.value.idProveedor = newVal.id
  }
})

// Actualizar idProducto cuando se selecciona un producto
watch(productoSeleccionado, (newVal) => {
  if (newVal) {
    nuevoDetalleItem.value.idProducto = newVal.id
  }
})

// Calcular Total de la compra a partir de los detalles
const totalCalculado = computed(() => {
  return detallesCompra.value
    .reduce((sum, detalle) => {
      return sum + detalle.cantidad * detalle.precioUnitarioCompra
    }, 0)
    .toFixed(2)
})

// *************** Lógica de Guardado ***************
async function handleSave() {
  try {
    if (detallesCompra.value.length === 0 && !props.modoEdicion) {
      alert('Debe agregar al menos un producto al detalle de la compra.')
      return
    }

    const fechaToSend =
      localCompra.value.fechaCompra instanceof Date
        ? localCompra.value.fechaCompra.toISOString().slice(0, 10)
        : localCompra.value.fechaCompra

    // Crear el DTO completo para el backend
    const body: CreateCompraDto = {
      idProveedor: localCompra.value.idProveedor,
      idUsuario: localCompra.value.idUsuario || getUserId(),
      fechaCompra: fechaToSend,
      numeroFactura: localCompra.value.numeroFactura || '',
      fechaRecepcion:
        localCompra.value.fechaRecepcion instanceof Date
          ? localCompra.value.fechaRecepcion.toISOString().slice(0, 10)
          : localCompra.value.fechaRecepcion || '',
      detalles: detallesCompra.value, // CRÍTICO: Enviar los detalles
    }

    if (props.modoEdicion) {
      // La edición de compras es más compleja, solo se permite editar la cabecera (fecha, proveedor)
      // No se recomienda cambiar detalles de compra ya que impacta el stock y el costo promedio.
      await http.patch(`${ENDPOINT}/${localCompra.value.id}`, {
        fechaCompra: body.fechaCompra,
        numeroFactura: body.numeroFactura,
        fechaRecepcion: body.fechaRecepcion,
        idProveedor: body.idProveedor,
        idUsuario: body.idUsuario,
      })
    } else {
      // Creación con detalles
      // Debug: imprimir payload antes de enviar
      console.log('Compra POST body:', body)
      await http.post(ENDPOINT, body)
    }

    // ... (lógica de emitir, resetear y cerrar) ...
    emit('guardar')
    // Resetear todos los estados
    localCompra.value = {} as Compra
    detallesCompra.value = []
    nuevoDetalleItem.value = { idProducto: 0, cantidad: 1, precioUnitarioCompra: 0 }
    dialogVisible.value = false
  } catch (error) {
    let msg = 'Ocurrió un error'
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>
      const response = e['response'] as Record<string, unknown> | undefined
      const data = response?.['data'] as Record<string, unknown> | undefined
      const message = data?.['message']
      if (typeof message === 'string') msg = message
      else if (typeof e['message'] === 'string') msg = e['message'] as string
      else {
        try {
          msg = JSON.stringify(e)
        } catch {
          msg = 'Ocurrió un error'
        }
      }
    } else {
      msg = String(error)
    }
    alert(msg)
  }
}
</script>

<template>
  <div class="card d-flex justify-content-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Compra (Solo Cabecera)' : 'Registrar Nueva Compra'"
      :style="{ width: '90vw', maxWidth: '50rem' }"
      :modal="true"
    >
      <div class="container-fluid">
        <div class="row mb-3">
          <div class="col-12 col-md-6 mb-3">
            <label for="fechaCompra" class="form-label fw-bold">Fecha Compra</label>
            <input
              id="fechaCompra"
              name="fechaCompra"
              :value="
                typeof localCompra.fechaCompra === 'string'
                  ? localCompra.fechaCompra
                  : localCompra.fechaCompra instanceof Date
                    ? localCompra.fechaCompra.toISOString().slice(0, 10)
                    : ''
              "
              type="date"
              @input="
                (e) => {
                  const target = e.target as HTMLInputElement
                  localCompra.fechaCompra = target.value
                }
              "
              class="form-control"
            />
          </div>

          <div class="col-12 col-md-6 mb-3">
            <label for="numeroFactura" class="form-label fw-bold">Número Factura</label>
            <input
              id="numeroFactura"
              name="numeroFactura"
              :value="localCompra.numeroFactura || ''"
              type="text"
              @input="
                (e) => {
                  const target = e.target as HTMLInputElement
                  localCompra.numeroFactura = target.value
                }
              "
              placeholder="Ingrese número de factura"
              class="form-control"
            />
          </div>

          <div class="col-12 col-md-6 mb-3">
            <label for="fechaRecepcion" class="form-label fw-bold">Fecha Recepción</label>
            <input
              id="fechaRecepcion"
              name="fechaRecepcion"
              :value="
                typeof localCompra.fechaRecepcion === 'string'
                  ? localCompra.fechaRecepcion
                  : localCompra.fechaRecepcion instanceof Date
                    ? localCompra.fechaRecepcion.toISOString().slice(0, 10)
                    : ''
              "
              type="date"
              @input="
                (e) => {
                  const target = e.target as HTMLInputElement
                  localCompra.fechaRecepcion = target.value
                }
              "
              class="form-control"
            />
          </div>

          <div class="col-12 col-md-6 mb-3">
            <label for="proveedor" class="form-label fw-bold">Proveedor</label>
            <Dropdown
              id="proveedor"
              name="proveedor"
              v-model="proveedorSeleccionado"
              :options="proveedores"
              optionLabel="nombreEmpresa"
              placeholder="Selecciona un proveedor"
              :disabled="props.modoEdicion"
              filter
              class="w-100"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  <div>{{ slotProps.value.nombreEmpresa }}</div>
                  <small>{{ slotProps.value.responsable }}</small>
                </div>
              </template>
              <template #option="slotProps">
                <div>
                  <div>
                    <strong>{{ slotProps.option.nombreEmpresa }}</strong>
                  </div>
                  <small>Responsable: {{ slotProps.option.responsable }}</small>
                </div>
              </template>
            </Dropdown>
          </div>

          <div class="col-12 col-md-6 mb-3">
            <label for="usuario" class="form-label fw-bold">Usuario</label>
            <input
              id="usuario"
              name="usuario"
              :value="getUserDisplay()"
              type="text"
              class="form-control"
              readonly
            />
          </div>

          <div class="col-12 col-md-6 mb-3">
            <label for="total" class="form-label fw-bold">Total Calculado</label>
            <InputNumber
              id="total"
              :modelValue="Number(totalCalculado)"
              mode="currency"
              currency="BOB"
              locale="es-BO"
              readonly
              class="form-control"
            />
          </div>
        </div>
      </div>

      <h4 class="mt-4">Detalles de la Compra</h4>
      <div class="border rounded p-3 mb-4">
        <div class="row items-center justify-content-between">
          <div class="col-12 col-md-5 mb-3">
            <label for="producto" class="form-label font-semibold">Producto</label>
            <Dropdown
              id="producto"
              name="producto"
              v-model="productoSeleccionado"
              :options="productos"
              optionLabel="nombre"
              placeholder="Selecciona un producto"
              :disabled="props.modoEdicion"
              filter
              class="w-full"
            />
          </div>

          <div class="col-6 col-md-2 mb-3">
            <label for="cantidad" class="form-label font-semibold">Cantidad</label>
            <InputNumber
              id="cantidad"
              name="cantidad"
              v-model="nuevoDetalleItem.cantidad"
              class="w-full"
              :min="1"
              :showButtons="true"
              :disabled="props.modoEdicion"
            />
          </div>

          <div class="col-6 col-md-3 mb-3">
            <label for="precioUnitarioCompra" class="form-label font-semibold"
              >Costo Unitario</label
            >
            <InputNumber
              id="precioUnitarioCompra"
              name="precioUnitarioCompra"
              v-model="nuevoDetalleItem.precioUnitarioCompra"
              mode="currency"
              currency="BOB"
              locale="es-BO"
              class="w-full"
              :min="0"
              :showButtons="true"
              :disabled="props.modoEdicion"
              :step="1"
            />
          </div>

          <div class="col-12 col-md-2 d-flex align-items-end mb-3">
            <Button
              icon="pi pi-plus"
              label="Agregar"
              @click="agregarDetalle"
              class="w-full h-auto"
              :disabled="props.modoEdicion"
            />
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped w-100">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Costo Unitario</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detalle, index) in detallesCompra" :key="index">
              <td>{{ detalle.idProducto }}</td>
              <td>{{ detalle.cantidad }}</td>
              <td>{{ detalle.precioUnitarioCompra }}</td>
              <td>{{ (detalle.cantidad * detalle.precioUnitarioCompra).toFixed(2) }}</td>
              <td>
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  @click="eliminarDetalle(index)"
                  :disabled="props.modoEdicion"
                />
              </td>
            </tr>
            <tr v-if="detallesCompra.length === 0">
              <td colspan="5" class="text-center">No hay productos en esta compra.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="mt-4 text-end">Total Compra: {{ totalCalculado }} BOB</h3>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          class="btn btn-secondary"
          @click="dialogVisible = false"
        ></Button>
        <Button
          type="button"
          :label="props.modoEdicion ? 'Actualizar Cabecera' : 'Registrar Compra'"
          icon="pi pi-save"
          class="btn btn-primary"
          @click="handleSave"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>
