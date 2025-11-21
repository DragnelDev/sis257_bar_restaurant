<script setup lang="ts">
import { ref, onMounted } from 'vue' // Se importa onMounted
import { useAuthStore } from '@/stores/index'

const usuario = ref('')
const clave = ref('')
const error = ref('')
const loading = ref(false)

// Ref para el foco automático
const usuarioInput = ref<HTMLInputElement | null>(null)

async function onSubmit() {
  const authStore = useAuthStore()
  error.value = ''
  loading.value = true
  try {
    await authStore.login(usuario.value, clave.value)
  } catch (err: unknown) {
    const apiErr = err as { response?: { data?: { message?: string } } }
    const msg =
      apiErr?.response?.data?.message ||
      (err instanceof Error ? err.message : 'Credenciales incorrectas')
    error.value = String(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Foco automático al cargar el componente
  usuarioInput.value?.focus()
})
</script>

<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center custom-bg">
    <div class="row w-100">
      <div class="col-lg-4 col-md-6 col-sm-8 mx-auto">
        <div class="card shadow-lg border-0 rounded-lg custom-card">
          <div class="card-body p-5">
            <div class="text-center mb-5">
              <i class="fa fa-utensils fa-3x text-primary mb-2"></i>
              <h2 class="fw-bold mb-0 text-dark">Restaurante Admin</h2>
              <p class="text-muted mt-2">Acceso al panel de administración</p>
            </div>

            <div v-if="error" class="alert custom-alert-danger fade show" role="alert">
              <i class="fa fa-exclamation-circle me-2"></i>
              {{ error }}
              <button
                type="button"
                class="btn-close"
                @click="error = ''"
                aria-label="Cerrar alerta"
              ></button>
            </div>

            <form @submit.prevent="onSubmit">
              <div class="mb-4">
                <label for="usuario" class="form-label visually-hidden">Usuario</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text"><i class="fa fa-user"></i></span>
                  <input
                    ref="usuarioInput"
                    type="text"
                    class="form-control"
                    id="usuario"
                    v-model="usuario"
                    placeholder="Ingrese su usuario"
                    required
                    :disabled="loading"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label for="clave" class="form-label visually-hidden">Contraseña</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text"><i class="fa fa-lock"></i></span>
                  <input
                    type="password"
                    class="form-control"
                    id="clave"
                    v-model="clave"
                    placeholder="Ingrese su contraseña"
                    required
                    :disabled="loading"
                  />
                </div>
              </div>

              <div class="d-grid mt-4">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                  <span v-if="loading">
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Iniciando Sesión...
                  </span>
                  <span v-else>
                    <i class="fa fa-sign-in-alt me-2"></i>
                    Iniciar Sesión
                  </span>
                </button>
              </div>
            </form>
          </div>

          <div class="text-center py-3">
            <RouterLink to="/" class="text-decoration-none text-primary fw-bold">
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
/* Fondo: Usamos un color o degradado más sutil que el dark sólido */
.custom-bg {
  background-color: #f7f7f7;
  /* O un degradado suave: */
  /* background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%); */
}

.custom-card {
  border-radius: 12px;
  /* Sombra más pronunciada y suave (tendencia actual) */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid #dee2e6; /* Borde más sutil */
}

/* Color primario del restaurante (naranja) */
.text-primary {
  color: #fea116 !important;
}

.btn-primary {
  background: #fea116;
  border-color: #fea116;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-primary:hover {
  background: #d98a0b;
  border-color: #d98a0b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(254, 161, 22, 0.3);
}

/* Estilos de Input Group */
.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
  color: #6c757d;
}
.form-control:focus {
  border-color: #fea116;
  box-shadow: 0 0 0 0.2rem rgba(254, 161, 22, 0.25);
}

/* Estilo de Alerta de Error más suave */
.custom-alert-danger {
  padding: 1rem 1rem;
  margin-bottom: 1.5rem;
  background-color: #fff3f3; /* Fondo muy claro */
  border: 1px solid #f09a9a; /* Borde rojo suave */
  color: #c94a4a; /* Texto rojo oscuro */
  border-radius: 8px;
  position: relative;
}
</style>
