<script setup lang="ts">
import { Button, Dialog, Dropdown, InputNumber, InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref, watch } from 'vue'

import type { Compra, CreateDetalleCompraDto } from '@/models/compra'
import type { Producto } from '@/models/producto'
import type { Proveedor } from '@/models/Proveedor'

import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'

const ENDPOINT = 'compras'
const authStore = useAuthStore()
const toast = useToast()

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
const nuevoDetalle = ref<CreateDetalleCompraDto>({
  idProducto: 0,
  cantidad: 1,
  precioUnitario: 0,
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
      if (!localCompra.value.fechaCreacion) {
        localCompra.value.fechaCreacion = new Date().toISOString().slice(0, 10)
      }

      if (!proveedorSeleccionado.value && proveedores.value.length > 0) {
        const proveedor = proveedores.value[0]
        if (proveedor) {
          proveedorSeleccionado.value = proveedor
        }
      }
    }
  },
)

watch(
  () => props.compra,
  (newVal) => {
    localCompra.value = { ...(newVal as Compra) }

    // Soporta tanto `detallesCompra` (antiguo) como `detalles` (nuevo)
    const incomingDetalles = (newVal as any)?.detallesCompra || (newVal as any)?.detalles || []

    detallesCompra.value = incomingDetalles
      ? incomingDetalles.map((d: any) => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          // Normalizamos al campo `precioUnitario` que usa el formulario
          precioUnitario: d.precioUnitario ?? d.precioUnitarioCompra ?? 0,
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
  if (n) nuevoDetalle.value.idProducto = n.id
})

function agregarDetalle() {
  if (!nuevoDetalle.value.idProducto || nuevoDetalle.value.cantidad <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Seleccione un producto y cantidad válida.',
    })
    return
  }

  if (!detallesCompra.value) {
    detallesCompra.value = []
  }

  const idx = detallesCompra.value.findIndex(
    (d) => d.idProducto === nuevoDetalle.value.idProducto,
  )

  if (idx !== -1) {
    const existing = detallesCompra.value[idx]!
    if (existing) {
      existing.cantidad = (existing.cantidad ?? 0) + (nuevoDetalle.value.cantidad ?? 0)
    }

    toast.add({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Cantidad sumada al producto.',
    })
  } else {
    detallesCompra.value.push({ ...nuevoDetalle.value })

    toast.add({
      severity: 'success',
      summary: 'Agregado',
      detail: 'Producto añadido al detalle.',
    })
  }

  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 }
  productoSeleccionado.value = null
}

function eliminarDetalle(index: number) {
  detallesCompra.value.splice(index, 1)
}

