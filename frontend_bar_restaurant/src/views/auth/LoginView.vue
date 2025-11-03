<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import type { LoginForm } from '../../types'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const form = ref<LoginForm>({
  email: '',
  password: '',
  rememberMe: false,
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const success = await login(form.value)

    if (success) {
      const redirect = (route.query.redirect as string) || '/admin'
      router.push(redirect)
    } else {
      error.value = 'Invalid email or password'
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
    <div class="row w-100">
      <div class="col-lg-4 col-md-6 col-sm-8 mx-auto">
        <div class="card shadow-lg border-0 rounded-lg">
          <div class="card-header bg-primary text-white text-center py-4">
            <h1 class="mb-0"><i class="fa fa-utensils me-2"></i>Restoran</h1>
            <p class="mb-0 mt-2">Admin Panel Login</p>
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

            <!-- Credenciales de prueba -->
            <div class="alert alert-info" role="alert">
              <strong>Demo Credentials:</strong><br />
              Email: admin@restoran.com<br />
              Password: admin123
            </div>

            <form @submit.prevent="handleSubmit">
              <!-- Email -->
              <div class="mb-4">
                <label for="email" class="form-label">
                  <i class="fa fa-envelope me-2"></i>Email Address
                </label>
                <input
                  type="email"
                  class="form-control form-control-lg"
                  id="email"
                  v-model="form.email"
                  placeholder="Enter your email"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Password -->
              <div class="mb-4">
                <label for="password" class="form-label">
                  <i class="fa fa-lock me-2"></i>Password
                </label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control form-control-lg"
                    id="password"
                    v-model="form.password"
                    placeholder="Enter your password"
                    required
                    :disabled="loading"
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="togglePasswordVisibility"
                    :disabled="loading"
                  >
                    <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    v-model="form.rememberMe"
                    :disabled="loading"
                  />
                  <label class="form-check-label" for="rememberMe"> Remember Me </label>
                </div>
                <a href="#" class="text-primary text-decoration-none"> Forgot Password? </a>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading">
                <span v-if="loading">
                  <span class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </span>
                  Signing In...
                </span>
                <span v-else>
                  <i class="fa fa-sign-in-alt me-2"></i>
                  Sign In
                </span>
              </button>
            </form>
          </div>

          <div class="card-footer text-center py-3 bg-light">
            <RouterLink to="/" class="text-decoration-none text-primary">
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

.btn-primary:hover {
  background: #d98a0b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(254, 161, 22, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
}

.input-group .btn-outline-secondary {
  border-color: #ced4da;
}

.input-group .btn-outline-secondary:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
  color: #495057;
}
</style>
