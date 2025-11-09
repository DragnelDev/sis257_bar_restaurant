<script setup lang="ts">
import { ref } from 'vue'
import type { BookingForm } from '../../types'

const showVideoModal = ref(false)

const form = ref<BookingForm>({
  name: '',
  email: '',
  datetime: '',
  people: 1,
  specialRequest: '',
})

const handleSubmit = () => {
  console.log('Booking submitted:', form.value)
  // Aquí puedes agregar la lógica para enviar el formulario
  alert('Booking submitted successfully!')
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
}

const closeVideoModal = () => {
  showVideoModal.value = false
}
</script>

<template>
  <div class="container-xxl py-5 px-0 wow fadeInUp" data-wow-delay="0.1s">
    <div class="row g-0">
      <div class="col-md-6">
        <div class="video" style="height: 100%; min-height: 400px">
          <button type="button" class="btn-play" @click="openVideoModal">
            <span></span>
          </button>
        </div>
      </div>

      <div class="col-md-6 bg-dark d-flex align-items-center">
        <div class="p-5 wow fadeInUp" data-wow-delay="0.2s" style="width: 100%">
          <h5 class="section-title ff-secondary text-start text-primary fw-normal">
            Reservaciones
          </h5>
          <h1 class="text-white mb-4">Reserva tu mesa en linea</h1>

          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    placeholder="Your Name"
                    v-model="form.name"
                    required
                  />
                  <label for="name">Tu Nombre</label>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="Your Email"
                    v-model="form.email"
                    required
                  />
                  <label for="email">Tu Correo Electronico</label>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    type="datetime-local"
                    class="form-control"
                    id="datetime"
                    placeholder="Date & Time"
                    v-model="form.datetime"
                    required
                  />
                  <label for="datetime">Fecha y Hora</label>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating">
                  <select class="form-select" id="people" v-model.number="form.people">
                    <option value="1">1 Persona</option>
                    <option value="2">2 Persona</option>
                    <option value="3">3 Persona</option>
                    <option value="4">4 Persona</option>
                    <option value="5">5 Persona</option>
                  </select>
                  <label for="people">Numero de Personas</label>
                </div>
              </div>

              <div class="col-12">
                <div class="form-floating">
                  <textarea
                    class="form-control"
                    placeholder="Special Request"
                    id="message"
                    style="height: 100px"
                    v-model="form.specialRequest"
                  ></textarea>
                  <label for="message">Solicitud Especial</label>
                </div>
              </div>

              <div class="col-12">
                <button class="btn btn-primary w-100 py-3" type="submit">Recerva Ahora</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Video Modal -->
  <div
    v-if="showVideoModal"
    class="modal fade show d-block"
    tabindex="-1"
    @click.self="closeVideoModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-0">
        <div class="modal-header">
          <h5 class="modal-title">Video de Youtube</h5>
          <button type="button" class="btn-close" @click="closeVideoModal"></button>
        </div>
        <div class="modal-body">
          <div class="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/Ki9AGLZYpmU"
              allowfullscreen
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showVideoModal" class="modal-backdrop fade show"></div>
</template>

<style scoped>
.video {
  background: url('/img/video.jpg') center center no-repeat;
  background-size: cover;
  position: relative;
}

.btn-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.btn-play span {
  position: absolute;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-left: 20px solid white;
  border-top: 12px solid transparent;
  border-bottom: 12px solid transparent;
}

.modal.show {
  background: rgba(0, 0, 0, 0.5);
}

.ff-secondary {
  font-family: 'Pacifico', cursive;
}
</style>
