<script setup lang="ts">
import type { DetalleCompra } from '@/models/DetalleCompra'
import http from '@/plugins/axios'
import { ref, onMounted, computed } from 'vue'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'

const ENDPOINT = 'detalle-compras/detailed-list'

const detallesCompra = ref<DetalleCompra[]>([])
const loading = ref(false)

// Filtro y paginación
const filtroProveedor = ref('')
const paginaActual = ref<number>(1)
const itemsPorPagina = ref<number>(10)

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

// Filtros
const detallesFiltrados = computed(() => {
  return detallesCompra.value.filter((det) => {
    const prov = det.compra?.proveedor?.nombreEmpresa?.toLowerCase() ?? ''
    const prod = det.producto?.nombre?.toLowerCase() ?? ''
    const factura = det.compra?.numeroFactura?.toLowerCase() ?? ''
    const busqueda = filtroProveedor.value.toLowerCase()
    return prov.includes(busqueda) || prod.includes(busqueda) || factura.includes(busqueda)
  })
})

// Datos paginados
const detallesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return detallesFiltrados.value.slice(inicio, fin)
})

// Total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(detallesFiltrados.value.length / itemsPorPagina.value)
})

// Rango de páginas para mostrar
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

async function obtenerLista() {
  try {
    loading.value = true
    const response = await http.get(ENDPOINT)
    detallesCompra.value = Array.isArray(response.data) ? response.data : []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista' })
  } finally {
    loading.value = false
  }
}

function verDetalle(detalle: DetalleCompra) {
  detalleSeleccionado.value = detalle
  mostrarDialogDetalle.value = true
}

function cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

function onBusqueda() {
  paginaActual.value = 1
}

onMounted(() => obtenerLista())
</script>

