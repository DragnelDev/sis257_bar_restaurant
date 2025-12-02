<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

const handleNewsletterSubmit = () => {
  console.log('Newsletter signup:', email.value)
  email.value = ''
}
</script>

<template>
  <div class="container-fluid bg-light text-dark footer pt-5 mt-5">
    <div class="container py-5">
      <div class="row g-5">
        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start text-primary fw-normal mb-4">
            Compañía
          </h4>
          <a class="btn btn-link" href="">Sobre nosotros</a>
          <a class="btn btn-link" href="">Contáctanos</a>
          <a class="btn btn-link" href="">Reserva</a>
          <a class="btn btn-link" href="">Política y Provacidad</a>
          <a class="btn btn-link" href="">Términos y Condiciones</a>
        </div>

        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start text-primary fw-normal mb-4">
            Contacto
          </h4>
          <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>Calle Loa 70, Sucre, Bolivia</p>
          <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>+591 67854890</p>
          <p class="mb-2"><i class="fa fa-envelope me-3"></i>reset@gmail.com</p>
          <div class="d-flex pt-2">
            <a class="btn btn-outline-light btn-social" href="">
              <i class="fab fa-twitter"></i>
            </a>
            <a class="btn btn-outline-light btn-social" href="">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a class="btn btn-outline-light btn-social" href="">
              <i class="fab fa-youtube"></i>
            </a>
            <a class="btn btn-outline-light btn-social" href="">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start text-primary fw-normal mb-4">
            Apertura
          </h4>
          <h5 class="text-light fw-normal">Lunes - Sábado</h5>
          <p>09AM - 11PM</p>
          <h5 class="text-light fw-normal">Domingo</h5>
          <p>10AM - 08PM</p>
        </div>

        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start text-primary fw-normal mb-4">
            Suscríbete
          </h4>
          <p>
            Recibe nuestras últimas ofertas, promociones exclusivas y las nuevas recetas de nuestros
            Chefs directamente en tu correo.
          </p>
          <div class="position-relative mx-auto" style="max-width: 400px">
            <input
              v-model="email"
              class="form-control border-primary w-100 py-3 ps-4 pe-5"
              type="email"
              placeholder="Your email"
            />
            <button
              type="button"
              class="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
              @click="handleNewsletterSubmit"
            >
              Suscribirme
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="copyright">
        <div class="row">
          <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
            &copy; <a class="border-bottom" href="#">Reset</a>, Todos los derechos reservados.
            <br /><br />
            Diseñado por <a class="border-bottom" href="https://htmlcodex.com">MacDev</a>
            <br />
            Distribuido por
            <a class="border-bottom" href="https://themewagon.com" target="_blank">MacDev</a>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <div class="footer-menu">
              <a href="">Inicio</a>
              <a href="">Cookies</a>
              <a href="">Ayuda</a>
              <a href="">Preguntas Frecuentes</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-link {
  color: #fff;
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
}

.btn-social {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.footer-menu a {
  margin: 0 15px;
  color: #fff;
  text-decoration: none;
}
</style>
