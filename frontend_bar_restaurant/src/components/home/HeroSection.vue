<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="container-xxl position-relative p-0">
    <div class="container-xxl py-5 bg-dark hero-header mb-5">
      <div class="container my-5 py-5">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 text-center text-lg-start">
            <h1 class="display-3 text-white animated slideInLeft">
              ¡Disfruta de nuestra <br />deliciosa comida!
            </h1>
            <p class="text-white animated slideInLeft mb-4 pb-2">
              Bienvenidos al lugar donde la excelencia es nuestro ingrediente secreto. Dejen que
              nuestros sabores despierten sus sentidos. Les invitamos a saborear cada momento de
              esta pausa perfecta, con platos recién preparados y servidos con pasión. ¡Deléitense!
            </p>
            <RouterLink
              to="/booking"
              class="btn btn-primary py-sm-3 px-sm-5 me-3 animated slideInLeft"
            >
              Reservar Ahora
            </RouterLink>
          </div>
          <div class="col-lg-6 text-center text-lg-end overflow-hidden">
            <img class="img-fluid" src="/img/hero.png" alt="Hero Image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-header {
  background:
    linear-gradient(rgba(15, 23, 43, 0.9), rgba(15, 23, 43, 0.9)), url('/img/bg-hero.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}

.animated {
  animation-duration: 1s;
}

.slideInLeft {
  animation-name: slideInLeft;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
