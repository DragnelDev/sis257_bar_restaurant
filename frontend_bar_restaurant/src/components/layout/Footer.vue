<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

const handleNewsletterSubmit = () => {
  console.log('Newsletter signup:', email.value)
  email.value = ''
}
</script>

<template>
  <footer class="container-fluid footer pt-5 mt-5">
    <div class="container py-5">
      <div class="row g-5">
        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start fw-normal mb-4">
            Compañía
          </h4>
          <a class="btn btn-link" href="">Sobre nosotros</a>
          <a class="btn btn-link" href="">Contáctanos</a>
          <a class="btn btn-link" href="">Reserva</a>
          <a class="btn btn-link" href="">Política y Privacidad</a>
          <a class="btn btn-link" href="">Términos y Condiciones</a>
        </div>

        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start fw-normal mb-4">
            Contacto
          </h4>
          <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>Nicolás Ortiz N° 70, Sucre, Bolivia</p>
          <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>+591 67854890</p>
          <p class="mb-2"><i class="fa fa-envelope me-3"></i>reset@gmail.com</p>
          <div class="d-flex pt-2">
            <a class="btn btn-social btn-instagram" href="https://www.instagram.com/resetbarbolivia/" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-instagram"></i>
            </a>
            <a class="btn btn-social btn-facebook" href="https://www.facebook.com/resetbarbolivia/" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a class="btn btn-social btn-youtube" href="">
              <i class="fab fa-youtube"></i>
            </a>
            <a class="btn btn-social btn-linkedin" href="">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start fw-normal mb-4">
            Horarios de Atención
          </h4>
          <h5 class="fw-normal">Todos los días</h5>
          <p>6:30 PM - 3:00 AM</p>
          <div class="mt-3">
            <p><small>*Horario nocturno especial</small></p>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <h4 class="section-title ff-secondary text-start fw-normal mb-4">
            Suscríbete
          </h4>
          <p>
            Recibe nuestras últimas ofertas, promociones exclusivas y las nuevas recetas de nuestros
            Chefs directamente en tu correo.
          </p>
          <div class="position-relative mx-auto" style="max-width: 400px">
            <input
              v-model="email"
              class="form-control w-100 py-3 ps-4 pe-5"
              type="email"
              placeholder="Tu correo electrónico"
            />
            <button
              type="button"
              class="btn btn-subscribe py-2 position-absolute top-0 end-0 mt-2 me-2"
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
            &copy; <a href="#">Reset</a>, <strong>Todos los derechos reservados</strong>.
            <br /><br />
            Diseñado por <a href="https://htmlcodex.com">MacDev</a>
            <br />
            Distribuido por
            <a href="https://themewagon.com" target="_blank">MacDev</a>
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
  </footer>
</template>

<style scoped>
.footer {
  background: #0A1323;
  color: #ffffff;
  border-top: 1px solid #1c2a4d;
}

.section-title {
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilo jerárquico para enlaces */
.btn-link {
  color: #b0b7c8;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  font-weight: normal;
  padding: 0;
  border: none;
  background: none;
  text-align: left;
  transition: all 0.2s ease;
}

/* Nivel 1: Sobre nosotros (más importante) */
.btn-link:nth-child(1) {
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
}

/* Nivel 2: Contáctanos */
.btn-link:nth-child(2) {
  font-size: 1rem;
  font-weight: 500;
  color: #e8eaf6;
  margin-left: 8px;
}

/* Nivel 3: Reserva */
.btn-link:nth-child(3) {
  font-size: 0.95rem;
  color: #c5cae9;
  margin-left: 16px;
}

/* Nivel 4: Política y Privacidad */
.btn-link:nth-child(4) {
  font-size: 0.9rem;
  color: #9fa8da;
  margin-left: 24px;
}

/* Nivel 4: Términos y Condiciones */
.btn-link:nth-child(5) {
  font-size: 0.9rem;
  color: #9fa8da;
  margin-left: 24px;
}

.btn-link:hover {
  color: #ffffff;
  text-decoration: underline;
  transform: translateX(2px);
}

/* Estilos específicos para botones sociales */
.btn-social {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-instagram {
  background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80);
}

.btn-facebook {
  background: #1877F2;
}

.btn-youtube {
  background: #FF0000;
}

.btn-linkedin {
  background: #0077B5;
}

.btn-social:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
}

.footer-menu a {
  margin: 0 15px;
  color: #b0b7c8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-menu a:hover {
  color: #ffffff;
  text-decoration: underline;
}

.copyright {
  color: #8a94b3;
  border-top: 2px solid #1c2a4d;
  padding-top: 25px;
  margin-top: 20px;
}

.copyright a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.copyright a:hover {
  color: #c5cae9;
  text-decoration: underline;
}

/* Estilo para "Todos los derechos reservados" en negrita */
.copyright strong {
  color: #ffffff;
  font-weight: 700;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid #2d3a66 !important;
  color: #ffffff;
  border-radius: 6px;
  backdrop-filter: blur(5px);
}

.form-control::placeholder {
  color: #8a94b3;
}

.form-control:focus {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: #4a5fb5 !important;
  box-shadow: 0 0 0 3px rgba(74, 95, 181, 0.2);
  outline: none;
  color: #ffffff;
}

.btn-subscribe {
  background: linear-gradient(135deg, #4a5fb5 0%, #3a4da0 100%);
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(74, 95, 181, 0.3);
}

.btn-subscribe:hover {
  background: linear-gradient(135deg, #5a6fc5 0%, #4a5fb5 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(74, 95, 181, 0.4);
}

p, h5 {
  color: #e8eaf6;
}

h5 {
  font-weight: 600;
  color: #ffffff !important;
}

i {
  color: #c5cae9;
}

/* Estilos específicos para el texto de horarios */
.col-lg-3:nth-child(3) h5 {
  color: #ffffff !important;
  margin-bottom: 5px;
}

.col-lg-3:nth-child(3) p {
  color: #e8eaf6;
  margin-bottom: 15px;
}

.col-lg-3:nth-child(3) small {
  color: #8a94b3;
  font-style: italic;
}

/* Ajuste para el texto descriptivo del newsletter */
.col-lg-3:nth-child(4) p {
  color: #b0b7c8;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .footer {
    text-align: center;
  }

  .btn-link {
    text-align: center;
    margin-left: 0 !important;
  }

  .footer-menu a {
    display: block;
    margin: 10px 0;
  }
}
</style>
