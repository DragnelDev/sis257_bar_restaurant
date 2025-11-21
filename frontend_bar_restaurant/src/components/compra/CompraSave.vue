<script setup lang="ts">
import type { Compra, CreateCompraDto, CreateDetalleCompraDto } from '@/models/compra'
import type { Proveedor } from '@/models/Proveedor'
import type { Producto } from '@/models/producto'

import { useAuthStore } from '@/stores'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Dropdown, Panel } from 'primevue'
import { useToast } from 'primevue/usetoast'

import { computed, ref, watch, onMounted } from 'vue'

const ENDPOINT = 'compras'
const authStore = useAuthStore()
const toast = useToast()

function getUserId(): number {
  const u: any = authStore.user
  if (!u) return 1

  if (typeof u === 'number') return u

  if (typeof u === 'string') {
    const numeric = parseInt(u)
    if (!isNaN(numeric)) return numeric

    try {
      const json = JSON.parse(u)
      return json?.id || 1
    } catch {}
    return 1
  }

  if (typeof u === 'object') {
    return u.id || 1
  }

  return 1
}

function getUserDisplay(): string {
  const u: any = authStore.user
  if (!u) return ''

  if (typeof u === 'string') {
    try {
      return JSON.parse(u)?.usuario || u
    } catch {}
    return u
  }

  if (typeof u === 'object') return u.usuario || String(u.id)

  return String(u)
}

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

const localCompra = ref<Compra>({ ...(props.compra as Compra) })
const detallesCompra = ref<CreateDetalleCompraDto[]>([])
const nuevoDetalleItem = ref<CreateDetalleCompraDto>({
  idProducto: 0,
  cantidad: 1,
  precioUnitarioCompra: 0,
})

const proveedores = ref<Proveedor[]>([])
const productos = ref<Producto[]>([])

const proveedorSeleccionado = ref<Proveedor | null>(null)
const productoSeleccionado = ref<Producto | null>(null)


onMounted(async () => {
  try {
    const [resProv, resProd] = await Promise.all([
      http.get<Proveedor[]>('proveedores'),
      http.get<Producto[]>('productos'),
    ])

    proveedores.value = resProv.data
    productos.value = resProd.data

    if (props.modoEdicion && localCompra.value.idProveedor) {
      proveedorSeleccionado.value =
        proveedores.value.find((p) => p.id === localCompra.value.idProveedor) || null
    }
  } catch (e) {
    console.error('Error cargando proveedores/productos', e)
  }
})

watch(
  () => props.mostrar,
  (visible) => {
    if (!visible) return

    if (!props.modoEdicion) {
      if (!localCompra.value.fechaCompra) {
        localCompra.value.fechaCompra = new Date().toISOString().slice(0, 10)
      }

      if (!proveedorSeleccionado.value && proveedores.value.length > 0) {
        proveedorSeleccionado.value = proveedores.value[0]
      }
    }
  },
)

watch(
  () => props.compra,
  (newVal) => {
    localCompra.value = { ...(newVal as Compra) }

    detallesCompra.value = newVal?.detalles
      ? newVal.detalles.map((d) => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precioUnitarioCompra: d.precioUnitarioCompra,
        }))
      : []

    if (newVal?.idProveedor) {
      proveedorSeleccionado.value =
        proveedores.value.find((p) => p.id === newVal.idProveedor) || null
    }
  },
  { immediate: true },
)

watch(proveedorSeleccionado, (n) => {
  if (n) localCompra.value.idProveedor = n.id
})

watch(productoSeleccionado, (n) => {
  if (n) nuevoDetalleItem.value.idProducto = n.id
})

function agregarDetalle() {
  if (!nuevoDetalleItem.value.idProducto || nuevoDetalleItem.value.cantidad <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Seleccione un producto y cantidad válida.',
    })
    return
  }

  const idx = detallesCompra.value.findIndex(
    (d) => d.idProducto === nuevoDetalleItem.value.idProducto,
  )

  if (idx !== -1) {
    detallesCompra.value[idx].cantidad += nuevoDetalleItem.value.cantidad

    toast.add({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Cantidad sumada al producto.',
    })
  } else {
    detallesCompra.value.push({ ...nuevoDetalleItem.value })

    toast.add({
      severity: 'success',
      summary: 'Agregado',
      detail: 'Producto añadido al detalle.',
    })
  }

  nuevoDetalleItem.value = { idProducto: 0, cantidad: 1, precioUnitarioCompra: 0 }
  productoSeleccionado.value = null
}

function eliminarDetalle(index: number) {
  detallesCompra.value.splice(index, 1)
}

const totalCalculado = computed(() =>
  detallesCompra.value.reduce((sum, d) => sum + d.cantidad * d.precioUnitarioCompra, 0).toFixed(2),
)

