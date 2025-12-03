<script setup lang="ts">
import type { DetalleVenta } from '@/models/DetalleVenta'
import type { Venta } from '@/models/venta'
import http from '@/plugins/axios'
import { InputGroup, InputGroupAddon, InputText, Dropdown, Button, Dialog } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'ventas'
const ventas = ref<Venta[]>([])
const detalleVentas = ref<DetalleVenta[]>([])

const busqueda = ref<string>('')

// Visualizador de detalles
const selectedVenta = ref<Venta | null>(null)
const dialogVisible = ref(false)

const emit = defineEmits(['view'])

// --- Paginación y Opciones ---
const opcionesFilas = [10, 25, 50, 100]
const filasPorPagina = ref<number>(10)
const paginaActual = ref<number>(1)

// --- Funciones de Cálculo de Rentabilidad ---

function calcularCostoTotal(venta: Venta): number {
  if (!venta.detalleVentas || venta.detalleVentas.length === 0) {
    return 0
  }

  const costo = venta.detalleVentas.reduce((sum, detalle) => {
    const costoUnitario = parseFloat(detalle.costoUnitario ?? '0')
    return sum + costoUnitario * detalle.cantidad
  }, 0)

  return parseFloat(costo.toFixed(2))
}

function calcularGananciaBruta(venta: Venta): number {
  const total = parseFloat(venta.total ?? '0')
  const costoTotal = calcularCostoTotal(venta)
  return parseFloat((total - costoTotal).toFixed(2))
}

function calcularCantidadItems(venta: Venta): number {
  if (!venta.detalleVentas || venta.detalleVentas.length === 0) {
    return 0
  }
  return venta.detalleVentas.reduce((sum, detalle) => sum + detalle.cantidad, 0)
}

function formatFecha(fecha: string): string {
  try {
    const date = new Date(fecha)
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    return fecha
  }
}

// --- Propiedades Computed ---

const ventasFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase()
  return ventas.value.filter(
    (venta) =>
      (venta.estado ?? '').toLowerCase().includes(q) ||
      (venta.tipoPago ?? '').toLowerCase().includes(q) ||
      (venta.fecha ?? '').toLowerCase().includes(q) ||
      (venta.mesa?.numeroMesa.toString() ?? '').includes(q) ||
      (venta.usuario?.usuario ?? '').toLowerCase().includes(q) ||
      (venta.cliente?.nombreFiscal ?? '').toLowerCase().includes(q) ||
      String(venta.total ?? '').includes(q),
  )
})

const ventasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * filasPorPagina.value
  const fin = inicio + filasPorPagina.value
  return ventasFiltradas.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(ventasFiltradas.value.length / filasPorPagina.value)
})

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

const resumenTotales = computed(() => {
  const totalVentas = ventasFiltradas.value.reduce((sum, v) => sum + parseFloat(v.total ?? '0'), 0)
  const costoTotal = ventasFiltradas.value.reduce((sum, v) => sum + calcularCostoTotal(v), 0)
  const gananciaTotal = totalVentas - costoTotal

  return {
    totalVentas: parseFloat(totalVentas.toFixed(2)),
    costoTotal: parseFloat(costoTotal.toFixed(2)),
    gananciaTotal: parseFloat(gananciaTotal.toFixed(2)),
  }
})

// --- Funciones de Fetch y UI ---

async function obtenerLista() {
  ventas.value = await http.get(ENDPOINT).then((res) => res.data)
  paginaActual.value = 1
}

function emitirVisualizacion(venta: Venta) {
  selectedVenta.value = venta
  dialogVisible.value = true
  emit('view', venta)
}

function cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

function onBusqueda() {
  paginaActual.value = 1
}

onMounted(obtenerLista)
defineExpose({ obtenerLista })
</script>

