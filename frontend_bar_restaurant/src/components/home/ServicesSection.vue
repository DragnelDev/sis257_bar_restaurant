<script setup lang="ts">
import { ref } from 'vue'
import type { Service } from '../../types'
import ServiceCard from '../shared/ServiceCard.vue'

const services = ref<Service[]>([
  {
    id: 1,
    icon: 'fa-glass-cheers',
    title: 'Fiestas de Cumpleaños',
    description: 'Celebra tu cumpleaños con nosotros. Ambiente perfecto, música y entretenimiento garantizado.'
  },
  {
    id: 2,
    icon: 'fa-microphone',
    title: 'Karaoke Nights',
    description: 'Todos los jueves, vive la mejor experiencia de karaoke con amigos y buena música.'
  },
  {
    id: 3,
    icon: 'fa-music',
    title: 'Weekend Parties',
    description: 'Viernes y sábados con DJs en vivo y las mejores pistas para bailar toda la noche.'
  },
  {
    id: 4,
    icon: 'fa-cocktail',
    title: 'Bar & Food',
    description: 'Bebidas premium y deliciosa comida para disfrutar en cualquier momento.'
  },
])
</script>

<template>
  <section class="simple-services py-5">
    <div class="container">
      <div class="row g-4">
        <div
          v-for="service in services"
          :key="service.id"
          class="col-lg-3 col-md-6"
        >
          <ServiceCard :service="service" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.simple-services {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
}
</style>
