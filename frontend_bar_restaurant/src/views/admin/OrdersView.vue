<script setup lang="ts">
import { ref } from 'vue'

interface Order {
  id: number
  orderNumber: string
  customer: string
  items: string
  total: number
  status: 'preparing' | 'ready' | 'delivered' | 'cancelled'
  orderTime: string
  table?: number
}

const orders = ref<Order[]>([
  {
    id: 1,
    orderNumber: 'ORD-001',
    customer: 'John Doe',
    items: '2x Burger, 1x Fries',
    total: 35.5,
    status: 'preparing',
    orderTime: '14:30',
    table: 5,
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    customer: 'Jane Smith',
    items: '1x Steak, 1x Salad',
    total: 48.0,
    status: 'ready',
    orderTime: '15:00',
    table: 12,
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    customer: 'Mike Johnson',
    items: '3x Pizza, 2x Soda',
    total: 62.5,
    status: 'delivered',
    orderTime: '15:30',
    table: 8,
  },
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    preparing: 'warning',
    ready: 'info',
    delivered: 'success',
    cancelled: 'danger',
  }
  return colors[status] || 'secondary'
}

const updateStatus = (id: number, newStatus: Order['status']) => {
  const order = orders.value.find((o) => o.id === id)
  if (order) {
    order.status = newStatus
  }
}
</script>

<template>
  <div>
    <div class="page-header mb-4">
      <h2 class="mb-1">Orders Management</h2>
      <p class="text-muted">Track and manage customer orders</p>
    </div>

    <!-- Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card border-warning">
          <div class="stat-icon bg-warning">
            <i class="fa fa-clock"></i>
          </div>
          <div class="stat-content">
            <h6>Preparing</h6>
            <h3>{{ orders.filter((o) => o.status === 'preparing').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-info">
          <div class="stat-icon bg-info">
            <i class="fa fa-check"></i>
          </div>
          <div class="stat-content">
            <h6>Ready</h6>
            <h3>{{ orders.filter((o) => o.status === 'ready').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-success">
          <div class="stat-icon bg-success">
            <i class="fa fa-shipping-fast"></i>
          </div>
          <div class="stat-content">
            <h6>Delivered</h6>
            <h3>{{ orders.filter((o) => o.status === 'delivered').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-primary">
          <div class="stat-icon bg-primary">
            <i class="fa fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h6>Total Revenue</h6>
            <h3>${{ orders.reduce((sum, o) => sum + o.total, 0).toFixed(2) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fa fa-shopping-cart text-primary me-2"></i>
          Active Orders
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>
                  <strong>{{ order.orderNumber }}</strong>
                </td>
                <td>{{ order.customer }}</td>
                <td>Table {{ order.table }}</td>
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
                      v-if="order.status === 'preparing'"
                      class="btn btn-outline-info"
                      @click="updateStatus(order.id, 'ready')"
                    >
                      Mark Ready
                    </button>
                    <button
                      v-if="order.status === 'ready'"
                      class="btn btn-outline-success"
                      @click="updateStatus(order.id, 'delivered')"
                    >
                      Deliver
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
