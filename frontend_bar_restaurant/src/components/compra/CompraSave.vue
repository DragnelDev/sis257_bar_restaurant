<script setup lang="ts">
import type { Compra, CreateCompraDto, DetalleCompra } from '@/models/compra'
import type { Proveedor } from '@/models/Proveedor'
import type { Producto } from '@/models/producto'

import http from '@/plugins/axios'
import { ref, computed, onMounted, watch } from 'vue'
import { Button, Dialog, InputNumber, Dropdown, Panel, InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores'

// Eventos que se emitirán al padre
const emit = defineEmits(['guardar', 'close'])

// Props
const props = defineProps<{
  mostrar: boolean
}>()

// Control desde el padre
const dialogVisible = ref(props.mostrar)
watch(
  () => props.mostrar,
  (value) => (dialogVisible.value = value),
)

// Store y toast
const authStore = useAuthStore()
const toast = useToast()

// Datos compra
const localCompra = ref<Compra>({
  idProveedor: 0,
  idUsuario: 0,
  numeroFactura: '',
  fechaRecepcion: new Date().toISOString().slice(0, 10),
})

const detallesCompra = ref<DetalleCompra[]>([])

// Proveedores y productos
const proveedores = ref<Proveedor[]>([])
const productos = ref<Producto[]>([])
const proveedorSeleccionado = ref<Proveedor | null>(null)
const productoSeleccionado = ref<Producto | null>(null)

// Detalle temporal
const nuevoDetalleItem = ref<DetalleCompra>({
  idProducto: 0,
  cantidad: 1,
  precioUnitario: 0,
})

// Total
const totalCalculado = computed(() =>
  detallesCompra.value
    .reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0)
    .toFixed(2),
)

// Obtener usuario logueado
function getUserId(): number {
  const u: any = authStore.user
  if (!u) return 1
  if (typeof u === 'number') return u
  if (typeof u === 'string') {
    const parsed = parseInt(u)
    if (!isNaN(parsed)) return parsed
    try {
      return JSON.parse(u)?.id || 1
    } catch {}
  }
  if (typeof u === 'object') return u.id || 1
  return 1
}

// Cargar proveedores y productos
onMounted(async () => {
  try {
    const [resProv, resProd] = await Promise.all([
      http.get<Proveedor[]>('proveedores'),
      http.get<Producto[]>('productos'),
    ])

    proveedores.value = resProv.data
    productos.value = resProd.data

    proveedorSeleccionado.value = proveedores.value[0] ?? null
    if (proveedorSeleccionado.value)
      localCompra.value.idProveedor = proveedorSeleccionado.value.id
  } catch (e) {
    console.error('Error cargando datos', e)
  }
})

// Sincronizar proveedor
watch(proveedorSeleccionado, (p) => {
  if (p) localCompra.value.idProveedor = p.id
})

// Sincronizar producto
watch(productoSeleccionado, (p) => {
  if (p) nuevoDetalleItem.value.idProducto = p.id
})

// Agregar detalle
function agregarDetalle() {
  if (!nuevoDetalleItem.value.idProducto) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Seleccione un producto.' })
    return
  }

  const index = detallesCompra.value.findIndex(
    (d) => d.idProducto === nuevoDetalleItem.value.idProducto,
  )

  if (index !== -1) {
    detallesCompra.value[index].cantidad += nuevoDetalleItem.value.cantidad
  } else {
    detallesCompra.value.push({ ...nuevoDetalleItem.value })
  }

  toast.add({ severity: 'success', summary: 'Agregado', detail: 'Producto añadido.' })

  nuevoDetalleItem.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 }
  productoSeleccionado.value = null
}

// Eliminar detalle
function eliminarDetalle(index: number) {
  detallesCompra.value.splice(index, 1)
}

