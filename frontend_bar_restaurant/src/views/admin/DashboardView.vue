<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Estadistica {
  titulo: string
  valor: number | string
  icono: string
  color: string
  cambio: string
  tendencia: 'up' | 'down'
}

// Datos de ejemplo para que el dashboard sea funcional
const stats = ref<Estadistica[]>([
  {
    titulo: 'Ventas de Hoy',
    valor: 'Bs. 1,250',
    icono: 'fa-chart-line',
    color: 'success',
    cambio: '12.5%',
    tendencia: 'up',
  },
  {
    titulo: 'Reservas Activas',
    valor: 15,
    icono: 'fa-calendar-alt',
    color: 'info',
    cambio: '1.2%',
    tendencia: 'down',
  },
  {
    titulo: 'Pedidos Nuevos',
    valor: 45,
    icono: 'fa-utensils',
    color: 'warning',
    cambio: '5.8%',
    tendencia: 'up',
  },
  {
    titulo: 'Clientes Únicos',
    valor: 120,
    icono: 'fa-users',
    color: 'primary',
    cambio: '0.5%',
    tendencia: 'up',
  },
])

const recentBookings = ref([
  { id: 1, cliente: 'Juan Pérez', fecha: '20/11/2025', hora: '20:00', personas: 4, estado: 'confirmed' },
  { id: 2, cliente: 'Ana Torres', fecha: '20/11/2025', hora: '19:30', personas: 2, estado: 'pending' },
  { id: 3, cliente: 'Luis Gómez', fecha: '19/11/2025', hora: '13:00', personas: 8, estado: 'cancelled' },
  { id: 4, cliente: 'Marta Rojas', fecha: '19/11/2025', hora: '18:45', personas: 3, estado: 'confirmed' },
])

const recentOrders = ref([
  { id: 101, numeroPedido: '#ORD-101', cliente: 'María López', items: 3, total: 45.00, estado: 'delivered' },
  { id: 102, numeroPedido: '#ORD-102', cliente: 'Carlos Ruiz', items: 2, total: 28.50, estado: 'preparing' },
  { id: 103, numeroPedido: '#ORD-103', cliente: 'Elena Flores', items: 5, total: 82.00, estado: 'completed' },
  { id: 104, numeroPedido: '#ORD-104', cliente: 'Pedro Soria', items: 1, total: 15.00, estado: 'preparing' },
])

// Función para traducir y asignar clases de estado
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    confirmed: 'success',  // Confirmada
    pending: 'warning',    // Pendiente
    cancelled: 'danger',   // Cancelada
    completed: 'success',  // Completado
    preparing: 'info',     // En Preparación
    delivered: 'primary',  // Entregado
  }
  return classes[status] || 'secondary'
}

// Función para traducir el texto del estado
const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
        confirmed: 'Confirmada',
        pending: 'Pendiente',
        cancelled: 'Cancelada',
        completed: 'Completado',
        preparing: 'En Prep.',
        delivered: 'Entregado',
    }
    return translations[status] || status;
}

// Se mantendría la lógica de `onMounted` si tuvieras una función `fetchData` real.
// onMounted(() => {
//   fetchData();
// });
</script>

<template>
  <div class="dashboard container-fluid">
    <div class="page-header mb-4">
      <h2 class="mb-1">Panel de Control (Dashboard)</h2>
      <p class="text-muted">¡Bienvenido de nuevo! Aquí están las novedades de hoy.</p>
    </div>

    <div class="row g-4 mb-4">
      <div v-for="stat in stats" :key="stat.titulo" class="col-lg-3 col-md-6">
        <div class="stat-card" :class="`border-${stat.color}`">
          <div class="stat-icon" :class="`bg-${stat.color}`">
            <i :class="`fa ${stat.icono}`"></i>
          </div>
          <div class="stat-content">
            <h6 class="stat-title">{{ stat.titulo }}</h6>
            <h3 class="stat-value">{{ stat.valor }}</h3>
            <span
              class="stat-change"
              :class="stat.tendencia === 'up' ? 'text-success' : 'text-danger'"
            >
              <i
                :class="`fa fa-arrow-${stat.tendencia === 'up' ? 'up' : 'down'} me-1`"
              ></i>
              {{ stat.cambio }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fa fa-calendar-check text-primary me-2"></i>
              Reservas Recientes
            </h5>
            <RouterLink to="/admin/bookings" class="btn btn-sm btn-outline-primary">
              Ver Todas
            </RouterLink>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-dark">
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Personas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="booking in recentBookings" :key="booking.id">
                    <td>{{ booking.cliente }}</td>
                    <td>{{ booking.fecha }}</td>
                    <td>{{ booking.hora }}</td>
                    <td>{{ booking.personas }}</td>
                    <td>
                      <span class="badge" :class="`bg-${getStatusClass(booking.estado)}`">
                        {{ translateStatus(booking.estado) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fa fa-shopping-cart text-primary me-2"></i>
              Pedidos Recientes
            </h5>
            <RouterLink to="/admin/orders" class="btn btn-sm btn-outline-primary">
              Ver Todos
            </RouterLink>
          </div>
          <div class="card-body p-0">
            <div class="order-list">
              <div v-for="order in recentOrders" :key="order.id" class="order-item">
                <div class="order-info">
                  <h6 class="mb-1">{{ order.numeroPedido }}</h6>
                  <p class="mb-1 text-muted small">{{ order.cliente }}</p>
                  <span class="badge" :class="`bg-${getStatusClass(order.estado)}`">
                    {{ translateStatus(order.estado) }}
                  </span>
                </div>
                <div class="order-total">
                  <p class="mb-0 small text-muted">{{ order.items }} ítems</p>
                  <h6 class="mb-0 text-primary">Bs. {{ order.total }}</h6>
                </div>
              </div>
              <div v-if="recentOrders.length === 0" class="text-center text-muted py-3">
                  No hay pedidos recientes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Definición de variables de color (Si usas SASS/CSS Variables) */
:root {
    --primary: #fea116; /* Naranja de tu Login */
    --dark: #343a40;
}

.dashboard {
  animation: fadeIn 0.35s ease both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header h2 {
  color: var(--dark);
  font-weight: 700;
}

/* Stat Cards */
.stat-card {
  /* ... (Estilos se mantienen) ... */
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  border-left: 4px solid;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
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

.stat-content {
  flex: 1;
}

.stat-title {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 5px;
}

.stat-change {
  font-size: 14px;
  font-weight: 600;
}

/* Cards */
.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  color: #6c757d;
  border-bottom: 2px solid #e9ecef;
}

.table td {
  vertical-align: middle;
}

/* Order List */
.order-list {
  padding: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.3s;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item:hover {
  background: #f8f9fa;
}

.order-info h6 {
  color: var(--dark);
  font-weight: 600;
}

.order-total {
  text-align: right;
}

/* Background colors for badges (Asegúrate de que tus variables CSS están definidas o usa los códigos) */
.text-primary { color: var(--primary) !important; }

.bg-primary {
  background-color: var(--primary) !important;
}

.bg-success {
  background-color: #28a745 !important;
}

.bg-info {
  background-color: #17a2b8 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: var(--dark) !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}
</style>
