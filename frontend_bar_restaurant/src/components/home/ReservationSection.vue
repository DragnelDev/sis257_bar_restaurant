<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { BookingForm } from '../../types'

const videoModalRef = ref<HTMLDivElement>()
const showVideoModal = ref(false)
const isVideoPlaying = ref(false)

const form = ref<BookingForm>({
  name: '',
  email: '',
  datetime: '',
  people: 1,
  specialRequest: '',
})

const handleSubmit = () => {
  console.log('Reserva enviada:', form.value)
  alert('¡Reserva enviada con éxito! Te contactaremos pronto.')
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    datetime: '',
    people: 1,
    specialRequest: '',
  }
}

const openVideoModal = () => {
  showVideoModal.value = true
  setTimeout(() => {
    isVideoPlaying.value = true
  }, 300)
}

const closeVideoModal = () => {
  isVideoPlaying.value = false
  showVideoModal.value = false
}

// Extraer ID del video de YouTube
const youtubeId = '_dui6BUmMBg'
const autoplayVideoUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&rel=0&showinfo=0&modestbranding=1`
const fullscreenVideoUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`

// Cerrar modal al hacer clic fuera
const handleOutsideClick = (event: MouseEvent) => {
  if (videoModalRef.value && !videoModalRef.value.contains(event.target as Node)) {
    closeVideoModal()
  }
}

// Manejar tecla Escape
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showVideoModal.value) {
    closeVideoModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('click', handleOutsideClick)
})

// Calcular fecha mínima (hoy) para el input datetime
const getMinDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
</script>

