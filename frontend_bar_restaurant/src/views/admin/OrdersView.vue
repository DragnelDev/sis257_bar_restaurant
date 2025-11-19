<script setup lang="ts">
import { ref } from 'vue'

// Adaptación de la interfaz a tu modelo de Ventas (cabecera)
interface VentaActiva {
  id: number // Corresponde a ventas.id
  orderNumber: string // Generado por el sistema (ej: 'ORD-001')
  customer: string // Nombre del Cliente o 'Anónimo'
  items: string // Resumen de los ítems (ej: 2x Burger, 1x Fries)
  total: number // ventas.total
  // Estados clave de la Venta (adaptados de tu backend)
  status: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'PAGADA' | 'CANCELADA' // Usamos PENDIENTE y LISTO
  orderTime: string // ventas.fecha (formateada)
  idMesa: number // ventas.idMesa
}

const orders = ref<VentaActiva[]>([
  {
    id: 1,
    orderNumber: 'ORD-001',
    customer: 'Juan Pérez',
    items: '2x Hamburguesa, 1x Coca-Cola',
    total: 35.5,
    status: 'PREPARANDO',
    orderTime: '14:30',
    idMesa: 5, // Cambiado de 'table' a 'idMesa'
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    customer: 'Cliente Anónimo',
    items: '1x Ribeye Steak, 1x Ensalada',
    total: 48.0,
    status: 'LISTO',
    orderTime: '15:00',
    idMesa: 12,
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    customer: 'María López',
    items: '3x Pizza, 2x Cerveza',
    total: 62.5,
    status: 'PENDIENTE', // Nueva orden sin enviar a cocina
    orderTime: '15:30',
    idMesa: 8,
  },
])

// Colores adaptados a tus estados de Venta
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PREPARANDO: 'warning',
    LISTO: 'info',
    PAGADA: 'success', // Entregado/Cobrado
    PENDIENTE: 'secondary', // Recién tomada, esperando envío a cocina
    CANCELADA: 'danger',
  }
  return colors[status] || 'secondary'
}

const updateStatus = (id: number, newStatus: VentaActiva['status']) => {
  const order = orders.value.find((o) => o.id === id)
  if (order) {
    // Aquí iría la llamada al backend:
    // await axios.patch(`/ventas/${id}/status`, { estado: newStatus });
    order.status = newStatus
  }
}

// --- NUEVA LÓGICA PARA CAMBIO DE MESA ---
const showMoveModal = ref(false)
const orderToMove = ref<VentaActiva | null>(null)
const newMesaId = ref<number | null>(null)

// Simulamos las mesas disponibles que vienen de otra API
const availableTables = ref([4, 6, 9, 10, 11])

const openMoveModal = (order: VentaActiva) => {
  orderToMove.value = order
  newMesaId.value = null // Resetear selección
  showMoveModal.value = true
}

const confirmMoveTable = () => {
  if (orderToMove.value && newMesaId.value) {
    // --- LLAMADA AL BACKEND PARA CAMBIO DE MESA ---
    console.log(
      `Moviendo ORDEN ${orderToMove.value.orderNumber} (ID ${orderToMove.value.id}) de MESA ${orderToMove.value.idMesa} a MESA ${newMesaId.value}`,
    )

    // Simulación de éxito (Aquí iría la llamada a tu API de NestJS)
    // await axios.patch(`/ventas/${orderToMove.value.id}/cambiar-mesa`, { nuevaIdMesa: newMesaId.value });

    // Actualización del Front-end
    orderToMove.value.idMesa = newMesaId.value
    alert(`La orden ${orderToMove.value.orderNumber} ha sido movida a la Mesa ${newMesaId.value}.`)

    showMoveModal.value = false
  } else {
    alert('Debe seleccionar una mesa destino.')
  }
}
</script>

<template>
  <div>
    <div class="page-header mb-4">
      <h2 class="mb-1">Gestión de Órdenes Activas</h2>
      <p class="text-muted">Rastrea y gestiona el flujo de pedidos del restaurante</p>
    </div>

    <div class="row g-4 mb-4"></div>

    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fa fa-shopping-cart text-primary me-2"></i>
          Órdenes Activas
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Orden #</th>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Ítems</th>
                <th>Total</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>
                  <strong>{{ order.orderNumber }}</strong>
                </td>
                <td>{{ order.customer }}</td>
                <td>Mesa {{ order.idMesa }}</td>
                <td>{{ order.items }}</td>
                <td>
                  <strong>${{ order.total.toFixed(2) }}</strong>
                </td>
                <td>{{ order.orderTime }}</td>
                <td>
                  <span class="badge" :class="`bg-${getStatusColor(order.status)}`">
                    {{ order.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      v-if="order.status === 'PENDIENTE' || order.status === 'PREPARANDO'"
                      class="btn btn-outline-info"
                      @click="updateStatus(order.id, 'LISTO')"
                    >
                      <i class="fa fa-check me-1"></i>Listo
                    </button>
                    <button
                      v-if="order.status !== 'PAGADA' && order.status !== 'CANCELADA'"
                      class="btn btn-outline-success"
                      @click="updateStatus(order.id, 'PAGADA')"
                    >
                      <i class="fa fa-dollar-sign me-1"></i>Pagar
                    </button>

                    <button
                      v-if="order.status === 'PENDIENTE' || order.status === 'PREPARANDO'"
                      class="btn btn-outline-secondary"
                      @click="openMoveModal(order)"
                      data-bs-toggle="modal"
                      data-bs-target="#moveTableModal"
                    >
                      <i class="fa fa-people-arrows"></i> Mover
                    </button>

                    <button class="btn btn-outline-primary">
                      <i class="fa fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="moveTableModal"
      tabindex="-1"
      v-if="orderToMove"
      aria-labelledby="moveTableModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-secondary text-white">
            <h5 class="modal-title">Mover Orden {{ orderToMove.orderNumber }}</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              @click="showMoveModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Moviendo orden de la <b>Mesa {{ orderToMove.idMesa }}</b
              >.
            </p>
            <div class="mb-3">
              <label for="selectNewTable" class="form-label">
                Seleccione Mesa Destino (Libre):
              </label>
              <select id="selectNewTable" class="form-select" v-model="newMesaId">
                <option :value="null" disabled>-- Seleccionar Mesa --</option>
                <option v-for="tableId in availableTables" :key="tableId" :value="tableId">
                  Mesa {{ tableId }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="showMoveModal = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="confirmMoveTable"
              :disabled="!newMesaId"
            >
              Confirmar Movimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  border-left: 4px solid;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-content h6 {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
