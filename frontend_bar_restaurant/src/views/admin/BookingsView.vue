<script setup lang="ts">
import { ref } from 'vue'

const bookings = ref([
  {
    id: 1,
    customer: 'John Doe',
    email: 'john@example.com',
    date: '2024-11-01',
    time: '19:00',
    people: 4,
    status: 'confirmed',
    phone: '+1234567890',
  },
  {
    id: 2,
    customer: 'Jane Smith',
    email: 'jane@example.com',
    date: '2024-11-01',
    time: '20:30',
    people: 2,
    status: 'pending',
    phone: '+1234567891',
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    date: '2024-11-02',
    time: '18:00',
    people: 6,
    status: 'confirmed',
    phone: '+1234567892',
  },
  {
    id: 4,
    customer: 'Sarah Williams',
    email: 'sarah@example.com',
    date: '2024-11-02',
    time: '21:00',
    people: 3,
    status: 'cancelled',
    phone: '+1234567893',
  },
  {
    id: 5,
    customer: 'Robert Brown',
    email: 'robert@example.com',
    date: '2024-11-03',
    time: '19:30',
    people: 5,
    status: 'confirmed',
    phone: '+1234567894',
  },
])

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger',
  }
  return classes[status] || 'secondary'
}
</script>

<template>
  <div class="bookings-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">Bookings Management</h2>
      <p class="text-muted">Manage all restaurant reservations</p>
    </div>

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fa fa-calendar-check text-primary me-2"></i>
          All Bookings
        </h5>
        <button class="btn btn-primary"><i class="fa fa-plus me-2"></i>New Booking</button>
      </div>
      <div class="card-body p-0">
        <div class="table-container">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Time</th>
                <th>People</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in bookings" :key="booking.id">
                <td>{{ booking.id }}</td>
                <td>
                  <strong>{{ booking.customer }}</strong>
                </td>
                <td>
                  <small class="d-block">{{ booking.email }}</small>
                  <small class="text-muted">{{ booking.phone }}</small>
                </td>
                <td>{{ booking.date }}</td>
                <td>{{ booking.time }}</td>
                <td>{{ booking.people }}</td>
                <td>
                  <span class="badge" :class="`bg-${getStatusClass(booking.status)}`">
                    {{ booking.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1">
                    <i class="fa fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger">
                    <i class="fa fa-trash"></i>
                  </button>
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
.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  color: #6c757d;
}
</style>