<template>
  <section class="booking-section py-5">
    <div class="container-xxl">
      <div class="row g-0 shadow-lg rounded-4 overflow-hidden">
        <!-- Video Player Section (Lado Izquierdo) -->
        <div class="col-lg-6">
          <div class="video-player-container position-relative">
            <!-- Video que se reproduce automáticamente -->
            <div class="video-wrapper">
              <iframe
                class="video-iframe"
                :src="autoplayVideoUrl"
                title="Reset Bar Experience"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Información del video -->
            <div class="video-info text-center p-4">
              <h5 class="mb-2 text-white fw-bold">
                <i class="fas fa-play-circle me-2" style="color: #FFB6C1;"></i>
                ¡Vive la Experiencia Reset Bar!
              </h5>
              <p class="text-light mb-3">Descubre el ambiente que te espera</p>
              <button @click="openVideoModal" class="btn-play-fullscreen">
                <i class="fas fa-expand-alt me-2"></i>Ver en Pantalla Completa
              </button>

              <!-- Créditos del video -->
              <div class="video-credits mt-4">
                <small class="text-light opacity-75">
                  <i class="fas fa-video me-1"></i>
                  Video promocional oficial • Reset Bar Sucre
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Reserva (Lado Derecho) -->
        <div class="col-lg-6">
          <div class="booking-form-container p-5 h-100">
            <!-- Header del formulario -->
            <div class="booking-header text-center mb-4">
              <div class="badge booking-badge px-3 py-2 mb-3 rounded-pill">
                <i class="fas fa-calendar-check me-2"></i>Reserva tu Mesa
              </div>
              <h1 class="booking-title fw-bold mb-2">¡Reserva Ahora!</h1>
              <p class="booking-subtitle mb-0">
                Asegura tu lugar en la mejor RestoBar de Sucre
              </p>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <div class="row g-3">
                <!-- Nombre -->
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="name" class="form-label fw-bold">
                      <i class="fas fa-user me-2"></i>Tú Nombre
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-user text-white"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control border-start-0"
                        id="name"
                        placeholder="Ej: Juan Pérez"
                        v-model="form.name"
                        required
                      />
                    </div>
                    <small class="form-text">Nombre completo como aparece en tu CI</small>
                  </div>
                </div>

                <!-- Email -->
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="email" class="form-label fw-bold">
                      <i class="fas fa-envelope me-2"></i>Tú Correo
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-envelope text-white"></i>
                      </span>
                      <input
                        type="email"
                        class="form-control border-start-0"
                        id="email"
                        placeholder="ejemplo@email.com"
                        v-model="form.email"
                        required
                      />
                    </div>
                    <small class="form-text">Correo electrónico válido</small>
                  </div>
                </div>

                <!-- Fecha y Hora -->
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="datetime" class="form-label fw-bold">
                      <i class="fas fa-calendar-alt me-2"></i>Fecha y Hora
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-clock text-white"></i>
                      </span>
                      <input
                        type="datetime-local"
                        class="form-control border-start-0"
                        id="datetime"
                        :min="getMinDateTime()"
                        v-model="form.datetime"
                        required
                      />
                    </div>
                    <div class="mt-2">
                      <small class="time-info">
                        <i class="fas fa-clock me-1"></i>Horario: 18:00 - 03:00
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Número de Personas -->
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="people" class="form-label fw-bold">
                      <i class="fas fa-users me-2"></i>N° de Personas
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-user-friends text-white"></i>
                      </span>
                      <select
                        class="form-select border-start-0"
                        id="people"
                        v-model.number="form.people"
                      >
                        <option value="1">1 Persona</option>
                        <option value="2">2 Personas</option>
                        <option value="3">3 Personas</option>
                        <option value="4">4 Personas</option>
                        <option value="5">5 Personas</option>
                        <option value="6">6 Personas</option>
                        <option value="7">7 Personas</option>
                        <option value="8">8 Personas</option>
                        <option value="9">9 Personas</option>
                        <option value="10">10 Personas</option>
                      </select>
                    </div>
                    <small class="form-text">Máximo 10 personas por reserva online</small>
                  </div>
                </div>

                <!-- Solicitud Especial -->
                <div class="col-12">
                  <div class="form-group">
                    <label for="message" class="form-label fw-bold">
                      <i class="fas fa-star me-2"></i>Solicitud Especial
                    </label>
                    <div class="input-group">
                      <span class="input-group-text align-items-start pt-3">
                        <i class="fas fa-edit text-white"></i>
                      </span>
                      <textarea
                        class="form-control border-start-0"
                        placeholder="¿Tienes alguna solicitud especial? (Cumpleaños, Aniversario, etc.)"
                        id="message"
                        style="height: 120px; resize: none;"
                        v-model="form.specialRequest"
                      ></textarea>
                    </div>
                    <small class="form-text">Opcional - Cuéntanos si es una ocasión especial</small>
                  </div>
                </div>

                <!-- Información importante -->
                <div class="col-12">
                  <div class="important-info">
                    <div class="d-flex align-items-center">
                      <i class="fas fa-exclamation-circle me-3 fs-4"></i>
                      <div>
                        <h6 class="mb-1 fw-bold">¡Importante!</h6>
                        <p class="mb-0">
                          Para reservas de más de 10 personas, contáctanos al
                          <strong>65279500</strong> o
                          <strong>67600710</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botón de envío -->
                <div class="col-12">
                  <button class="btn-submit w-100 py-3 fw-bold fs-5" type="submit">
                    <i class="fas fa-check-circle me-2"></i>Confirmar Reserva
                  </button>
                </div>

                <!-- Contacto rápido -->
                <div class="col-12 text-center mt-3">
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <p class="contact-info mb-1">
                        <i class="fas fa-phone-alt me-2"></i>
                        <strong>Reservas:</strong> 65279500
                      </p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <p class="contact-info mb-1">
                        <i class="fas fa-phone-alt me-2"></i>
                        <strong>WhatsApp:</strong> 67600710
                      </p>
                    </div>
                  </div>
                  <small class="location-info">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    Calle Nicolás Ortiz N°70, Sucre - Bolivia
                  </small>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Video en Pantalla Completa -->
    <div
      v-if="showVideoModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.95)"
    >
      <div class="modal-dialog modal-dialog-centered modal-xl" ref="videoModalRef">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-header border-0">
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="closeVideoModal"
            ></button>
          </div>
          <div class="modal-body p-0">
            <div class="ratio ratio-16x9">
              <iframe
                :src="isVideoPlaying ? fullscreenVideoUrl : ''"
                title="Reset Bar Experience"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div class="modal-footer border-0 justify-content-center">
            <button class="btn btn-outline-light" @click="closeVideoModal">
              <i class="fas fa-times me-2"></i>Cerrar Video
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-section {
  background: linear-gradient(135deg, #FFE6F2 0%, #FFCCE6 50%, #FFB3D9 100%);
  position: relative;
  overflow: hidden;
}

/* Video Player */
.video-player-container {
  height: 100%;
  min-height: 650px;
  background: #000;
  border-radius: 15px 0 0 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 75%;
  overflow: hidden;
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Información del video */
.video-info {
  background: linear-gradient(135deg, #FF66B2 0%, #FF3385 100%);
  border-top: 3px solid #FF0066;
  height: 25%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.video-info h5 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.video-info p {
  font-size: 1rem;
  margin-bottom: 15px;
  opacity: 0.95;
}

.btn-play-fullscreen {
  background: linear-gradient(45deg, #FF3385, #FF66B2);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-play-fullscreen:hover {
  background: linear-gradient(45deg, #FF0066, #FF3385);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 0, 102, 0.4);
  border-color: rgba(255, 255, 255, 0.5);
}

.video-credits {
  margin-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 10px;
  width: 100%;
  text-align: center;
}

/* Formulario */
.booking-form-container {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF0F8 100%);
  border-radius: 0 15px 15px 0;
  box-shadow: -5px 0 30px rgba(255, 102, 178, 0.2);
  border-left: 5px solid #FF66B2;
}

/* Header del formulario */
.booking-badge {
  background: linear-gradient(45deg, #FF66B2, #FF3385);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 102, 178, 0.3);
}

.booking-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.8rem;
  background: linear-gradient(45deg, #FF0066, #FF66B2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(255, 102, 178, 0.2);
}

.booking-subtitle {
  color: #FF3385;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Estilos de formulario */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  margin-bottom: 0.5rem;
  display: block;
  font-size: 1.1rem;
  color: #FF3385;
}

.form-label i {
  color: #FF66B2;
}

.input-group-text {
  background: linear-gradient(45deg, #FF66B2, #FF3385);
  border: 2px solid #FF66B2;
  color: white;
  transition: all 0.3s ease;
  min-width: 50px;
  justify-content: center;
}

.input-group:focus-within .input-group-text {
  background: linear-gradient(45deg, #FF0066, #FF3385);
  border-color: #FF0066;
}

.form-control,
.form-select {
  border: 2px solid #FFB3D9;
  background-color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  padding: 12px 15px;
  font-size: 1rem;
  color: #333;
}

.form-control:focus,
.form-select:focus {
  border-color: #FF66B2;
  box-shadow: 0 0 0 0.25rem rgba(255, 102, 178, 0.25);
  background-color: white;
}

.form-control::placeholder {
  color: #FF99CC;
  opacity: 0.7;
}

.border-start-0 {
  border-left: 0 !important;
}

.form-text {
  color: #FF66B2;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

.time-info {
  color: #FF0066;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.time-info i {
  color: #FF3385;
}

/* Información importante */
.important-info {
  background: linear-gradient(135deg, #FFE6F2, #FFCCE6);
  border: 2px solid #FF99CC;
  border-radius: 10px;
  padding: 15px;
}

.important-info i {
  color: #FF3385;
}

.important-info h6 {
  color: #FF0066;
}

.important-info p {
  color: #FF3385;
}

.important-info strong {
  color: #FF0066;
}

/* Botón de envío */
.btn-submit {
  background: linear-gradient(45deg, #FF0066, #FF66B2);
  border: none;
  border-radius: 10px;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 102, 178, 0.4);
  background: linear-gradient(45deg, #FF3385, #FF0066);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-submit:active {
  transform: translateY(-1px);
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.btn-submit:hover::before {
  left: 100%;
}

/* Información de contacto */
.contact-info {
  color: #FF3385;
  font-size: 0.95rem;
}

.contact-info i {
  color: #FF66B2;
}

.contact-info strong {
  color: #FF0066;
}

.location-info {
  color: #FF66B2;
  font-size: 0.9rem;
}

.location-info i {
  color: #FF3385;
}

/* Modal de video */
.modal-content {
  animation: modalSlideIn 0.4s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 992px) {
  .video-player-container,
  .booking-form-container {
    min-height: auto;
    border-radius: 15px !important;
    margin-bottom: 20px;
  }

  .video-wrapper {
    height: 400px;
  }

  .video-info {
    height: auto;
    padding: 20px 15px;
  }

  .booking-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .video-player-container {
    min-height: auto;
  }

  .video-wrapper {
    height: 350px;
  }

  .video-info h5 {
    font-size: 1.1rem;
  }

  .video-info p {
    font-size: 0.9rem;
  }

  .btn-play-fullscreen {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .video-wrapper {
    height: 300px;
  }

  .booking-title {
    font-size: 1.8rem;
  }

  .form-control,
  .form-select {
    padding: 10px 12px;
    font-size: 0.95rem;
  }

  .btn-submit {
    padding: 12px;
    font-size: 1.1rem;
  }

  .video-info {
    padding: 15px 10px;
  }

  .video-info h5 {
    font-size: 1rem;
  }

  .btn-play-fullscreen {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>
