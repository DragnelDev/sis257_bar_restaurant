<script setup lang="ts">
import { ref, onMounted } from 'vue'

const yearsExperience = ref(0)
const masterChefs = ref(0)
const satisfiedCustomers = ref(0)
const partyDays = ref(0)

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
  setTimeout(() => {
    animateCounter(4, (val) => (yearsExperience.value = val))
    animateCounter(12, (val) => (masterChefs.value = val))
    animateCounter(300, (val) => (satisfiedCustomers.value = val))
    animateCounter(365, (val) => (partyDays.value = val))
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
                alt="Ambiente del bar restaurante"
              />
            </div>
            <div class="col-6 text-start">
              <img
                class="img-fluid rounded w-75 wow zoomIn"
                data-wow-delay="0.3s"
                src="/img/about-2.jpg"
                style="margin-top: 25%"
                alt="Cócteles especiales"
              />
            </div>
            <div class="col-6 text-end">
              <img
                class="img-fluid rounded w-75 wow zoomIn"
                data-wow-delay="0.5s"
                src="/img/about-3.jpg"
                alt="Platos gourmet"
              />
            </div>
            <div class="col-6 text-end">
              <img
                class="img-fluid rounded w-100 wow zoomIn"
                data-wow-delay="0.7s"
                src="/img/about-4.jpg"
                alt="Noche de fiesta"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <h5 class="section-title ff-secondary text-start text-primary fw-normal">
            Sobre nosotros
          </h5>
          <h1 class="mb-4">
            Bienvenido a <i class="fa fa-utensils text-primary me-2"></i>
            <i class="fas fa-glass-cheers text-primary me-2"></i>Reset Bar & Restaurante<i class="fas fa-music text-primary me-2"></i>
          </h1>
          <p class="mb-4">
            ¡Bienvenidos! Relájense, llegaron al lugar donde la buena comida se combina con los mejores tragos.
            Prepárense para una experiencia gastronómica y nocturna inolvidable. En nuestro espacio, cada plato
            se sirve con pasión y cada cóctel se prepara con arte.
          </p>
          <p class="mb-4">
            Más que un restaurante o un bar, les espera una experiencia completa. Aquí, la frescura de
            los ingredientes y la creatividad de nuestros mixólogos son nuestra esencia. ¡Siéntanse como
            en casa mientras disfrutan de la mejor fiesta!
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
                  <p class="mb-0">Expertos en</p>
                  <h6 class="text-uppercase mb-0">Cocina y barra</h6>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="d-flex align-items-center border-start border-5 border-primary px-3">
                <h1 class="flex-shrink-0 display-5 text-primary mb-0">
                  {{ satisfiedCustomers }}+
                </h1>
                <div class="ps-4">
                  <p class="mb-0">Clientes</p>
                  <h6 class="text-uppercase mb-0">Satisfechos</h6>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="d-flex align-items-center border-start border-5 border-primary px-3">
                <h1 class="flex-shrink-0 display-5 text-primary mb-0">
                  {{ partyDays }}
                </h1>
                <div class="ps-4">
                  <p class="mb-0">Días para</p>
                  <h6 class="text-uppercase mb-0">Celebrar</h6>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="d-flex align-items-center gap-3">
              <i class="fa fa-utensils text-primary fs-4"></i>
              <i class="fas fa-glass-cheers text-primary fs-4"></i>
              <i class="fas fa-music text-primary fs-4"></i>
              <i class="fas fa-birthday-cake text-primary fs-4"></i>
              <span class="ms-2 text-muted">Tu lugar perfecto para comer, beber y celebrar</span>
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
