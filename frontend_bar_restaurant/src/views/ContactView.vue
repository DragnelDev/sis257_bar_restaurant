<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import type { ContactForm } from '../types'
import PageHeader from '@/components/shared/PageHeader.vue'

const form = ref<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const handleSubmit = () => {
  console.log('Contact form submitted:', form.value)
  alert('Message sent successfully!')
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Contactanos"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Pagina', link: '#' },
        { text: 'Contacto', link: '/contact' },
      ]"
    />

    <div class="container-xxl py-5">
      <div class="container">
        <SectionTitle subtitle="Contactanos" title="Contactanos Para Cualquier Consulta" />

        <div class="row g-4">
          <div class="col-12">
            <div class="row gy-4">
              <div class="col-md-4">
                <h5 class="section-title ff-secondary fw-normal text-start text-primary">
                  Reserva
                </h5>
                <p>
                  <i class="fa fa-envelope-open text-primary me-2"></i>
                  reset@gmail.com
                </p>
              </div>
              <div class="col-md-4">
                <h5 class="section-title ff-secondary fw-normal text-start text-primary">
                  General
                </h5>
                <p>
                  <i class="fa fa-envelope-open text-primary me-2"></i>
                  info.reset@gmail.com
                </p>
              </div>
              <div class="col-md-4">
                <h5 class="section-title ff-secondary fw-normal text-start text-primary">
                  Teénico
                </h5>
                <p>
                  <i class="fa fa-envelope-open text-primary me-2"></i>
                  reset.tech@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-6 wow fadeIn" data-wow-delay="0.1s">
            <iframe
              class="position-relative rounded w-100 h-100"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd"
              frameborder="0"
              style="min-height: 350px; border: 0"
              allowfullscreen
              aria-hidden="false"
              tabindex="0"
            ></iframe>
          </div>

          <div class="col-md-6">
            <div class="wow fadeInUp" data-wow-delay="0.2s">
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
                      <label for="email">Tu Correo</label>
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="form-floating">
                      <input
                        type="text"
                        class="form-control"
                        id="subject"
                        placeholder="Subject"
                        v-model="form.subject"
                        required
                      />
                      <label for="subject">Asunto</label>
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="form-floating">
                      <textarea
                        class="form-control"
                        placeholder="Leave a message here"
                        id="message"
                        style="height: 150px"
                        v-model="form.message"
                        required
                      ></textarea>
                      <label for="message">Mensaje</label>
                    </div>
                  </div>

                  <div class="col-12">
                    <button class="btn btn-primary w-100 py-3" type="submit">Enviar Mensaje</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ff-secondary {
  font-family: 'Pacifico', cursive;
}
</style>
