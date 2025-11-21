<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Venta } from '../../models/venta'
import axios from '../../plugins/axios'

// --- Nueva Interfaz para Detalle de Ítem ---
interface ItemDetalle {
  name: string
  quantity: number
  price: number // Precio unitario
}

const STATUS = {
  PAGADA: 'PAGADA', // Estado inicial según backend
  PREPARANDO: 'PREPARANDO',
  LISTO: 'LISTO',
  ARCHIVADA: 'ARCHIVADA',
  CANCELADA: 'CANCELADA',
} as const

// --- Interfaz VentaActiva Actualizada ---
interface VentaActiva {
  id: number
  orderNumber: string
  customer: string
  items: string
  itemDetails: ItemDetalle[]
  total: number
  // Usamos 'estado' para coincidir con el backend
  estado:
    | typeof STATUS.PAGADA
    | typeof STATUS.PREPARANDO
    | typeof STATUS.LISTO
    | typeof STATUS.ARCHIVADA
    | typeof STATUS.CANCELADA
  orderTime: string
  idMesa: number
}

const orders = ref<VentaActiva[]>([])

const activeOrders = computed(() =>
  orders.value.filter((o) => o.estado !== STATUS.ARCHIVADA && o.estado !== STATUS.CANCELADA),
)

// --- LÓGICA DEL MODAL DE DETALLES ---
const showDetailsModal = ref(false)
const selectedOrder = ref<VentaActiva | null>(null)

const openDetailsModal = (order: VentaActiva) => {
  selectedOrder.value = order
  showDetailsModal.value = true
}

const getStatusColor = (estado: string) => {
  const colors: Record<string, string> = {
    PREPARANDO: 'warning',
    LISTO: 'info',
    PAGADA: 'success',
    ARCHIVADA: 'dark',
    CANCELADA: 'danger',
  }
  return colors[estado] || 'secondary'
}

const ENDPOINT = '/ventas'

const loading = ref(false)
const error = ref<string | null>(null)

const updateOrderStatus = async (id: number, newStatus: string) => {
  const index = orders.value.findIndex((o) => o.id === id)
  if (index === -1) return

  const order = orders.value[index]

  try {
    const res = await axios.patch(`${ENDPOINT}/${id}/status`, { status: newStatus })
    console.debug('[OrdersView] PATCH', `${ENDPOINT}/${id}/status`, 'resp=', res.status, res.data)
    const raw = res.data
    const updatedRaw = (raw && (raw.data || raw.venta || raw.ventaActualizada || raw)) || null

    if (newStatus === STATUS.ARCHIVADA) {
      orders.value.splice(index, 1)
      alert(`✅ Venta ${order.orderNumber} archivada y Mesa ${order.idMesa} liberada.`)
    } else {
      if (updatedRaw && updatedRaw.id) {
        const mapped = mapVentaToView(updatedRaw as Venta)
        orders.value.splice(index, 1, mapped)
      } else {
        order.estado = (raw && raw.estado) || newStatus
        orders.value.splice(index, 1, order)
      }
    }
  } catch (error: any) {
    console.error('Fallo en la actualización del estado:', error)
    alert(`❌ Fallo en el servidor: ${error.message}`)
  }
}


const finalizeSale = (id: number) => {
  updateOrderStatus(id, STATUS.ARCHIVADA)
}

const mapVentaToView = (venta: Venta): VentaActiva => {
  const detalleVentas = (venta.detalleVentas || venta.detalles || []).map((d: any) => ({
    name: d.name || d.nombreReceta || `Receta ${d.idReceta}`,
    quantity: Number(d.cantidad ?? d.quantity ?? 1),
    price: Number(d.precioUnitarioVenta ?? d.price ?? d.subtotal ?? 0),
  }))

  const itemsStr = detalleVentas.map((d) => `${d.quantity}x ${d.name}`).join(', ')

  return {
    id: venta.id,
    orderNumber: venta.id ? `ORD-${String(venta.id).padStart(3, '0')}` : 'ORD-0',
    customer:
      (venta as any).cliente?.nombreFiscal ||
      (venta as any).cliente?.nombre ||
      venta.nombreFiscal ||
      'CONSUMIDOR FINAL',
    items: itemsStr,
    itemDetails: detalleVentas,
    total: Number(venta.total ?? detalleVentas.reduce((s, it) => s + it.quantity * it.price, 0)),
    estado: venta.estado || STATUS.PAGADA,
    orderTime: venta.fechaCreacion || venta.fecha || '',
    idMesa: venta.mesa?.numeroMesa ?? venta.idMesa ?? (venta.mesa ? venta.mesa.id : 0),
  }
}

const fetchVentas = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(ENDPOINT)
    console.debug('[OrdersView] GET', ENDPOINT, 'status=', res.status, 'data=', res.data)

    const raw = res.data
    let ventasArray: any[] | null = null

    if (Array.isArray(raw)) ventasArray = raw
    else if (raw && Array.isArray(raw.data)) ventasArray = raw.data
    else if (raw && Array.isArray(raw.ventas)) ventasArray = raw.ventas
    else if (raw && Array.isArray(raw.results)) ventasArray = raw.results
    else if (raw && Array.isArray(raw.items)) ventasArray = raw.items

    if (!ventasArray) {
      console.error(
        '[OrdersView] Respuesta no contiene lista de ventas en un formato esperado',
        raw,
      )
      throw new Error(
        'Respuesta inesperada del servidor: no contiene lista de ventas. Mira la consola.',
      )
    }

    orders.value = ventasArray.map(mapVentaToView)
  } catch (err: any) {
    console.error('Error al cargar ventas:', err)
    error.value = err?.response?.data?.message || err?.message || String(err)
    if (err?.response) {
      error.value += ` (HTTP ${err.response.status})`
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVentas()
})
</script>

