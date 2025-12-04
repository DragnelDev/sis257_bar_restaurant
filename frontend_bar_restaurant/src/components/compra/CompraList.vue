<script setup lang="ts">
import type { DetalleCompra } from '@/models/DetalleCompra'
import http from '@/plugins/axios'
import { ref, onMounted, computed, watch } from 'vue'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'

const ENDPOINT = 'detalle-compras/detailed-list'

const detallesCompra = ref<DetalleCompra[]>([])
const loading = ref(false)
const error = ref<string>('')
const busqueda = ref<string>('')

const mostrarDialogDetalle = ref(false)
const detalleSeleccionado = ref<DetalleCompra | null>(null)
const toast = useToast()

// Fecha dd/mm/yyyy
function formatFecha(f: any): string {
  if (!f) return ''
  const d = typeof f === 'string' ? new Date(f) : f
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Paginación
const pagina = ref<number>(1)
const paginaSize = ref<number>(10)

const detallesFiltrados = computed(() => {
  const searchTerm = busqueda.value.toLowerCase()
  return detallesCompra.value.filter((det) => {
    const prov = det.compra?.proveedor?.nombreEmpresa?.toLowerCase() ?? ''
    const prod = det.producto?.nombre?.toLowerCase() ?? ''
    const factura = det.compra?.numeroFactura?.toLowerCase() ?? ''
    return prov.includes(searchTerm) || prod.includes(searchTerm) || factura.includes(searchTerm)
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(detallesFiltrados.value.length / paginaSize.value)),
)

const paginas = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

const paginatedDetalles = computed(() => {
  const start = (pagina.value - 1) * paginaSize.value
  return detallesFiltrados.value.slice(start, start + paginaSize.value)
})

// Reset page when search changes
watch(busqueda, () => (pagina.value = 1))
watch(paginaSize, () => (pagina.value = 1))

async function obtenerLista() {
  loading.value = true
  error.value = ''
  try {
    const response = await http.get(ENDPOINT)
    detallesCompra.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Error al obtener detalles de compra:', err)
    error.value = err instanceof Error ? err.message : 'Error al cargar los detalles de compra'
    detallesCompra.value = []
    toast.add({ severity: 'error', summary: 'Error', detail: error.value })
  } finally {
    loading.value = false
  }
}

function verDetalle(detalle: DetalleCompra) {
  detalleSeleccionado.value = detalle
  mostrarDialogDetalle.value = true
}

function prevPage() {
  if (pagina.value > 1) pagina.value -= 1
}

function nextPage() {
  if (pagina.value < totalPages.value) pagina.value += 1
}

function goToPage(n: number) {
  if (n >= 1 && n <= totalPages.value) {
    pagina.value = n
  }
}

function changePageSize(n: number) {
  paginaSize.value = n
}

onMounted(() => {
  obtenerLista()
})

defineExpose({ obtenerLista })
</script>

<template>
  <div class="p-4 p-datatable-list">
    <h2 class="mb-4 text-xl font-semibold text-color-secondary">
      <i class="pi pi-shopping-cart mr-2"></i>Detalle de Compras
    </h2>

    <div class="flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div class="w-full sm:w-12rem md:w-18rem">
        <InputGroup>
          <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
          <InputText
            v-model="busqueda"
            type="text"
            placeholder="Buscar por proveedor, producto o factura"
            class="w-full"
          />
        </InputGroup>
      </div>
    </div>

    <div v-if="error" class="p-alert p-alert-danger mb-4">
      <i class="pi pi-exclamation-triangle mr-2"></i> {{ error }}
    </div>

    <div v-if="loading" class="p-4 bg-white border-round shadow-1 text-center text-primary">
      <i class="pi pi-spin pi-spinner mr-2 text-2xl"></i> Cargando detalles de compras...
    </div>

    <div v-if="!loading && !error" class="p-datatable p-component shadow-1 border-round">
      <div class="table-responsive">
        <table class="p-datatable-table">
          <thead class="bg-gray-900">
            <tr>
              <th style="width: 50px">Nro.</th>
              <th>Proveedor</th>
              <th>N° Factura</th>
              <th>Fecha Compra</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Costo Unit.</th>
              <th>SubTotal</th>
              <th>Usuario</th>
              <th style="width: 100px; text-align: center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(detalle, index) in paginatedDetalles"
              :key="detalle.id"
              class="p-datatable-row"
            >
              <td class="text-center">{{ (pagina - 1) * paginaSize + index + 1 }}</td>
              <td class="font-semibold text-900">{{ detalle.compra?.proveedor?.nombreEmpresa || 'N/A' }}</td>
              <td>
                <span class="p-tag p-tag-secondary">{{ detalle.compra?.numeroFactura || 'N/A' }}</span>
              </td>
              <td>{{ formatFecha(detalle.compra?.fechaCompra) }}</td>
              <td>
                <i class="pi pi-box mr-2 text-muted"></i>
                {{ detalle.producto?.nombre || 'N/A' }}
              </td>
              <td class="text-center">
                <span class="p-tag p-tag-info">{{ detalle.cantidad }}</span>
              </td>
              <td class="text-right">Bs. {{ Number(detalle.precioUnitario || 0).toFixed(2) }}</td>
              <td class="text-right font-semibold text-success">
                Bs. {{ Number(detalle.subTotal || 0).toFixed(2) }}
              </td>
              <td>
                <i class="pi pi-user mr-2 text-muted"></i>
                {{ detalle.compra?.usuario?.usuario || 'N/A' }}
              </td>
              <td class="text-center">
                <Button
                  icon="pi pi-eye"
                  aria-label="Ver Detalles"
                  rounded
                  class="p-button-sm btn-ver"
                  @click="verDetalle(detalle)"
                  v-tooltip.top="'Ver detalles'"
                />
              </td>
            </tr>
            <tr v-if="detallesFiltrados.length === 0">
              <td colspan="10" class="text-center p-3 text-muted">
                No se encontraron detalles de compras.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="detallesFiltrados.length > 0"
      class="mt-4 p-paginator p-component border-round shadow-1"
    >
      <div class="flex justify-content-between align-items-center p-3">
        <div class="p-paginator-summary text-sm">
          Mostrando {{ (pagina - 1) * paginaSize + 1 }} -
          {{ Math.min(pagina * paginaSize, detallesFiltrados.length) }} de
          {{ detallesFiltrados.length }} registros
        </div>

        <div class="d-flex align-items-center gap-2">
          <select
            v-model="paginaSize"
            class="p-dropdown p-inputtext p-component p-4"
            @change="changePageSize(paginaSize)"
          >
            <option :value="5">5 por pág.</option>
            <option :value="10">10 por pág.</option>
            <option :value="25">25 por pág.</option>
            <option :value="50">50 por pág.</option>
          </select>

          <Button
            icon="pi pi-angle-left"
            @click="prevPage"
            :disabled="pagina <= 1"
            aria-label="Anterior"
            rounded
            class="btn-pagina"
          />
          <span v-for="p in paginas" :key="p">
            <Button
              :label="p.toString()"
              :severity="pagina === p ? 'primary' : 'secondary'"
              rounded
              @click="goToPage(p)"
              class="btn-pagina"
            />
          </span>
          <Button
            icon="pi pi-angle-right"
            @click="nextPage"
            :disabled="pagina >= totalPages"
            aria-label="Siguiente"
            rounded
            class="btn-pagina"
          />
        </div>
      </div>
    </div>

    <!-- Dialog Detalle de Compra -->
    <Dialog
      v-model:visible="mostrarDialogDetalle"
      header="Información Detallada de la Compra"
      :modal="true"
      :style="{ width: '50rem' }"
    >
      <div v-if="detalleSeleccionado" class="detalle-compra">
        <!-- Información del Proveedor y Factura -->
        <div class="section-container mb-4">
          <h6 class="section-title mb-3">
            <i class="pi pi-building mr-2"></i>Información de la Compra
          </h6>
          <div class="grid grid-nogutter gap-3">
            <div class="col-12 md:col-6">
              <div class="info-card p-3 border-round">
                <div class="info-icon bg-primary mr-3">
                  <i class="pi pi-building"></i>
                </div>
                <div class="info-text">
                  <label class="text-sm text-500">Proveedor</label>
                  <span class="font-semibold">{{ detalleSeleccionado.compra.proveedor.nombreEmpresa }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="info-card p-3 border-round">
                <div class="info-icon bg-secondary mr-3">
                  <i class="pi pi-file"></i>
                </div>
                <div class="info-text">
                  <label class="text-sm text-500">N° Factura</label>
                  <span class="font-semibold">{{ detalleSeleccionado.compra.numeroFactura }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fecha de Compra -->
        <div class="section-container mb-4">
          <h6 class="section-title mb-3">
            <i class="pi pi-calendar mr-2"></i>Fecha
          </h6>
          <div class="info-card p-3 border-round">
            <div class="info-icon bg-info mr-3">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="info-text">
              <label class="text-sm text-500">Fecha de Compra</label>
              <span class="font-semibold">{{ formatFecha(detalleSeleccionado.compra.fechaCompra) }}</span>
            </div>
          </div>
        </div>

        <!-- Información del Producto -->
        <div class="section-container mb-4">
          <h6 class="section-title mb-3">
            <i class="pi pi-box mr-2"></i>Detalle del Producto
          </h6>
          <div class="grid grid-nogutter gap-3">
            <div class="col-12 md:col-6">
              <div class="info-card p-3 border-round">
                <div class="info-icon bg-warning mr-3">
                  <i class="pi pi-box"></i>
                </div>
                <div class="info-text">
                  <label class="text-sm text-500">Producto</label>
                  <span class="font-semibold">{{ detalleSeleccionado.producto.nombre }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="info-card p-3 border-round">
                <div class="info-icon bg-info mr-3">
                  <i class="pi pi-hashtag"></i>
                </div>
                <div class="info-text">
                  <label class="text-sm text-500">Cantidad Comprada</label>
                  <span class="p-tag p-tag-info text-lg">{{ detalleSeleccionado.cantidad }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información Financiera -->
        <div class="section-container mb-4">
          <h6 class="section-title mb-3">
            <i class="pi pi-dollar mr-2"></i>Información Financiera
          </h6>
          <div class="grid grid-nogutter gap-3">
            <div class="col-12 md:col-6">
              <div class="info-card p-3 border-round">
                <div class="info-icon bg-primary mr-3">
                  <i class="pi pi-money-bill"></i>
                </div>
                <div class="info-text">
                  <label class="text-sm text-500">Costo Unitario</label>
                  <span class="text-primary font-semibold text-lg"
                    >Bs. {{ Number(detalleSeleccionado.precioUnitario).toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="info-card p-3 border-round border-2 border-success">
                <div class="info-icon bg-success mr-3">
                  <i class="pi pi-dollar"></i>
                </div>
                <div class="info-text">
                  <label class="text-sm text-500">SubTotal</label>
                  <span class="text-success font-semibold text-lg"
                    >Bs. {{ Number(detalleSeleccionado.subTotal).toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usuario -->
        <div class="section-container mb-3">
          <h6 class="section-title mb-3">
            <i class="pi pi-user mr-2"></i>Información del Usuario
          </h6>
          <div class="info-card p-3 border-round">
            <div class="info-icon bg-secondary mr-3">
              <i class="pi pi-user"></i>
            </div>
            <div class="info-text">
              <label class="text-sm text-500">Usuario que Registró</label>
              <span class="font-semibold">{{ detalleSeleccionado.compra.usuario.usuario }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" @click="mostrarDialogDetalle = false" class="btn-cerrar" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* === VARIABLES DE COLOR === */
:root {
  --rosa-principal: #ff4081;
  --rosa-oscuro: #f50057;
  --rosa-claro: rgba(255, 64, 129, 0.1);
  --azul-vibrante: #2196F3;
  --azul-oscuro: #1976D2;
  --verde-success: #4CAF50;
  --verde-oscuro: #388E3C;
}

.p-datatable-list {
  background-color: #ffffff;
  min-height: 80vh;
  padding: 1rem;
}

/* Mantener compatibilidad con estilos de UsersView: encabezado */
.page-header h2 {
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* Tabla y datatable */
.p-datatable {
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  color: #333333;
}

.p-datatable-table thead th {
  background-color: #f8f9fa !important;
  color: #333333 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0 !important;
}

.p-datatable-table tbody tr {
  transition: background-color 0.3s;
  background-color: #ffffff;
  color: #333333;
}

.p-datatable-table tbody tr:hover {
  background-color: #f8f9fa !important;
}

.p-datatable-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.p-datatable-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0 !important;
  vertical-align: middle;
  color: #333333 !important;
}

/* Botón VER (azul) ahora con estilo coherente */
.btn-ver {
  background: linear-gradient(135deg, var(--azul-vibrante), var(--azul-oscuro)) !important;
  color: black !important;
  border: none !important;
  padding: 0.5rem !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.25) !important;
}

.btn-ver:hover {
  background: linear-gradient(135deg, var(--azul-oscuro), #1565C0) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.35) !important;
}

/* Paginación: usar mismo diseño que UsersView */
.p-paginator {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  color: #333333 !important;
}

.p-paginator .p-paginator-summary {
  color: #6c757d !important;
}

.p-paginator select {
  background-color: #ffffff !important;
  color: #333333 !important;
  border: 1px solid #ced4da !important;
  border-radius: 6px !important;
  padding: 0.4rem 0.75rem !important;
}

.btn-pagina {
  background: linear-gradient(135deg, var(--rosa-principal), var(--rosa-oscuro)) !important;
  color: black !important;
  border: none !important;
  padding: 0.5rem 0.75rem !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 6px rgba(255, 64, 129, 0.25) !important;
  min-width: 36px !important;
  min-height: 36px !important;
}

.btn-pagina:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--rosa-oscuro), #e60065) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.35) !important;
}

.btn-pagina:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.btn-pagina[severity="primary"] {
  background: linear-gradient(135deg, var(--verde-success), var(--verde-oscuro)) !important;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3) !important;
}

.btn-pagina[severity="primary"]:hover {
  background: linear-gradient(135deg, var(--verde-oscuro), #2E7D32) !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
}

/* Asegurar que los botones de PrimeVue con variante text y la clase btn-pagina
   muestren el fondo y el icono en color visible (no blanco sobre blanco) */
.p-button.btn-pagina,
.p-button.btn-pagina.p-button-text,
.btn-pagina.p-button,
.btn-pagina.p-button-text {
  background: linear-gradient(135deg, var(--rosa-principal), var(--rosa-oscuro)) !important;
  color: black !important;
  border: none !important;
}

.p-button.btn-pagina .pi,
.btn-pagina .pi,
.btn-pagina .p-button-icon {
  color: black !important;
  fill: black !important;
}

/* Iconos dentro del contenedor principal (por ejemplo el icono de la cabecera) */
.p-datatable-list .pi {
  color: var(--azul-vibrante) !important;
}

/* Botón Cerrar coherente */
.btn-cerrar {
  background: linear-gradient(135deg, var(--rosa-principal), var(--rosa-oscuro)) !important;
  color: white !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.25) !important;
  min-height: 40px !important;
}

.btn-cerrar:hover {
  background: linear-gradient(135deg, var(--rosa-oscuro), #e60065) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(255, 64, 129, 0.35) !important;
}

/* Tags */
.p-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.p-tag-secondary {
  background-color: #6c757d !important;
  color: #ffffff !important;
  border: 1px solid #5a6268 !important;
}
.p-tag-info {
  background-color: rgba(33, 150, 243, 0.15) !important;
  color: #1976D2 !important;
  border: 1px solid rgba(33, 150, 243, 0.3) !important;
}

/* Detalle compra */
.detalle-compra {
  padding: 0.5rem;
}

.section-title {
  color: #333333;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.info-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  color: #333333;
}
.info-card:hover {
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.info-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.info-icon.bg-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}
.info-icon.bg-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #8d959e 100%);
}
.info-icon.bg-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}
.info-icon.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}
.info-icon.bg-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.info-text label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-text span {
  color: #333333;
  font-size: 1rem;
  font-weight: 500;
}

/* Utilidades */
.flex { display:flex }
.flex-wrap { flex-wrap:wrap }
.justify-content-between { justify-content: space-between }
.align-items-center { align-items: center }
.gap-2 { gap: 0.5rem }
.gap-3 { gap: 1rem }
.mb-3 { margin-bottom: 1rem }
.mb-4 { margin-bottom: 1.5rem }
.mt-4 { margin-top: 1.5rem }
.shadow-1 { box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08) }
.border-round { border-radius: 6px }
.border-2 { border-width: 2px !important }
.border-success { border-color: #28a745 !important }

.error-text { color: #dc2626; font-size: 0.875rem; display:block; margin-top:0.25rem }
.text-success { color: #28a745 !important }
.text-primary { color: #2196F3 !important }

@media (max-width: 768px) {
  .info-card { flex-direction: column; text-align: center; padding:1rem }
  .info-icon { margin: 0 auto 0.5rem }
}

</style>
