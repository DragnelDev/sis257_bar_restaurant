<script setup lang="ts">
import { ref } from 'vue'

interface Stat {
  title: string
  value: number | string
  icon: string
  color: string
  change: string
  trend: 'up' | 'down'
}

const stats = ref<Stat[]>([
  {
    title: 'Total Revenue',
    value: '$12,345',
    icon: 'fa-dollar-sign',
    color: 'primary',
    change: '+12%',
    trend: 'up',
  },
  {
    title: 'Today Bookings',
    value: 45,
    icon: 'fa-calendar-check',
    color: 'success',
    change: '+8%',
    trend: 'up',
  },
  {
    title: 'Total Orders',
    value: 189,
    icon: 'fa-shopping-cart',
    color: 'info',
    change: '-3%',
    trend: 'down',
  },
  {
    title: 'Active Staff',
    value: 24,
    icon: 'fa-users',
    color: 'warning',
    change: '+2',
    trend: 'up',
  },
])

const recentBookings = ref([
  {
    id: 1,
    customer: 'John Doe',
    date: '2024-11-01',
    time: '19:00',
    people: 4,
    status: 'confirmed',
  },
  {
    id: 2,
    customer: 'Jane Smith',
    date: '2024-11-01',
    time: '20:30',
    people: 2,
    status: 'pending',
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    date: '2024-11-02',
    time: '18:00',
    people: 6,
    status: 'confirmed',
  },
  {
    id: 4,
    customer: 'Sarah Williams',
    date: '2024-11-02',
    time: '21:00',
    people: 3,
    status: 'cancelled',
  },
])

const recentOrders = ref([
  {
    id: 1,
    orderNumber: '#ORD-001',
    customer: 'John Doe',
    items: 3,
    total: 125.5,
    status: 'completed',
  },
  {
    id: 2,
    orderNumber: '#ORD-002',
    customer: 'Jane Smith',
    items: 2,
    total: 85.0,
    status: 'preparing',
  },
  {
    id: 3,
    orderNumber: '#ORD-003',
    customer: 'Mike Johnson',
    items: 5,
    total: 210.75,
    status: 'delivered',
  },
])

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger',
    completed: 'success',
    preparing: 'info',
    delivered: 'primary',
  }
  return classes[status] || 'secondary'
}
</script>

<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2 class="mb-1">Dashboard</h2>
      <p class="text-muted">Welcome back! Here's what's happening today.</p>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div v-for="stat in stats" :key="stat.title" class="col-lg-3 col-md-6">
        <div class="stat-card" :class="`border-${stat.color}`">
          <div class="stat-icon" :class="`bg-${stat.color}`">
            <i :class="`fa ${stat.icon}`"></i>
          </div>
          <div class="stat-content">
            <h6 class="stat-title">{{ stat.title }}</h6>
            <h3 class="stat-value">{{ stat.value }}</h3>
            <span class="stat-change" :class="stat.trend === 'up' ? 'text-success' : 'text-danger'">
              <i :class="`fa fa-arrow-${stat.trend}`"></i>
              {{ stat.change }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row g-4">
      <!-- Recent Bookings -->
      <div class="col-lg-7">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fa fa-calendar-check text-primary me-2"></i>
              Recent Bookings
            </h5>
            <RouterLink to="/admin/bookings" class="btn btn-sm btn-outline-primary">
              View All
            </RouterLink>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>People</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="booking in recentBookings" :key="booking.id">
                    <td>{{ booking.customer }}</td>
                    <td>{{ booking.date }}</td>
                    <td>{{ booking.time }}</td>
                    <td>{{ booking.people }}</td>
                    <td>
                      <span class="badge" :class="`bg-${getStatusClass(booking.status)}`">
                        {{ booking.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="col-lg-5">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fa fa-shopping-cart text-primary me-2"></i>
              Recent Orders
            </h5>
            <RouterLink to="/admin/orders" class="btn btn-sm btn-outline-primary">
              View All
            </RouterLink>
          </div>
          <div class="card-body p-0">
            <div class="order-list">
              <div v-for="order in recentOrders" :key="order.id" class="order-item">
                <div class="order-info">
                  <h6 class="mb-1">{{ order.orderNumber }}</h6>
                  <p class="mb-1 text-muted small">{{ order.customer }}</p>
                  <span class="badge" :class="`bg-${getStatusClass(order.status)}`">
                    {{ order.status }}
                  </span>
                </div>
                <div class="order-total">
                  <p class="mb-0 small text-muted">{{ order.items }} items</p>
                  <h6 class="mb-0 text-primary">${{ order.total }}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s;
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

/* Background colors for badges */
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
