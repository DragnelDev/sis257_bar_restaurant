<script setup lang="ts">
import { ref } from 'vue'
import type { Service } from '../../types'
import ServiceCard from '../shared/ServiceCard.vue'

const services = ref<Service[]>([
  {
    id: 1,
    icon: 'fa-user-tie',
    title: 'Maestros Chefs',
    description:
      'Nuestro equipo está formado por chefs galardonados con pasión por la gastronomía. Cada plato es una obra de arte creada con técnicas culinarias de vanguardia y el máximo cuidado en los detalles.',
  },
  {
    id: 2,
    icon: 'fa-utensils',
    title: 'Comida de Calidad',
    description:
      'Nos comprometemos a usar solo ingredientes frescos, locales y de la más alta calidad. Garantizamos que cada bocado que pruebes esté lleno de sabor, frescura y nutritivos beneficios.',
  },
  {
    id: 3,
    icon: 'fa-cart-plus',
    title: 'Pedido en Línea',
    description:
      'Disfruta de tus platos favoritos desde la comodidad de tu hogar u oficina. Nuestro sistema de pedidos es rápido, intuitivo y seguro, con seguimiento en tiempo real hasta tu puerta.',
  },
  {
    id: 4,
    icon: 'fa-headset',
    title: 'Servicio 24/7',
    description:
      'Nuestra dedicación por el cliente no tiene horario. Estamos disponibles para atender tus pedidos y consultas a cualquier hora del día, los 7 días de la semana, garantizando una experiencia sin interrupciones.',
  },
])
</script>

<template>
  <div class="container-xxl py-5">
    <div class="container">
      <div class="row g-4">
        <div
          v-for="(service, index) in services"
          :key="service.id"
          class="col-lg-3 col-sm-6 wow fadeInUp"
          :data-wow-delay="`${0.1 + index * 0.2}s`"
        >
          <ServiceCard :service="service" />
        </div>
      </div>
    </div>
  </div>
</template>