<template>
  <div class="compras-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">
        <i class="pi pi-shopping-cart me-2"></i>Detalle de Compras
      </h2>
      <p class="text-muted">Historial detallado de todas las compras realizadas</p>
    </div>

    <!-- Filtro de Búsqueda -->
    <div class="search-container">
      <div>
        <InputGroup>
          <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
          <InputText
            v-model="filtroProveedor"
            type="text"
            placeholder="Buscar por proveedor, producto o factura"
            @input="onBusqueda"
            class="w-100"
          />
        </InputGroup>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info mt-3">Cargando detalles de compras...</div>

    <!-- Tabla -->
    <div v-if="!loading" class="table-container mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro</th>
            <th>Proveedor</th>
            <th>N° Factura</th>
            <th>Fecha Compra</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Costo Unit.</th>
            <th>SubTotal</th>
            <th>Usuario</th>
            <th style="width: 100px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(detalle, index) in detallesPaginados" :key="detalle.id">
            <td class="text-center">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
            <td class="fw-bold">{{ detalle.compra?.proveedor?.nombreEmpresa || 'N/A' }}</td>
            <td>
              <span class="badge bg-secondary">{{ detalle.compra?.numeroFactura || 'N/A' }}</span>
            </td>
            <td>{{ formatFecha(detalle.compra?.fechaCompra) }}</td>
            <td>
              <i class="pi pi-box me-2 text-muted"></i>
              {{ detalle.producto?.nombre || 'N/A' }}
            </td>
            <td class="text-center">
              <span class="badge bg-info">{{ detalle.cantidad }}</span>
            </td>
            <td class="text-end">Bs. {{ Number(detalle.precioUnitario || 0).toFixed(2) }}</td>
            <td class="text-end fw-bold text-success">
              Bs. {{ Number(detalle.subTotal || 0).toFixed(2) }}
            </td>
            <td>
              <i class="pi pi-user me-2 text-muted"></i>
              {{ detalle.compra?.usuario?.usuario || 'N/A' }}
            </td>
            <td class="text-center">
              <Button
                icon="pi pi-eye"
                aria-label="Ver Detalle"
                class="p-button-text p-button-sm text-info"
                @click="verDetalle(detalle)"
              />
            </td>
          </tr>
          <tr v-if="detallesPaginados.length === 0">
            <td colspan="10" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      v-if="!loading && totalPaginas > 1"
      class="d-flex justify-content-between align-items-center mt-3"
    >
      <div class="text-muted">
        Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} a
        {{ Math.min(paginaActual * itemsPorPagina, detallesFiltrados.length) }} de
        {{ detallesFiltrados.length }} registros
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

    <!-- Dialog Detalle de Compra -->
    <Dialog
      v-model:visible="mostrarDialogDetalle"
      header="Información Detallada de la Compra"
      :modal="true"
      :style="{ width: '50rem' }"
    >
      <div v-if="detalleSeleccionado" class="detalle-compra">
        <!-- Información del Proveedor y Factura -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-building me-2"></i>Información de la Compra
          </h6>
          <div class="row">
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-primary">
                  <i class="pi pi-building"></i>
                </div>
                <div class="info-text">
                  <label>Proveedor</label>
                  <span>{{ detalleSeleccionado.compra.proveedor.nombreEmpresa }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-secondary">
                  <i class="pi pi-file"></i>
                </div>
                <div class="info-text">
                  <label>N° Factura</label>
                  <span>{{ detalleSeleccionado.compra.numeroFactura }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-calendar me-2"></i>Fechas
          </h6>
          <div class="row">
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-info">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="info-text">
                  <label>Fecha de Compra</label>
                  <span>{{ formatFecha(detalleSeleccionado.compra.fechaCompra) }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-success">
                  <i class="pi pi-calendar-plus"></i>
                </div>
                <div class="info-text">
                  <label>Fecha de Recepción</label>
                  <span>{{ formatFecha(detalleSeleccionado.compra.fechaRecepcion) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Producto -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-box me-2"></i>Detalle del Producto
          </h6>
          <div class="row">
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-warning">
                  <i class="pi pi-box"></i>
                </div>
                <div class="info-text">
                  <label>Producto</label>
                  <span>{{ detalleSeleccionado.producto.nombre }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-info">
                  <i class="pi pi-hashtag"></i>
                </div>
                <div class="info-text">
                  <label>Cantidad Comprada</label>
                  <span class="badge bg-info fs-6">{{ detalleSeleccionado.cantidad }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información Financiera -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-dollar me-2"></i>Información Financiera
          </h6>
          <div class="row">
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon bg-primary">
                  <i class="pi pi-money-bill"></i>
                </div>
                <div class="info-text">
                  <label>Costo Unitario</label>
                  <span class="text-primary fw-bold fs-5"
                    >Bs. {{ Number(detalleSeleccionado.precioUnitario).toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-card border-success">
                <div class="info-icon bg-success">
                  <i class="pi pi-dollar"></i>
                </div>
                <div class="info-text">
                  <label>SubTotal</label>
                  <span class="text-success fw-bold fs-5"
                    >Bs. {{ Number(detalleSeleccionado.subTotal).toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usuario -->
        <div class="section-container">
          <h6 class="section-title">
            <i class="pi pi-user me-2"></i>Información del Usuario
          </h6>
          <div class="info-card">
            <div class="info-icon bg-secondary">
              <i class="pi pi-user"></i>
            </div>
            <div class="info-text">
              <label>Usuario que Registró</label>
              <span>{{ detalleSeleccionado.compra.usuario.usuario }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" @click="mostrarDialogDetalle = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.compras-view {
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.page-header h2 {
  color: #2c3e50;
  font-weight: 700;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}

.page-header p {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

/* Buscador mejorado */
.search-container {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.search-container > div {
  flex: 1;
  min-width: 200px;
}

/* Tabla con mejor responsividad */
.table-container {
  overflow-x: auto;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

table {
  margin-bottom: 0;
  border-collapse: collapse;
  width: 100%;
}

table thead {
  background-color: #2c3e50;
  color: white;
}

table thead th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid #1a2332;
}

table tbody td {
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

table tbody tr {
  transition: all 0.2s ease;
}

table tbody tr:hover {
  background-color: #f8f9fa;
}

.badge {
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
}

.pagination {
  margin-top: 1.5rem;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination .page-link {
  cursor: pointer;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  color: var(--primary);
  transition: all 0.2s ease;
}

.pagination .page-link:hover:not(.disabled) {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Detalle de Compra */
.detalle-compra {
  padding: 0.5rem;
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
  margin-bottom: 1rem;
}

.info-card:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.info-card.border-success {
  border: 2px solid #28a745;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Media Queries Responsivas */
@media (max-width: 1024px) {
  .page-header h2 {
    font-size: 1.5rem;
  }

  table thead th {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  table tbody td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .compras-view {
    padding: 0.75rem;
  }

  .page-header {
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
  }

  .page-header h2 {
    font-size: 1.4rem;
  }

  .page-header p {
    font-size: 0.85rem;
  }

  .search-container {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .search-container > div {
    width: 100%;
  }

  .table-container {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  table thead th {
    padding: 0.6rem 0.4rem;
    font-size: 0.8rem;
    white-space: normal;
  }

  table tbody td {
    padding: 0.6rem 0.4rem;
    font-size: 0.85rem;
  }

  .badge {
    font-size: 0.7rem;
    padding: 0.35rem 0.5rem;
  }

  .pagination {
    margin-top: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pagination ul {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .page-link {
    padding: 0.35rem 0.5rem !important;
    font-size: 0.8rem;
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
  .compras-view {
    padding: 0.5rem;
  }

  .page-header h2 {
    font-size: 1.2rem;
  }

  .page-header p {
    font-size: 0.8rem;
  }

  .table-container {
    font-size: 0.8rem;
  }

  table thead th {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }

  table tbody td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }

  .badge {
    font-size: 0.6rem;
    padding: 0.25rem 0.4rem;
  }

  .pagination {
    margin-top: 0.75rem;
  }

  .page-link {
    padding: 0.3rem 0.4rem !important;
    font-size: 0.7rem;
  }

  .btn-sm {
    padding: 0.25rem 0.4rem !important;
    font-size: 0.7rem !important;
  }
}
</style>