async function handleSave() {
  try {
    if (!localCompra.value.idProveedor) {
      toast.add({
        severity: 'warn',
        summary: 'Proveedor requerido',
        detail: 'Seleccione un proveedor.',
      })
      return
    }

    if (!props.modoEdicion && detallesCompra.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Detalle vacío',
        detail: 'Agregue al menos un producto.',
      })
      return
    }

    const fechaCompra =
      localCompra.value.fechaCompra instanceof Date
        ? localCompra.value.fechaCompra.toISOString().slice(0, 10)
        : localCompra.value.fechaCompra

    const fechaRecepcion =
      localCompra.value.fechaRecepcion instanceof Date
        ? localCompra.value.fechaRecepcion.toISOString().slice(0, 10)
        : localCompra.value.fechaRecepcion

    const body: CreateCompraDto = {
      idProveedor: localCompra.value.idProveedor,
      idUsuario: getUserId(),
      fechaCompra,
      numeroFactura: localCompra.value.numeroFactura || '',
      fechaRecepcion: fechaRecepcion || '',
      detalles: detallesCompra.value,
    }

    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${localCompra.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    toast.add({
      severity: 'success',
      summary: props.modoEdicion ? 'Actualizado' : 'Registrado',
      detail: props.modoEdicion ? 'Compra actualizada.' : 'Compra registrada.',
    })

    emit('guardar')
    dialogVisible.value = false

    localCompra.value = {} as Compra
    detallesCompra.value = []
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || 'Error al guardar la compra.'

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: msg,
      life: 6000,
    })
  }
}
</script>

<template>
  <div class="card d-flex justify-content-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Compra' : 'Registrar Compra'"
      :style="{ width: '90vw', maxWidth: '55rem' }"
      modal
      class="compra-dialog p-fluid"
    >
      <div class="grid p-fluid form-layout">
        <div class="col-12 md:col-6">
          <label class="block font-medium mb-2">Número Factura</label>
          <InputText v-model="localCompra.numeroFactura" placeholder="Ingrese número de factura" />
        </div>

        <div class="col-12 md:col-6">
          <label class="block font-medium mb-2">Fecha Recepción</label>
          <input
            type="date"
            class="p-inputtext p-component w-full"
            :value="localCompra.fechaRecepcion"
            @input="localCompra.fechaRecepcion = $event.target.value"
          />
        </div>

        <div class="col-12 md:col-6">
          <label class="block font-medium mb-2">Proveedor</label>
          <Dropdown
            v-model="proveedorSeleccionado"
            :options="proveedores"
            optionLabel="nombreEmpresa"
            placeholder="Proveedor"
            class="w-full"
            filter
          />
        </div>

        <div class="col-12 md:col-6">
          <label class="block font-medium mb-2">Total</label>
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

      <h4 class="mt-4">Detalles de la Compra</h4>

      <Panel header="Añadir Producto" class="mb-4">
        <div class="grid p-fluid">
          <div class="col-12 md:col-5">
            <label class="block font-medium mb-2">Producto</label>
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
            <label class="block font-medium mb-2">Cantidad</label>
            <InputNumber
              v-model="nuevoDetalleItem.cantidad"
              :min="1"
              :showButtons="true"
              class="w-full"
            />
          </div>

          <div class="col-6 md:col-3">
            <label class="block font-medium mb-2">Precio Unitario</label>
            <InputNumber
              v-model="nuevoDetalleItem.precioUnitarioCompra"
              mode="currency"
              currency="BOB"
              locale="es-BO"
              :min="0"
              :step="0.01"
              class="w-full"
            />
          </div>

          <div class="col-12 md:col-2 flex align-items-end">
            <Button
              icon="pi pi-plus"
              label="Agregar"
              class="w-full p-button-sm"
              @click="agregarDetalle"
            />
          </div>
        </div>
      </Panel>

      <div class="card p-0 overflow-auto">
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
              <td>
                {{ productos.find((p) => p.id === detalle.idProducto)?.nombre }}
              </td>
              <td class="text-right">{{ detalle.cantidad }}</td>
              <td class="text-right">
                {{ detalle.precioUnitarioCompra.toFixed(2) }}
              </td>
              <td class="text-right">
                {{ (detalle.cantidad * detalle.precioUnitarioCompra).toFixed(2) }}
              </td>
              <td class="text-center">
                <Button icon="pi pi-trash" text severity="danger" @click="eliminarDetalle(index)" />
              </td>
            </tr>

            <tr v-if="detallesCompra.length === 0">
              <td colspan="5" class="text-center p-3 text-color-secondary">
                No hay productos en esta compra.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-content-end mt-4">
        <h3 class="font-bold text-xl">Total Compra: {{ totalCalculado }} BOB</h3>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="dialogVisible = false"
          ></Button>

          <Button
            :label="props.modoEdicion ? 'Actualizar' : 'Registrar'"
            icon="pi pi-save"
            @click="handleSave"
          ></Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.form-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.compra-details-table {
  border-collapse: collapse;
  width: 100%;
}

.compra-details-table th,
.compra-details-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}

.compra-details-table th {
  background: var(--surface-ground);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
}

@media screen and (max-width: 576px) {
  .compra-dialog {
    width: 100vw !important;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
