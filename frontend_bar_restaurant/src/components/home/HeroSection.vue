<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="container-xxl position-relative p-0">
    <div class="container-xxl py-5 bg-light hero-header mb-5">
      <div class="container my-5 py-5">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 text-center text-lg-start">
            <h1 class="display-3 hero-title animated slideInLeft">
              ¡Tu Noche Empieza Aquí!
            </h1>
            <p class="hero-subtitle animated slideInLeft mb-4 pb-2">
              Descubre nuestra innovadora coctelería y una selección de bebidas premium. Acompaña tus
              tragos con nuestra deliciosa comida y déjate llevar por la música en vivo o nuestras
              noches de karaoke. ¡Te esperamos para crear momentos inolvidables!
            </p>
            <RouterLink
              to="/booking"
              class="btn btn-primary py-sm-3 px-sm-5 me-3 animated slideInLeft"
            >
              Reservar Ahora
            </RouterLink>
          </div>
          <div class="col-lg-6 text-center text-lg-end overflow-hidden">
            <img class="img-fluid" src="/img/hero-2.png" alt="Hero Image" />
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
<style scoped>
.hero-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  line-height: 1.02;
  color: transparent;
  background: linear-gradient(90deg, #ff4081 0%, #fea116 60%);
  -webkit-background-clip: text;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-size: 3.5rem;
  text-shadow: 0 6px 18px rgba(0,0,0,0.45);
}

.hero-subtitle {
  color: rgba(255,255,255,0.85);
  font-size: 1.05rem;
}

.hero-header .btn-primary {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%);
  border-color: transparent;
}

.hero-header .img-fluid {
  max-width: 520px;
}

@media (min-width: 1200px) {
  .hero-title { font-size: 4rem; }
}

</style>
