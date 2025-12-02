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
  <div class="login-wrapper">
    <!-- Fondo con degradado y decoraciones -->
    <div class="background-decorator left"></div>
    <div class="background-decorator right"></div>

    <div class="login-container">
      <div class="login-content">
        <!-- Panel Izquierdo - Branding -->
        <div class="branding-section">
          <div class="brand-icon-container" aria-hidden="true">
            <span class="icon-bubble icon-utensils" title="Comida"><i class="fa fa-utensils"></i></span>
            <span class="icon-bubble icon-mic" title="Live"><i class="fa fa-microphone"></i></span>
            <span class="icon-bubble icon-glass" title="Bebidas"><i class="fa fa-wine-glass"></i></span>
          </div>
          <h1 class="brand-title">RESET</h1>
          <p class="brand-subtitle">RESTO BAR CONCERT</p>
          <div class="brand-features">
            <div class="feature-item">
              <i class="fa fa-check-circle"></i>
              <span>Gestión Integral</span>
            </div>
            <div class="feature-item">
              <i class="fa fa-check-circle"></i>
              <span>Acceso Seguro</span>
            </div>
            <div class="feature-item">
              <i class="fa fa-check-circle"></i>
              <span>Panel Profesional</span>
            </div>
          </div>
        </div>

        <!-- Panel Derecho - Formulario -->
        <div class="form-section">
          <div class="form-header">
            <h2>Iniciar Sesión</h2>
            <p>Acceso al panel de administración</p>
          </div>

          <div v-if="error" class="alert-error">
            <i class="fa fa-exclamation-triangle"></i>
            <div class="alert-content">
              <strong>Error de Autenticación</strong>
              <p>{{ error }}</p>
            </div>
            <button class="alert-close" @click="error = ''" type="button">
              <i class="fa fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="onSubmit" class="login-form">
            <div class="form-group">
              <label for="usuario">Usuario</label>
              <div class="input-wrapper">
                <i class="fa fa-user"></i>
                <input
                  ref="usuarioInput"
                  type="text"
                  id="usuario"
                  v-model="usuario"
                  placeholder="Ingrese su usuario"
                  required
                  :disabled="loading"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="clave">Contraseña</label>
              <div class="input-wrapper">
                <i class="fa fa-lock"></i>
                <input
                  type="password"
                  id="clave"
                  v-model="clave"
                  placeholder="Ingrese su contraseña"
                  required
                  :disabled="loading"
                  class="form-input"
                />
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner-wrapper">
                <span class="spinner"></span>
                Iniciando Sesión...
              </span>
              <span v-else>
                <i class="fa fa-sign-in-alt"></i>
                Iniciar Sesión
              </span>
            </button>
          </form>

          <div class="form-footer">
            <RouterLink to="/" class="back-link">
              <i class="fa fa-arrow-left"></i>
              Volver al Sitio Web
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172b 0%, #1a1f3a 50%, #0f172b 100%);
  position: relative;
  overflow: hidden;
}

/* Decoradores de fondo */
.background-decorator {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  pointer-events: none;
}

.background-decorator.left {
  width: 400px;
  height: 400px;
  background: #ff4081;
  top: -100px;
  left: -100px;
}

.background-decorator.right {
  width: 500px;
  height: 500px;
  background: #fea116;
  bottom: -150px;
  right: -150px;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.login-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
}

/* ============ SECCIÓN DE BRANDING ============ */
.branding-section {
  color: white;
  padding: 40px;
  position: relative;
  padding-top: 140px; /* espacio para los iconos encima del título */
  text-align: center;
}

.brand-icon-container {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 22px;
  z-index: 3;
  pointer-events: none;
}

.icon-bubble {
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  transform-origin: center center;
  animation: float 3s ease-in-out infinite;
}

.icon-bubble i {
  color: #ffffff;
  font-size: 44px;
}

.icon-bubble.icon-utensils { background: linear-gradient(135deg, #ff4081 0%, #f50057 100%); }
.icon-bubble.icon-mic { background: linear-gradient(135deg, #fea116 0%, #ffb347 100%); }
.icon-bubble.icon-glass { background: linear-gradient(135deg, #7c3aed 0%, #ff4081 100%); }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.brand-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #ff4081 0%, #fea116 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #ff4081 0%, #fea116 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  font-weight: 300;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.feature-item:hover {
  color: #ff4081;
  transform: translateX(10px);
}

.feature-item i {
  color: #fea116;
  font-size: 20px;
}

/* ============ SECCIÓN DE FORMULARIO ============ */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff4081 0%, #fea116 100%);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #0f172b;
  margin-bottom: 10px;
}

.form-header p {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

/* ============ ALERTA DE ERROR ============ */
.alert-error {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 16px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, rgba(255, 64, 129, 0.1) 0%, rgba(254, 161, 22, 0.1) 100%);
  border: 1px solid #ff4081;
  border-radius: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error i {
  font-size: 24px;
  color: #ff4081;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  color: #ff4081;
  font-weight: 700;
  margin-bottom: 5px;
}

.alert-content p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.alert-close {
  background: none;
  border: none;
  color: #ff4081;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.alert-close:hover {
  transform: rotate(90deg);
}

/* ============ FORMULARIO ============ */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172b;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.input-wrapper i {
  position: absolute;
  left: 14px;
  color: #fea116;
  font-size: 18px;
}

.form-input {
  flex: 1;
  padding: 12px 14px 12px 45px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #0f172b;
  outline: none;
  font-family: inherit;
}

.form-input::placeholder {
  color: #999;
}

.input-wrapper:focus-within {
  border-color: #ff4081;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1);
  background: #fff;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============ BOTÓN SUBMIT ============ */
.btn-submit {
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  box-shadow: 0 4px 15px rgba(255, 64, 129, 0.3);
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 64, 129, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============ FOOTER ============ */
.form-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ff4081;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 14px;
}

.back-link:hover {
  color: #f50057;
  gap: 12px;
}

.back-link i {
  font-size: 16px;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .login-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .branding-section {
    display: none;
  }

  .form-section {
    padding: 30px 20px;
    margin: 0 20px;
  }

  .brand-title {
    font-size: 36px;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .background-decorator {
    display: none;
  }

  /* Reducir tamaño de icon bubbles en pantallas pequeñas */
  .brand-icon-container {
    top: 8px;
    gap: 14px;
  }

  .icon-bubble {
    width: 76px;
    height: 76px;
  }

  .icon-bubble i {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 24px 16px;
    margin: 0 10px;
  }

  .form-header h2 {
    font-size: 20px;
  }

  .form-header p {
    font-size: 12px;
  }

  .btn-submit {
    font-size: 14px;
    padding: 12px 16px;
  }

  .brand-icon-container {
    top: 6px;
    gap: 10px;
  }

  .icon-bubble {
    width: 60px;
    height: 60px;
  }

  .icon-bubble i {
    font-size: 20px;
  }
}
</style>