// Guardar compra
async function handleSave() {
  if (!localCompra.value.idProveedor) {
    toast.add({ severity: 'warn', summary: 'Proveedor requerido', detail: 'Seleccione un proveedor.' })
    return
  }

  if (detallesCompra.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Detalle vacío', detail: 'Agregue al menos un producto.' })
    return
  }

  try {
    const body: CreateCompraDto = {
      idProveedor: localCompra.value.idProveedor,
      idUsuario: getUserId(),
      numeroFactura: localCompra.value.numeroFactura,
      fechaRecepcion: localCompra.value.fechaRecepcion,
      detalles: detallesCompra.value,
    }

    await http.post('compras', body)

    toast.add({ severity: 'success', summary: 'Registrado', detail: 'Compra creada.' })

    emit('guardar') // notifica al padre
    emit('close') // cierra modal en el padre

    cerrarDialogo()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.response?.data?.message || 'Error al registrar.',
    })
  }
}

function cerrarDialogo() {
  dialogVisible.value = false
  resetForm()
}

function resetForm() {
  localCompra.value = {
    idProveedor: 0,
    idUsuario: 0,
    numeroFactura: '',
    fechaRecepcion: new Date().toISOString().slice(0, 10),
  }
  detallesCompra.value = []
  proveedorSeleccionado.value = proveedores.value[0] ?? null
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    header="Registrar Compra"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '55rem' }"
    @hide="emit('close')"
  >
    <div class="grid p-fluid form-layout">
      <div class="col-12 md:col-6">
        <label>Número Factura</label>
        <InputText v-model="localCompra.numeroFactura" placeholder="Ingrese número de factura" />
      </div>

      <div class="col-12 md:col-6">
        <label>Fecha Recepción</label>
        <input type="date" v-model="localCompra.fechaRecepcion" class="p-inputtext w-full" />
      </div>

      <div class="col-12 md:col-6">
        <label>Proveedor</label>
        <Dropdown
          v-model="proveedorSeleccionado"
          :options="proveedores"
          optionLabel="nombreEmpresa"
          class="w-full"
          filter
        />
      </div>

      <div class="col-12 md:col-6">
        <label>Total</label>
        <InputNumber
          :modelValue="Number(totalCalculado)"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          readonly
          class="w-full"
        />
      </div>
    </div>

    <Panel header="Añadir Producto" class="mb-4 mt-3">
      <div class="grid p-fluid">
        <div class="col-12 md:col-5">
          <label>Producto</label>
          <Dropdown
            v-model="productoSeleccionado"
            :options="productos"
            optionLabel="nombre"
            placeholder="Selecciona un producto"
            filter
            class="w-full"
          />
        </div>

        <div class="col-6 md:col-2">
          <label>Cantidad</label>
          <InputNumber v-model="nuevoDetalleItem.cantidad" :min="1" class="w-full" />
        </div>

        <div class="col-6 md:col-3">
          <label>Precio Unitario</label>
          <InputNumber
            v-model="nuevoDetalleItem.precioUnitario"
            :min="0"
            :step="0.01"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            class="w-full"
          />
        </div>

        <div class="col-12 md:col-2 flex align-items-end">
          <Button label="Agregar" icon="pi pi-plus" class="w-full" @click="agregarDetalle" />
        </div>
      </div>
    </Panel>

    <table class="p-datatable-table w-full compra-details-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th class="text-right">Cantidad</th>
          <th class="text-right">Costo Unitario</th>
          <th class="text-right">Subtotal</th>
          <th class="text-center">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(detalle, index) in detallesCompra" :key="index">
          <td>{{ productos.find((p) => p.id === detalle.idProducto)?.nombre }}</td>
          <td class="text-right">{{ detalle.cantidad }}</td>
          <td class="text-right">{{ detalle.precioUnitario.toFixed(2) }}</td>
          <td class="text-right">
            {{ (detalle.cantidad * detalle.precioUnitario).toFixed(2) }}
          </td>
          <td class="text-center">
            <Button icon="pi pi-trash" text severity="danger" @click="eliminarDetalle(index)" />
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" outlined @click="cerrarDialogo" />
      <Button label="Registrar" icon="pi pi-save" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.form-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.compra-details-table th,
.compra-details-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}
</style>