<template>
  <div>
    <div class="page-header mb-4">
      <h2 class="mb-1">Cobro y Finalización de Órdenes</h2>
      <p class="text-muted">Órdenes con mesas asignadas y pendientes de cobro final.</p>
    </div>

    <div class="card shadow-lg">
      <div class="card-header bg-white border-bottom">
        <h5 class="mb-0">
          <i class="fa fa-clipboard-list text-primary me-2"></i>
          Órdenes Activas ({{ activeOrders.length }})
        </h5>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="p-3 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div v-if="error" class="p-3">
          <div class="alert alert-danger d-flex justify-content-between align-items-center">
            <div class="me-3">{{ error }}</div>
            <div>
              <button class="btn btn-sm btn-outline-light btn-dark" @click="fetchVentas">
                Reintentar
              </button>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0 align-middle">
            <thead>
              <tr class="text-secondary">
                <th>Orden #</th>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Total</th>
                <th>Hora</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in activeOrders" :key="order.id">
                <td>
                  <strong>{{ order.orderNumber }}</strong>
                </td>
                <td>{{ order.customer }}</td>
                <td>
                  <span class="badge bg-dark">Mesa {{ order.idMesa }}</span>
                </td>
                <td>
                  <strong class="text-success">${{ order.total.toFixed(2) }}</strong>
                </td>
                <td>{{ order.orderTime }}</td>
                <td>
                  <span class="badge text-uppercase" :class="`bg-${getStatusColor(order.estado)}`">
                    {{ order.estado }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <!-- 1. Botón Ver Detalles -->
                    <button
                      class="btn btn-outline-secondary"
                      @click="openDetailsModal(order)"
                      data-bs-toggle="modal"
                      data-bs-target="#orderDetailsModal"
                      title="Ver Detalles"
                    >
                      <i class="fa fa-eye"></i>
                    </button>

                    <!-- 2. Botones de Transición de Estado -->
                    <!-- Transiciones según backend: PAGADA -> PREPARANDO -> LISTO -> ARCHIVADA -->
                    <button
                      v-if="order.estado === STATUS.PAGADA"
                      class="btn btn-warning text-white"
                      @click="updateOrderStatus(order.id, STATUS.PREPARANDO)"
                      title="Iniciar Preparación (Cocina)"
                    >
                      <i class="fa fa-utensils"></i> Prep.
                    </button>

                    <button
                      v-else-if="order.estado === STATUS.PREPARANDO"
                      class="btn btn-info text-white"
                      @click="updateOrderStatus(order.id, STATUS.LISTO)"
                      title="Marcar como Listo para servir"
                    >
                      <i class="fa fa-bell"></i> Listo
                    </button>

                    <button
                      v-else-if="order.estado === STATUS.LISTO"
                      class="btn btn-success"
                      @click="finalizeSale(order.id)"
                      title="Cobrar, Entregar y Archivar (Libera Mesa)"
                    >
                      <i class="fa fa-check-double me-1"></i> Cobrar / Archivar
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="activeOrders.length === 0">
                <td colspan="7" class="text-center text-muted py-3">
                  No hay órdenes activas pendientes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles (Mantenido y mejorado) -->
    <div
      class="modal fade"
      id="orderDetailsModal"
      tabindex="-1"
      v-if="selectedOrder"
      aria-labelledby="orderDetailsModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="orderDetailsModalLabel">
              Detalles de la Orden {{ selectedOrder.orderNumber }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              @click="showDetailsModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p><strong>Cliente:</strong> {{ selectedOrder.customer }}</p>
            <p>
              <strong>Mesa Asignada:</strong>
              <span class="badge bg-dark fs-6">Mesa {{ selectedOrder.idMesa }}</span>
            </p>
            <p>
              <strong>Estado Actual:</strong>
              <span
                class="badge text-uppercase"
                :class="`bg-${getStatusColor(selectedOrder.estado)}`"
                >{{ selectedOrder.estado }}</span
              >
            </p>
            <hr />
            <h6>Productos Pedidos:</h6>
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Producto</th>
                  <th class="text-end">P. Unit.</th>
                  <th class="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selectedOrder.itemDetails" :key="index">
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.name }}</td>
                  <td class="text-end">${{ item.price.toFixed(2) }}</td>
                  <td class="text-end">
                    <strong>${{ (item.quantity * item.price).toFixed(2) }}</strong>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="3" class="text-end">TOTAL DE LA ORDEN:</th>
                  <th class="text-end text-success fs-5">${{ selectedOrder.total.toFixed(2) }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="showDetailsModal = false"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Usando Tailwind CSS si estuviera disponible, pero manteniendo Bootstrap para este contexto */
.card {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}
.page-header {
  border-left: 5px solid #0d6efd; /* Color primary de Bootstrap */
  padding-left: 1rem;
}
.btn-group-sm .btn {
  font-size: 0.75rem;
}
</style>
