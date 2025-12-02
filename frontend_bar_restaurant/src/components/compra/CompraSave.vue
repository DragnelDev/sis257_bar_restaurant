<script setup lang="ts">
import type { Compra, CreateCompraDto, DetalleCompra } from '@/models/compra'
import type { Proveedor } from '@/models/Proveedor'
import type { Producto } from '@/models/producto'

import http from '@/plugins/axios'
import { ref, computed, onMounted, watch } from 'vue'
import { Button, Dialog, InputNumber, Dropdown, Panel, InputText, Calendar } from 'primevue'
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

// Fecha recepción: permitir fechas desde hace hasta 70 días atrás hasta hoy
const MS_PER_DAY = 24 * 60 * 60 * 1000
const minFechaRecepcion = new Date()
const maxFechaRecepcion = new Date(Date.now() + 70 * MS_PER_DAY)
const minFechaRecepcionStr = minFechaRecepcion.toISOString().slice(0, 10)
const maxFechaRecepcionStr = maxFechaRecepcion.toISOString().slice(0, 10)

// Asegurar que la fecha inicial está dentro del rango
if (localCompra.value.fechaRecepcion > maxFechaRecepcionStr) {
  localCompra.value.fechaRecepcion = maxFechaRecepcionStr
}
if (localCompra.value.fechaRecepcion < minFechaRecepcionStr) {
  localCompra.value.fechaRecepcion = minFechaRecepcionStr
}

// Fecha como Date para el componente Calendar
const fechaRecepcionDate = ref<Date | null>(
  localCompra.value.fechaRecepcion ? new Date(localCompra.value.fechaRecepcion) : null,
)

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

// Vigilar cambios en fechaRecepcion y ajustarlos al rango permitido
watch(
  () => localCompra.value.fechaRecepcion,
  (val) => {
    if (!val) return
    if (val > maxFechaRecepcionStr) {
      localCompra.value.fechaRecepcion = maxFechaRecepcionStr
    }
    if (val < minFechaRecepcionStr) {
      localCompra.value.fechaRecepcion = minFechaRecepcionStr
    }
  },
)

// Sincronizar Date <-> ISO string
watch(
  fechaRecepcionDate,
  (d) => {
    if (!d) {
      localCompra.value.fechaRecepcion = ''
      return
    }
    const iso = d.toISOString().slice(0, 10)
    localCompra.value.fechaRecepcion = iso
  },
)

watch(
  () => localCompra.value.fechaRecepcion,
  (val) => {
    if (!val) {
      fechaRecepcionDate.value = null
      return
    }
    const nd = new Date(val)
    // evitar recrear el mismo objeto si es igual
    if (!fechaRecepcionDate.value || fechaRecepcionDate.value.toISOString().slice(0, 10) !== nd.toISOString().slice(0, 10)) {
      fechaRecepcionDate.value = nd
    }
  },
)

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
    style="width: 100%; max-width: 900px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
    @hide="emit('close')"
  >
    <div class="form-container">
      <!-- Row 1: Número Factura y Fecha Recepción -->
      <div class="form-row">
        <div class="form-field">
          <label for="numeroFactura" class="form-label">Número Factura</label>
          <InputText
            id="numeroFactura"
            v-model="localCompra.numeroFactura"
            class="w-full form-input"
            placeholder="Ingrese número de factura"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="fechaRecepcion" class="form-label">Fecha Recepción</label>
          <Calendar
            id="fechaRecepcion"
            v-model="fechaRecepcionDate"
            class="w-full"
            :show-icon="true"
            date-format="dd/mm/yy"
            :min-date="minFechaRecepcion"
            :max-date="maxFechaRecepcion"
          />
        </div>
      </div>

      <!-- Row 2: Proveedor y Total -->
      <div class="form-row">
        <div class="form-field">
          <label for="proveedorSel" class="form-label">Proveedor</label>
          <Dropdown
            id="proveedorSel"
            v-model="proveedorSeleccionado"
            :options="proveedores"
            optionLabel="nombreEmpresa"
            placeholder="Seleccione proveedor"
            class="w-full"
            filter
          />
        </div>
        <div class="form-field">
          <label for="total" class="form-label">Total</label>
          <InputNumber
            id="total"
            :modelValue="Number(totalCalculado)"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            readonly
            class="w-full"
          />
        </div>
      </div>

      <!-- Sección de Productos -->
      <div class="form-field">
        <label class="form-label">Añadir Productos</label>
        <div class="product-section">
          <div class="product-inputs">
            <div class="product-field">
              <label for="productoSel" class="input-label">Producto</label>
              <Dropdown
                id="productoSel"
                v-model="productoSeleccionado"
                :options="productos"
                optionLabel="nombre"
                placeholder="Selecciona un producto"
                filter
                class="w-full"
              />
            </div>
            <div class="product-field">
              <label for="cantidad" class="input-label">Cantidad</label>
              <InputNumber
                id="cantidad"
                v-model="nuevoDetalleItem.cantidad"
                :min="1"
                class="w-full"
              />
            </div>
            <div class="product-field">
              <label for="precioUnitario" class="input-label">Precio Unit.</label>
              <InputNumber
                id="precioUnitario"
                v-model="nuevoDetalleItem.precioUnitario"
                :min="0"
                :step="0.01"
                mode="currency"
                currency="BOB"
                locale="es-BO"
                class="w-full"
              />
            </div>
            <Button
              icon="pi pi-plus"
              class="btn-add-product"
              @click="agregarDetalle"
              title="Añadir producto"
            />
          </div>

          <!-- Tabla de detalles -->
          <table v-if="detallesCompra.length > 0" class="details-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Costo Unit.</th>
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
                  <Button
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    class="btn-delete"
                    @click="eliminarDetalle(index)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          class="btn-cancel"
          @click="cerrarDialogo"
        />
        <Button
          type="button"
          label="Registrar"
          class="btn-save"
          @click="handleSave"
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

