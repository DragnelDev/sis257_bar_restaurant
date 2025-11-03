<script setup lang="ts">
import { ref, computed } from 'vue'
import type { User, RegisterForm } from '../../types'

const users = ref<User[]>([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    phone: '+1234567890',
    avatar: '/img/team-1.jpg',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    phone: '+1234567891',
    avatar: '/img/team-2.jpg',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'chef',
    phone: '+1234567892',
    avatar: '/img/team-3.jpg',
    status: 'active',
    createdAt: '2024-03-10',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'waiter',
    phone: '+1234567893',
    avatar: '/img/team-4.jpg',
    status: 'inactive',
    createdAt: '2024-04-05',
  },
])

const searchQuery = ref('')
const selectedRole = ref('all')
const showAddModal = ref(false)

const newUserForm = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'customer',
})

const formError = ref('')
const loading = ref(false)

const filteredUsers = ref(users.value)

const passwordMatch = computed(() => {
  if (!newUserForm.value.confirmPassword) return true
  return newUserForm.value.password === newUserForm.value.confirmPassword
})

const filterUsers = () => {
  filteredUsers.value = users.value.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = selectedRole.value === 'all' || user.role === selectedRole.value
    return matchesSearch && matchesRole
  })
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'danger',
    chef: 'primary',
    waiter: 'info',
    customer: 'secondary',
  }
  return colors[role] || 'secondary'
}

const closeAddModal = () => {
  showAddModal.value = false
  resetForm()
}

const resetForm = () => {
  newUserForm.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
  }
  formError.value = ''
}

const handleAddUser = async () => {
  formError.value = ''

  if (!passwordMatch.value) {
    formError.value = 'Passwords do not match'
    return
  }

  if (newUserForm.value.password.length < 6) {
    formError.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    // Simulación de API - Reemplazar con tu API real
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: users.value.length + 1,
      name: newUserForm.value.name,
      email: newUserForm.value.email,
      role: newUserForm.value.role,
      phone: newUserForm.value.phone,
      avatar: '/img/team-1.jpg',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    users.value.push(newUser)
    filterUsers()
    closeAddModal()
    alert('User registered successfully!')
  } catch (err) {
    formError.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const deleteUser = (id: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    users.value = users.value.filter((u) => u.id !== id)
    filterUsers()
  }
}
</script>

<template>
  <div class="users-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">Users Management</h2>
      <p class="text-muted">Manage all system users</p>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search by name or email..."
                v-model="searchQuery"
                @input="filterUsers"
              />
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="selectedRole" @change="filterUsers">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="showAddModal = true">
              <i class="fa fa-plus me-2"></i>Add User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Grid -->
    <div class="row g-4">
      <div v-for="user in filteredUsers" :key="user.id" class="col-lg-3 col-md-4 col-sm-6">
        <div class="user-card">
          <div class="user-avatar">
            <img :src="user.avatar" :alt="user.name" />
            <span
              class="status-badge"
              :class="user.status === 'active' ? 'bg-success' : 'bg-danger'"
            >
              {{ user.status }}
            </span>
          </div>
          <div class="user-info">
            <h5>{{ user.name }}</h5>
            <p class="text-muted mb-2">{{ user.email }}</p>
            <span class="badge mb-2" :class="`bg-${getRoleColor(user.role)}`">
              {{ user.role }}
            </span>
            <p class="small text-muted mb-0">
              <i class="fa fa-calendar me-1"></i>
              Joined {{ user.createdAt }}
            </p>
          </div>
          <div class="user-actions">
            <button class="btn btn-sm btn-outline-primary">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-info">
              <i class="fa fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteUser(user.id)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredUsers.length === 0" class="text-center py-5">
      <i class="fa fa-users fa-4x text-muted mb-3"></i>
      <h5 class="text-muted">No users found</h5>
      <p class="text-muted">Try adjusting your search or filters</p>
    </div>

    <!-- Modal para Agregar Usuario -->
    <div v-if="showAddModal" class="modal fade show" tabindex="-1" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New User</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleAddUser">
              <!-- Alert de error -->
              <div
                v-if="formError"
                class="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i class="fa fa-exclamation-triangle me-2"></i>
                {{ formError }}
                <button type="button" class="btn-close" @click="formError = ''"></button>
              </div>

              <!-- Campos del formulario -->
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" v-model="newUserForm.name" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="newUserForm.email" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-control" v-model="newUserForm.phone" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Role</label>
                <select class="form-select" v-model="newUserForm.role" required>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="newUserForm.password"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': !passwordMatch }"
                  v-model="newUserForm.confirmPassword"
                  required
                />
                <div class="invalid-feedback">Passwords do not match</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddModal">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleAddUser"
              :disabled="loading || !passwordMatch"
            >
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Adding...
              </span>
              <span v-else>Add User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showAddModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.user-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

.user-info {
  padding: 20px;
  text-align: center;
}

.user-info h5 {
  margin-bottom: 5px;
  color: var(--dark);
  font-weight: 600;
}

.user-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #e9ecef;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Estilos del modal */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 10px;
  border: none;
}

.modal-header {
  background-color: var(--primary);
  color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.modal-header .btn-close {
  color: white;
  opacity: 1;
}
</style>
