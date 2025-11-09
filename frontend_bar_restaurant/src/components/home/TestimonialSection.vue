<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Testimonial } from '../../types'
import TestimonialCard from '../shared/TestimonialCard.vue'

const currentIndex = ref(0)
const autoplayInterval = ref<number | null>(null)

const testimonials = ref<Testimonial[]>([
  {
    id: 1,
    name: 'Ana Galarza',
    profession: 'Diseñadora Gráfica',
    image: '/img/testimonial-1.jpg',
    quote:
      'La comida superó mis expectativas. El sabor y la presentación son inigualables. ¡Volveré pronto!',
  },
  {
    id: 2,
    name: 'Ricardo Soto',
    profession: 'Ingeniero de Sistemas',
    image: '/img/testimonial-2.jpg',
    quote:
      'Excelente servicio 24/7 y la facilidad del pedido en línea es genial. ¡Mi lugar favorito para pedir a domicilio!',
  },
  {
    id: 3,
    name: 'Julian Alvarez',
    profession: 'Arquitecto',
    image: '/img/testimonial-3.jpg',
    quote:
      'Felicidades a los Chefs. El plato de salmón estaba perfectamente cocinado. Una experiencia culinaria memorable.',
  },
  {
    id: 4,
    name: 'Lucia Fernandez',
    profession: 'Fotógrafa',
    image: '/img/testimonial-4.jpg',
    quote:
      'Ingredientes frescos y un ambiente increíble. Recomendaré este restaurante a todos mis amigos.',
  },
])

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.value.length
}

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + testimonials.value.length) % testimonials.value.length
}

const goToSlide = (index: number) => {
  currentIndex.value = index
}

const startAutoplay = () => {
  autoplayInterval.value = window.setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
    autoplayInterval.value = null
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <div
    class="container-xxl py-5 wow fadeInUp"
    data-wow-delay="0.1s"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="container">
      <div class="text-center">
        <h5 class="section-title ff-secondary text-center text-primary fw-normal">Testimonios</h5>
        <h1 class="mb-5">¡Nuestros clientes dicen!</h1>
      </div>

      <div class="testimonial-carousel position-relative">
        <div class="carousel-inner">
          <Transition name="fade" mode="out-in">
            <div :key="currentIndex" class="carousel-item active">
              <TestimonialCard :testimonial="testimonials[currentIndex]" />
            </div>
          </Transition>
        </div>

        <!-- Controles del carousel -->
        <button
          class="carousel-control-prev"
          @click="prevSlide"
          type="button"
          aria-label="Previous"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>

        <button class="carousel-control-next" @click="nextSlide" type="button" aria-label="Next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </button>

        <!-- Indicadores -->
        <div class="carousel-indicators">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="`indicator-${testimonial.id}`"
            type="button"
            :class="{ active: index === currentIndex }"
            @click="goToSlide(index)"
            :aria-label="'Slide ' + (index + 1)"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ff-secondary {
  font-family: 'Pacifico', cursive;
}

.testimonial-carousel {
  min-height: 300px;
  position: relative;
  padding: 0 60px;
}

.carousel-inner {
  position: relative;
  overflow: hidden;
}

.carousel-item {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.carousel-item.active {
  position: relative;
}

.carousel-control-prev,
.carousel-control-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 45px;
  height: 45px;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  opacity: 0.7;
  transition: opacity 0.3s;
  z-index: 10;
}

.carousel-control-prev {
  left: -60px;
}

.carousel-control-next {
  right: -60px;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
}

.carousel-indicators {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: background 0.3s;
}

.carousel-indicators button.active {
  background: var(--primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