/* Product Section */
.product-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}

.product-inputs {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 8px;
  align-items: flex-end;
}

@media (max-width: 600px) {
  .product-inputs {
    grid-template-columns: 1fr;
  }
}

.product-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333333;
}

.btn-add-product {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  min-height: 40px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.25) !important;
}

.btn-add-product:hover:not(:disabled) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(255, 64, 129, 0.35) !important;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 0.9rem;
}

.details-table thead {
  background-color: #f0f2f5;
  border-bottom: 2px solid #d1d9df;
}

.details-table th {
  padding: 12px 8px;
  text-align: left;
  color: #333333;
  font-weight: 600;
  font-size: 0.85rem;
}

.details-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e1e8ed;
  color: #333333;
}

.details-table tbody tr:hover {
  background-color: #f8f9fa;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.btn-delete {
  color: #e74c3c !important;
  padding: 0.25rem 0.5rem !important;
}

.btn-delete:hover {
  background-color: rgba(231, 76, 60, 0.1) !important;
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

/* PrimeVue Calendar Light Mode (copiado desde EmpleadoSave) */
:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-calendar .p-calendar-w-btn) {
  width: 100%;
  display: flex;
  flex-direction: row;
}

:deep(.p-calendar .p-calendar-w-btn .p-inputtext) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  border-radius: 6px 0 0 6px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  flex: 1;
}

:deep(.p-calendar .p-calendar-w-btn .p-inputtext:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
  outline: none !important;
}

:deep(.p-calendar .p-icon-button) {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: #ffffff !important;
  border: 2px solid #ff4081 !important;
  border-radius: 0 6px 6px 0 !important;
  width: auto !important;
  height: auto !important;
  min-width: 55px !important;
  padding: 0.8rem 1.2rem !important;
  font-size: 1.4rem !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
  position: relative !important;
}

:deep(.p-calendar .p-icon-button i) {
  font-size: 1.4rem !important;
  color: #ffffff !important;
  display: inline-block !important;
  position: relative !important;
  z-index: 2 !important;
}

:deep(.p-calendar .p-icon-button span) {
  color: #ffffff !important;
  font-size: 1.4rem !important;
}

:deep(.p-calendar .p-icon-button svg) {
  fill: #ffffff !important;
  stroke: #ffffff !important;
}

:deep(.p-calendar .p-icon-button:hover) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.3) !important;
  transform: translateY(-2px) !important;
}

:deep(.p-calendar .p-icon-button:active) {
  transform: translateY(0) !important;
}

:deep(.p-calendar .p-icon-button::before) {
  color: #ffffff !important;
}

:deep(.p-calendar .p-icon-button::after) {
  color: #ffffff !important;
}

:deep(.p-datepicker) {
  background-color: #ffffff !important;
  border: 2px solid #d1d9df !important;
  border-radius: 8px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
  padding: 16px !important;
}

:deep(.p-datepicker-header) {
  background-color: #ffffff !important;
  border-bottom: 2px solid #e1e8ed !important;
  padding: 12px 0 !important;
  margin-bottom: 12px !important;
}

:deep(.p-datepicker-header .p-datepicker-title) {
  color: #333333 !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
}

:deep(.p-datepicker-header button) {
  color: #ff4081 !important;
  background: transparent !important;
  border: none !important;
  font-size: 1.1rem !important;
  cursor: pointer !important;
}

:deep(.p-datepicker-header button:hover) {
  background: rgba(255, 64, 129, 0.1) !important;
  border-radius: 4px !important;
}

:deep(.p-datepicker-calendar) {
  padding: 0 !important;
}

:deep(.p-datepicker-calendar table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.p-datepicker-weekheader) {
  padding: 8px 0 !important;
}

:deep(.p-datepicker-weekheader > div) {
  color: #666666 !important;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  padding: 4px 0 !important;
  text-align: center !important;
}

:deep(.p-datepicker-calendar td) {
  padding: 2px !important;
  text-align: center !important;
}

:deep(.p-datepicker-calendar td > span) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  background-color: #f8f9fa !important;
  color: #333333 !important;
  border-radius: 4px !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

:deep(.p-datepicker-calendar td > span:hover) {
  background-color: #e8eaed !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
}

:deep(.p-datepicker-calendar .p-highlighted) {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: white !important;
  font-weight: 700 !important;
}

:deep(.p-datepicker-calendar .p-highlighted:hover) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
}

:deep(.p-datepicker-calendar .p-datepicker-other-month > span) {
  color: #b0b6bc !important;
  background-color: transparent !important;
}

:deep(.p-datepicker-calendar .p-disabled) {
  color: #d1d9df !important;
  background-color: #f5f5f5 !important;
  cursor: not-allowed !important;
}

:deep(.p-datepicker-calendar .p-disabled:hover) {
  background-color: #f5f5f5 !important;
}
</style>
