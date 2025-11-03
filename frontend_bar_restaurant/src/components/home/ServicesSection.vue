<script setup lang="ts">
import { ref } from 'vue'
import type { Service } from '../../types'
import ServiceCard from '../shared/ServiceCard.vue'

const services = ref<Service[]>([
  {
    id: 1,
    icon: 'fa-user-tie',
    title: 'Master Chefs',
    description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam',
  },
  {
    id: 2,
    icon: 'fa-utensils',
    title: 'Quality Food',
    description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam',
  },
  {
    id: 3,
    icon: 'fa-cart-plus',
    title: 'Online Order',
    description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam',
  },
  {
    id: 4,
    icon: 'fa-headset',
    title: '24/7 Service',
    description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam',
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