<template>
  <div class="ventas-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">
        <i class="pi pi-chart-line me-2"></i>Reporte Detallado de Ventas
      </h2>
      <p class="text-muted">Análisis completo de ventas, costos y rentabilidad</p>
    </div>

    <!-- Tarjetas de Resumen -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card stat-ingresos">
          <div class="stat-icon">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Ingresos</div>
            <div class="stat-value">Bs. {{ resumenTotales.totalVentas }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card stat-costos">
          <div class="stat-icon">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Costo Total</div>
            <div class="stat-value">Bs. {{ resumenTotales.costoTotal }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card stat-ganancia">
          <div class="stat-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Ganancia Bruta</div>
            <div class="stat-value">Bs. {{ resumenTotales.gananciaTotal }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row mb-3 align-items-end">
      <div class="col-md-6">
        <InputGroup>
          <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
          <InputText
            v-model="busqueda"
            type="text"
            placeholder="Buscar por cliente, estado, fecha, mesa o usuario"
            @input="onBusqueda"
          />
        </InputGroup>
      </div>

      <div class="col-md-3">
        <label class="form-label">Filas por página:</label>
        <Dropdown
          v-model="filasPorPagina"
          :options="opcionesFilas"
          placeholder="Seleccionar"
          class="w-100"
        />
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Tipo Pago</th>
            <th>Mesa</th>
            <th>Usuario</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Costo</th>
            <th>Ganancia</th>
            <th>Items</th>
            <th style="width: 100px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venta, index) in ventasPaginadas" :key="venta.id">
            <td class="text-center">{{ (paginaActual - 1) * filasPorPagina + index + 1 }}</td>
            <td>{{ formatFecha(venta.fecha) }}</td>
            <td>
              <span
                class="badge"
                :class="venta.estado === 'completada' ? 'bg-success' : 'bg-warning'"
              >
                {{ venta.estado }}
              </span>
            </td>
            <td>
              <span class="badge bg-info">{{ venta.tipoPago }}</span>
            </td>
            <td class="text-center">
              <span class="badge bg-secondary">Mesa {{ venta.mesa?.numeroMesa ?? 'N/A' }}</span>
            </td>
            <td>
              <i class="pi pi-user me-2 text-muted"></i>
              {{ venta.usuario?.usuario ?? 'N/A' }}
            </td>
            <td>{{ venta.cliente?.nombreFiscal ?? 'Consumidor Final' }}</td>
            <td class="text-end fw-bold">Bs. {{ venta.total }}</td>
            <td class="text-end text-danger">Bs. {{ calcularCostoTotal(venta) }}</td>
            <td class="text-end text-success fw-bold">Bs. {{ calcularGananciaBruta(venta) }}</td>
            <td class="text-center">
              <span class="badge bg-primary">{{ calcularCantidadItems(venta) }}</span>
            </td>
            <td class="text-center">
              <Button
                icon="pi pi-eye"
                aria-label="Ver Detalle"
                class="p-button-text p-button-sm text-info"
                @click="emitirVisualizacion(venta)"
              />
            </td>
          </tr>
          <tr v-if="ventasPaginadas.length === 0">
            <td colspan="12" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted">
        Mostrando {{ (paginaActual - 1) * filasPorPagina + 1 }} a
        {{ Math.min(paginaActual * filasPorPagina, ventasFiltradas.length) }} de
        {{ ventasFiltradas.length }} registros
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

    <!-- Dialog de Detalle de Venta Mejorado -->
    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :style="{ width: '55rem' }"
      header="Información Detallada de la Venta"
    >
      <div v-if="selectedVenta" class="detalle-venta">
        <!-- Header de la Venta -->
        <div class="venta-header">
          <div class="header-icon">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <div class="header-info">
            <h4 class="mb-2">Venta #{{ selectedVenta.id }}</h4>
            <div class="badges-container">
              <span
                class="badge me-2"
                :class="selectedVenta.estado === 'completada' ? 'bg-success' : 'bg-warning'"
              >
                <i class="pi pi-check-circle me-1"></i>{{ selectedVenta.estado }}
              </span>
              <span class="badge bg-info me-2">
                <i class="pi pi-credit-card me-1"></i>{{ selectedVenta.tipoPago }}
              </span>
              <span class="badge bg-secondary">
                <i class="pi pi-table me-1"></i>Mesa
                {{ selectedVenta.mesa?.numeroMesa ?? selectedVenta.idMesa ?? 'N/A' }}
              </span>
            </div>
          </div>
        </div>

        <hr class="separator" />

        <!-- Información General -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-info-circle me-2"></i>Información General
          </h6>
          <div class="row">
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-primary">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="info-text">
                  <label>Fecha y Hora</label>
                  <span>{{ formatFecha(selectedVenta.fecha) }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-info">
                  <i class="pi pi-user"></i>
                </div>
                <div class="info-text">
                  <label>Usuario</label>
                  <span>{{ selectedVenta.usuario?.usuario ?? 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-12 mt-2">
              <div class="info-card">
                <div class="info-icon bg-secondary">
                  <i class="pi pi-users"></i>
                </div>
                <div class="info-text">
                  <label>Cliente</label>
                  <span>{{ selectedVenta.cliente?.nombreFiscal ?? 'Consumidor Final' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalle de Productos -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-shopping-bag me-2"></i>Productos Vendidos
          </h6>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cantidad</th>
                  <th class="text-end">Precio Unit.</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in selectedVenta.detalleVentas || []" :key="i">
                  <td>
                    <i class="pi pi-box me-2 text-muted"></i>
                    {{
                      (d.producto && d.producto.nombre) ||
                      d.nombreProducto ||
                      d.nombre ||
                      d.idProducto
                    }}
                  </td>
                  <td class="text-center">
                    <span class="badge bg-primary">{{ d.cantidad ?? d.cantidadVenta ?? 0 }}</span>
                  </td>
                  <td class="text-end">
                    Bs.
                    {{
                      parseFloat(
                        d.precioUnitarioVenta ?? d.precio_unitario ?? d.precio ?? 0,
                      ).toFixed(2)
                    }}
                  </td>
                  <td class="text-end fw-bold">
                    Bs.
                    {{
                      (
                        parseFloat(d.cantidad ?? d.cantidadVenta ?? 0) *
                        parseFloat(d.precioUnitario ?? d.precio_unitario ?? d.precio ?? 0)
                      ).toFixed(2)
                    }}
                  </td>
                </tr>
                <tr v-if="!(selectedVenta.detalleVentas && selectedVenta.detalleVentas.length)">
                  <td colspan="4" class="text-center">No hay detalles disponibles.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resumen Financiero -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-dollar me-2"></i>Resumen Financiero
          </h6>
          <div class="row">
            <div class="col-md-4">
              <div class="info-card">
                <div class="info-icon bg-primary">
                  <i class="pi pi-dollar"></i>
                </div>
                <div class="info-text">
                  <label>Total Venta</label>
                  <span class="text-primary fw-bold fs-5"
                    >Bs. {{ parseFloat(selectedVenta.total ?? '0').toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="info-card">
                <div class="info-icon bg-danger">
                  <i class="pi pi-chart-bar"></i>
                </div>
                <div class="info-text">
                  <label>Costo Total</label>
                  <span class="text-danger fw-bold fs-5"
                    >Bs. {{ calcularCostoTotal(selectedVenta) }}</span
                  >
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="info-card border-success">
                <div class="info-icon bg-success">
                  <i class="pi pi-chart-line"></i>
                </div>
                <div class="info-text">
                  <label>Ganancia Bruta</label>
                  <span class="text-success fw-bold fs-5"
                    >Bs. {{ calcularGananciaBruta(selectedVenta) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" icon="pi pi-times" @click="dialogVisible = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.ventas-view {
  padding: 1rem;
}

.page-header h2 {
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* Tarjetas de Estadísticas */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border-left: 4px solid;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: -50px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-left-width: 6px;
}

.stat-card:hover::before {
  right: -20px;
}

.stat-ingresos {
  border-color: #3b82f6;
}

.stat-costos {
  border-color: #ef4444;
}

.stat-ganancia {
  border-color: #10b981;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-ingresos .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-costos .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.stat-ganancia .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

/* Tabla */
.table-responsive {
  overflow-x: auto;
}

table {
  min-width: 1200px;
}

.pagination .page-link {
  cursor: pointer;
}

/* Modal de Detalle */
.detalle-venta {
  padding: 0.5rem;
}

.venta-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 1.5rem;
}

.header-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.header-info h4 {
  margin: 0;
  font-weight: 600;
  color: white;
}

.badges-container .badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.separator {
  margin: 1.5rem 0;
  border-top: 2px solid #e9ecef;
}

.section-container {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-card.border-success {
  border: 2px solid #10b981;
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

.info-icon.bg-danger {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-text label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-text span {
  color: #212529;
  font-size: 1rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .row.g-3 {
    row-gap: 1rem !important;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-icon {
    width: 55px;
    height: 55px;
    font-size: 24px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .ventas-view {
    padding: 0 !important;
  }

  .page-header {
    margin-bottom: 1.5rem !important;
    padding: 0 1rem;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .row {
    margin-left: -0.5rem !important;
    margin-right: -0.5rem !important;
  }

  .col-md-4 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    margin-bottom: 0.5rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: row;
    gap: 1rem;
  }

  .stat-card::before {
    display: none;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .row.mb-3 {
    margin-bottom: 1rem !important;
  }

  .col-md-6,
  .col-md-3 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    margin-bottom: 0.75rem;
  }

  .table-container {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .table thead th {
    padding: 0.75rem 0.5rem !important;
    font-size: 0.8rem;
  }

  .table tbody td {
    padding: 0.75rem 0.5rem !important;
    font-size: 0.9rem;
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.35rem 0.5rem !important;
  }

  .pagination {
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  .page-link {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.85rem;
  }

  .venta-header {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }

  .header-icon {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }

  .info-card {
    flex-direction: column;
    text-align: center;
    margin-bottom: 0.75rem;
  }

  .info-icon {
    margin: 0 auto 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-header h2 {
    font-size: 1.25rem;
  }

  .stat-card {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .table-container {
    font-size: 0.8rem;
  }

  .table thead th {
    padding: 0.5rem 0.25rem !important;
    font-size: 0.7rem;
  }

  .table tbody td {
    padding: 0.5rem 0.25rem !important;
    font-size: 0.8rem;
  }

  .btn-sm {
    padding: 0.3rem 0.5rem !important;
    font-size: 0.7rem !important;
  }

  .pagination {
    font-size: 0.8rem;
  }

  .page-link {
    padding: 0.3rem 0.5rem !important;
    font-size: 0.75rem;
  }
}
</style>
