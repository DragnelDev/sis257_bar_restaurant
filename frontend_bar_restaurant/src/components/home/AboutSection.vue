<script setup lang="ts">
import { ref, onMounted } from 'vue'

const yearsExperience = ref(0)
const masterChefs = ref(0)

const animateCounter = (target: number, setter: (val: number) => void, duration: number = 2000) => {
  let start = 0
  const increment = target / (duration / 16)

  const timer = setInterval(() => {
    start += increment
    if (start >= target) {
      setter(target)
      clearInterval(timer)
    } else {
      setter(Math.floor(start))
    }
  }, 16)
}

onMounted(() => {
  // Animar contadores cuando el componente se monta
  setTimeout(() => {
    animateCounter(15, (val) => (yearsExperience.value = val))
    animateCounter(50, (val) => (masterChefs.value = val))
  }, 300)
})
</script>

<template>
  <div class="container-xxl py-5">
    <div class="container">
      <div class="row g-5 align-items-center">
        <div class="col-lg-6">
          <div class="row g-3">
            <div class="col-6 text-start">
              <img
                class="img-fluid rounded w-100 wow zoomIn"
                data-wow-delay="0.1s"
                src="/img/about-1.jpg"
                alt="About 1"
              />
            </div>
            <div class="col-6 text-start">
              <img
                class="img-fluid rounded w-75 wow zoomIn"
                data-wow-delay="0.3s"
                src="/img/about-2.jpg"
                style="margin-top: 25%"
                alt="About 2"
              />
            </div>
            <div class="col-6 text-end">
              <img
                class="img-fluid rounded w-75 wow zoomIn"
                data-wow-delay="0.5s"
                src="/img/about-3.jpg"
                alt="About 3"
              />
            </div>
            <div class="col-6 text-end">
              <img
                class="img-fluid rounded w-100 wow zoomIn"
                data-wow-delay="0.7s"
                src="/img/about-4.jpg"
                alt="About 4"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <h5 class="section-title ff-secondary text-start text-primary fw-normal">
            Sobre nosotros
          </h5>
          <h1 class="mb-4">
            Bienvenido a <i class="fa fa-utensils text-primary me-2"></i>Restaurante
          </h1>
          <p class="mb-4">
            ¡Bienvenidos! Relájense, llegaron al rincón donde la comida sabe a felicidad. Prepárense
            para una aventura culinaria inolvidable. En nuestra mesa, la comida se sirve con amor.
            Hoy nos encargaremos de deleitar sus sentidos y hacer de este momento algo especial.
          </p>
          <p class="mb-4">
            Más que una comida, les espera una experiencia. Aquí, la frescura y el sabor son
            nuestros ingredientes principales. ¡Siéntanse como en casa!
          </p>

          <div class="row g-4 mb-4">
            <div class="col-sm-6">
              <div class="d-flex align-items-center border-start border-5 border-primary px-3">
                <h1 class="flex-shrink-0 display-5 text-primary mb-0">
                  {{ yearsExperience }}
                </h1>
                <div class="ps-4">
                  <p class="mb-0">Años de</p>
                  <h6 class="text-uppercase mb-0">Experiencia</h6>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="d-flex align-items-center border-start border-5 border-primary px-3">
                <h1 class="flex-shrink-0 display-5 text-primary mb-0">
                  {{ masterChefs }}
                </h1>
                <div class="ps-4">
                  <p class="mb-0">Popular</p>
                  <h6 class="text-uppercase mb-0">Maestros chefs</h6>
                </div>
              </div>
            </div>
          </div>

          <a class="btn btn-primary py-3 px-5 mt-2" href="#">Leer más</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ff-secondary {
  font-family: 'Pacifico', cursive;
}

.wow {
  visibility: visible;
  animation-name: fadeIn;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }
}

.zoomIn {
  animation-name: zoomIn;
}
</style>