const totalCalculado = computed(() => {
  const total = detallesCompra.value.reduce((sum: number, d: any) => {
    const precio = d.precioUnitario ?? d.precioUnitarioCompra ?? 0
    return sum + (d.cantidad || 0) * precio
  }, 0)

  return total.toFixed(2)
})

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


    // Solo los campos requeridos para el POST
    const body = {
      idProveedor: localCompra.value.idProveedor,
      idUsuario: getUserId(),
      numeroFactura: localCompra.value.numeroFactura || '',
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
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Compra' : 'Registrar Compra'"
    style="width: 100%; max-width: 650px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
  >
    <div class="form-container">
      <!-- Información de la Compra -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Número Factura</label>
          <InputText
            v-model="localCompra.numeroFactura"
            placeholder="Ingrese número de factura"
            class="form-input"
          />
        </div>

        <div class="form-field">
          <label class="form-label">Proveedor</label>
          <Dropdown
            v-model="proveedorSeleccionado"
            :options="proveedores"
            option-label="nombreEmpresa"
            placeholder="Seleccione proveedor"
            class="w-full"
            filter
            filterPlaceholder="Buscar proveedor"
          />
        </div>
      </div>

      <!-- Detalles de la Compra -->
      <div class="section-header">
        Detalles de la Compra
      </div>

      <!-- Agregar Producto -->
      <div class="form-panel">
        <div class="panel-header">Agregar Producto</div>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">Producto</label>
            <Dropdown
              v-model="productoSeleccionado"
              :options="productos"
              option-label="nombre"
              placeholder="Seleccione producto"
              class="w-full"
              filter
              filterPlaceholder="Buscar producto"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Cantidad</label>
            <InputNumber
              v-model="nuevoDetalle.cantidad"
              :min="1"
              show-buttons
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Precio Unitario</label>
            <InputNumber
              v-model="nuevoDetalle.precioUnitario"
              mode="currency"
              currency="BOB"
              locale="es-BO"
              :min="0"
              :step="0.01"
              class="w-full"
            />
          </div>

          <div class="form-field" style="align-self: flex-end">
            <Button
              label="Agregar"
              @click="agregarDetalle"
              class="btn-agregar"
            />
          </div>
        </div>
      </div>

      <!-- Tabla de detalles -->
      <div class="table-container">
        <table class="detalle-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Precio Unitario</th>
              <th class="text-right">Subtotal</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detalle, index) in detallesCompra" :key="index">
              <td>
                {{ productos.find(p => p.id === detalle.idProducto)?.nombre }}
              </td>
              <td class="text-right">{{ detalle.cantidad }}</td>
              <td class="text-right">
                {{ (detalle.precioUnitario ?? detalle.precioUnitario ?? 0).toFixed(2) }} BOB
              </td>
              <td class="text-right">
                {{ (detalle.cantidad * (detalle.precioUnitario ?? detalle.precioUnitario ?? 0)).toFixed(2) }} BOB
              </td>
              <td class="text-center">
                <Button
                  label="Eliminar"
                  @click="eliminarDetalle(index)"
                  class="btn-eliminar"
                />
              </td>
            </tr>

            <tr v-if="detallesCompra.length === 0">
              <td colspan="5" class="empty-table">
                No hay productos en esta compra
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total Compra -->
      <div class="total-section">
        <div class="total-card">
          <span class="total-label">TOTAL COMPRA:</span>
          <span class="total-valor">{{ totalCalculado }} BOB</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="form-actions">
        <Button
          label="Cancelar"
          class="btn-cancel"
          @click="dialogVisible = false"
        />
        <Button
          :label="props.modoEdicion ? 'Actualizar' : 'Registrar'"
          @click="handleSave"
          class="btn-save"
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
  color: #faf8f8;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Form Label */
.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #faf4f4;
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

/* PrimeVue InputNumber Light Mode */

/* PrimeVue InputNumber Light Mode Mejorado */
:deep(.p-inputnumber) {
  width: 100%;
  display: flex;
  align-items: center;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
  flex: 1 1 auto;
}

:deep(.p-inputnumber .p-inputnumber-input:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
}


:deep(.p-inputnumber-button) {
  background: #f8f9fa !important;
  border: 1px solid #d1d9df !important;
  width: 38px !important;
  height: 40px !important;
  color: #333333 !important;
  border-radius: 6px !important;
  margin-left: 2px;
  margin-right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 !important;
}

:deep(.p-inputnumber-button .pi) {
  font-size: 1.1rem !important;
}

.total.form-input {
  background: #f8f9fa !important;
  font-weight: 700 !important;
  color: #333333 !important;
}

/* Section Header */
.section-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333333;
  margin: 1rem 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 64, 129, 0.15);
}

/* Form Panel */
.form-panel {
  background-color: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.panel-header {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 1rem;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

.detalle-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detalle-table th {
  background-color: #f8f9fa;
  color: #333333;
  font-weight: 600;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #e1e8ed;
}

.detalle-table th.text-right {
  text-align: right;
}

.detalle-table th.text-center {
  text-align: center;
}

.detalle-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e1e8ed;
  color: #333333;
}

.detalle-table tr:hover {
  background-color: #f8f9fa;
}

.detalle-table .text-right {
  text-align: right;
}

.detalle-table .text-center {
  text-align: center;
}

.empty-table {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem !important;
}

/* Total Section */
.total-section {
  margin-top: 1.5rem;
}

.total-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
}

.total-label {
  font-weight: 700;
  font-size: 1rem;
}

.total-valor {
  font-weight: 800;
  font-size: 1.25rem;
}

/* Botones personalizados */
.btn-agregar {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%) !important;
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
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25) !important;
}

.btn-agregar:hover:not(:disabled) {
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.35) !important;
}

.btn-eliminar {
  background: linear-gradient(135deg, #f44336 0%, #c62828 100%) !important;
  color: white !important;
  border: none !important;
  padding: 0.5rem 1rem !important;
  border-radius: 4px !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.btn-eliminar:hover {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%) !important;
  transform: scale(1.05);
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
</style>
