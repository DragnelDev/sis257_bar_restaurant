<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RegisterForm } from '../../types'

const router = useRouter()

const form = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'customer',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordMatch = computed(() => {
  if (!form.value.confirmPassword) return true
  return form.value.password === form.value.confirmPassword
})

const handleSubmit = async () => {
  error.value = ''

  if (!passwordMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    // Simulación de registro - Reemplazar con tu API real
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert('Registration successful! Please login.')
    router.push('/login')
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
    <div class="row w-100">
      <div class="col-lg-5 col-md-7 col-sm-9 mx-auto">
        <div class="card shadow-lg border-0 rounded-lg">
          <div class="card-header bg-primary text-white text-center py-4">
            <h1 class="mb-0"><i class="fa fa-utensils me-2"></i>Restoran</h1>
            <p class="mb-0 mt-2">Create New Account</p>
          </div>

          <div class="card-body p-5">
            <!-- Alert de error -->
            <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="fa fa-exclamation-triangle me-2"></i>
              {{ error }}
              <button
                type="button"
                class="btn-close"
                @click="error = ''"
                aria-label="Close"
              ></button>
            </div>

            <form @submit.prevent="handleSubmit">
              <!-- Full Name -->
              <div class="mb-3">
                <label for="name" class="form-label">
                  <i class="fa fa-user me-2"></i>Full Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="form.name"
                  placeholder="Enter your full name"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">
                  <i class="fa fa-envelope me-2"></i>Email Address
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="form.email"
                  placeholder="Enter your email"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Phone -->
              <div class="mb-3">
                <label for="phone" class="form-label">
                  <i class="fa fa-phone me-2"></i>Phone Number
                </label>
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  v-model="form.phone"
                  placeholder="Enter your phone number"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Role -->
              <div class="mb-3">
                <label for="role" class="form-label">
                  <i class="fa fa-user-tag me-2"></i>Account Type
                </label>
                <select class="form-select" id="role" v-model="form.role" :disabled="loading">
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                </select>
              </div>

              <div class="row">
                <!-- Password -->
                <div class="col-md-6 mb-3">
                  <label for="password" class="form-label">
                    <i class="fa fa-lock me-2"></i>Password
                  </label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="form.password"
                      placeholder="Password"
                      required
                      :disabled="loading"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                      :disabled="loading"
                    >
                      <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="col-md-6 mb-3">
                  <label for="confirmPassword" class="form-label">
                    <i class="fa fa-lock me-2"></i>Confirm Password
                  </label>
                  <div class="input-group">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': !passwordMatch && form.confirmPassword }"
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      placeholder="Confirm password"
                      required
                      :disabled="loading"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      :disabled="loading"
                    >
                      <i :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                    </button>
                    <div v-if="!passwordMatch && form.confirmPassword" class="invalid-feedback">
                      Passwords do not match
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-lg w-100 mt-3"
                :disabled="loading || !passwordMatch"
              >
                <span v-if="loading">
                  <span class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </span>
                  Creating Account...
                </span>
                <span v-else>
                  <i class="fa fa-user-plus me-2"></i>
                  Create Account
                </span>
              </button>
            </form>
          </div>

          <div class="card-footer text-center py-3 bg-light">
            <div class="mb-2">
              Already have an account?
              <RouterLink to="/login" class="text-primary text-decoration-none fw-bold">
                Sign In
              </RouterLink>
            </div>
            <RouterLink to="/" class="text-decoration-none text-muted">
              <i class="fa fa-arrow-left me-2"></i>
              Back to Website
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, var(--primary) 0%, #d98a0b 100%);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem rgba(254, 161, 22, 0.25);
}

.btn-primary {
  background: var(--primary);
  border: none;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #d98a0b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(254, 161, 22, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
}
</style>
