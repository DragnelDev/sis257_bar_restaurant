<script setup lang="ts">
import { ref } from 'vue'
import type { Employee } from '../../types'

const employees = ref<Employee[]>([
  {
    id: 1,
    name: 'Carlos Rodriguez',
    email: 'carlos@restoran.com',
    phone: '+1234567890',
    position: 'Head Chef',
    salary: 5000,
    hireDate: '2020-01-15',
    status: 'active',
    avatar: '/img/team-1.jpg',
    address: '123 Main St, New York',
    emergencyContact: '+1234567899',
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria@restoran.com',
    phone: '+1234567891',
    position: 'Sous Chef',
    salary: 3500,
    hireDate: '2021-03-20',
    status: 'active',
    avatar: '/img/team-2.jpg',
    address: '456 Park Ave, New York',
    emergencyContact: '+1234567898',
  },
  {
    id: 3,
    name: 'David Lee',
    email: 'david@restoran.com',
    phone: '+1234567892',
    position: 'Waiter',
    salary: 2500,
    hireDate: '2022-06-10',
    status: 'active',
    avatar: '/img/team-3.jpg',
    address: '789 Broadway, New York',
    emergencyContact: '+1234567897',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma@restoran.com',
    phone: '+1234567893',
    position: 'Kitchen Assistant',
    salary: 2000,
    hireDate: '2023-02-15',
    status: 'on-leave',
    avatar: '/img/team-4.jpg',
    address: '321 5th Ave, New York',
    emergencyContact: '+1234567896',
  },
])

const showAddModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    'on-leave': 'warning',
  }
  return colors[status] || 'secondary'
}

const viewEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
}

const deleteEmployee = (id: number) => {
  if (confirm('Are you sure you want to delete this employee?')) {
    employees.value = employees.value.filter((e) => e.id !== id)
  }
}
</script>

<template>
  <div class="employees-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">Employees Management</h2>
      <p class="text-muted">Manage restaurant employees and staff</p>
    </div>

    <!-- Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card border-success">
          <div class="stat-icon bg-success">
            <i class="fa fa-users"></i>
          </div>
          <div class="stat-content">
            <h6>Total Employees</h6>
            <h3>{{ employees.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-primary">
          <div class="stat-icon bg-primary">
            <i class="fa fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h6>Active</h6>
            <h3>{{ employees.filter((e) => e.status === 'active').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-warning">
          <div class="stat-icon bg-warning">
            <i class="fa fa-user-clock"></i>
          </div>
          <div class="stat-content">
            <h6>On Leave</h6>
            <h3>{{ employees.filter((e) => e.status === 'on-leave').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-info">
          <div class="stat-icon bg-info">
            <i class="fa fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h6>Total Payroll</h6>
            <h3>${{ employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString() }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fa fa-user-tie text-primary me-2"></i>
          Employee Directory
        </h5>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="fa fa-plus me-2"></i>Add Employee
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Contact</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in employees" :key="employee.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="employee.avatar"
                      :alt="employee.name"
                      class="rounded-circle me-2"
                      style="width: 40px; height: 40px; object-fit: cover"
                    />
                    <strong>{{ employee.name }}</strong>
                  </div>
                </td>
                <td>
                  <small class="d-block">{{ employee.email }}</small>
                  <small class="text-muted">{{ employee.phone }}</small>
                </td>
                <td>{{ employee.position }}</td>
                <td>${{ employee.salary.toLocaleString() }}</td>
                <td>{{ employee.hireDate }}</td>
                <td>
                  <span class="badge" :class="`bg-${getStatusColor(employee.status)}`">
                    {{ employee.status }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-info me-1"
                    @click="viewEmployee(employee)"
                    data-bs-toggle="modal"
                    data-bs-target="#employeeModal"
                  >
                    <i class="fa fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-primary me-1">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteEmployee(employee.id)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Employee Detail Modal -->
    <div class="modal fade" id="employeeModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedEmployee">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Employee Details</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <img
                :src="selectedEmployee.avatar"
                :alt="selectedEmployee.name"
                class="rounded-circle mb-2"
                style="width: 100px; height: 100px; object-fit: cover"
              />
              <h4>{{ selectedEmployee.name }}</h4>
              <span class="badge" :class="`bg-${getStatusColor(selectedEmployee.status)}`">
                {{ selectedEmployee.status }}
              </span>
            </div>
            <table class="table">
              <tr>
                <th>Position:</th>
                <td>{{ selectedEmployee.position }}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>{{ selectedEmployee.email }}</td>
              </tr>
              <tr>
                <th>Phone:</th>
                <td>{{ selectedEmployee.phone }}</td>
              </tr>
              <tr>
                <th>Address:</th>
                <td>{{ selectedEmployee.address }}</td>
              </tr>
              <tr>
                <th>Salary:</th>
                <td>${{ selectedEmployee.salary.toLocaleString() }}</td>
              </tr>
              <tr>
                <th>Hire Date:</th>
                <td>{{ selectedEmployee.hireDate }}</td>
              </tr>
              <tr>
                <th>Emergency Contact:</th>
                <td>{{ selectedEmployee.emergencyContact }}</td>
              </tr>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  color: #6c757d;
}
</style>
