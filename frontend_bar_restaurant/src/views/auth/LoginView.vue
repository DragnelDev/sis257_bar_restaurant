<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/index'

const usuario = ref('')
const clave = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  const authStore = useAuthStore()
  error.value = ''
  loading.value = true
  try {
    await authStore.login(usuario.value, clave.value)
    // navegación la maneja el store (router.push)
  } catch (err: unknown) {
    // Intentar extraer mensaje del error de la API
    const apiErr = err as { response?: { data?: { message?: string } } }
    const msg =
      apiErr?.response?.data?.message ||
      (err instanceof Error ? err.message : 'Credenciales incorrectas')
    error.value = String(msg)
  } finally {
    loading.value = false
  }
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

            <form @submit.prevent="onSubmit">
              <!-- Usuario -->
              <div class="mb-4">
                <label for="usuario" class="form-label">
                  <i class="fa fa-user me-2"></i>Usuario
                </label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  id="usuario"
                  v-model="usuario"
                  placeholder="Ingrese su usuario"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Contraseña -->
              <div class="mb-4">
                <label for="clave" class="form-label">
                  <i class="fa fa-lock me-2"></i>Contraseña
                </label>
                <input
                  type="password"
                  class="form-control form-control-lg"
                  id="clave"
                  v-model="clave"
                  placeholder="Ingrese su contraseña"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading">
                <span v-if="loading">
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Iniciando...
                </span>
                <span v-else>
                  <i class="fa fa-sign-in-alt me-2"></i>
                  Iniciar Sesión
                </span>
              </button>
            </form>
          </div>

          <div class="card-footer text-center py-3 bg-light">
            <RouterLink to="/" class="text-decoration-none text-primary">
              <i class="fa fa-arrow-left me-2"></i>
              Volver al Sitio Web
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
  background: linear-gradient(135deg, #fea116 0%, #d98a0b 100%);
}

.form-control:focus {
  border-color: #fea116;
  box-shadow: 0 0 0 0.2rem rgba(254, 161, 22, 0.25);
}

.btn-primary {
  background: #fea116;
  border: none;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #d98a0b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(254, 161, 22, 0.3);
}

.alert-danger {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.bg-dark {
  background-color: #1f2937 !important;
}
</style>
