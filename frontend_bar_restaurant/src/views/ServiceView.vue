<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import ServiceCard from '../components/shared/ServiceCard.vue'
import type { Service } from '../types'
import PageHeader from '@/components/shared/PageHeader.vue'

const services = ref<Service[]>([
  {
    id: 1,
    icon: 'fa-user-tie',
    title: 'Chefs Maestros',
    description:
      'Contamos con cocineros expertos y certificados para garantizar una experiencia culinaria inigualable.',
  },
  {
    id: 2,
    icon: 'fa-utensils',
    title: 'Comida de Calidad',
    description:
      'Ingredientes frescos y de primera calidad, seleccionados cuidadosamente para el mejor sabor y nutrición.',
  },
  {
    id: 3,
    icon: 'fa-cart-plus',
    title: 'Pedidos en Línea',
    description: 'Realiza tu pedido cómodamente desde nuestra plataforma y recíbelo donde estés.',
  },
  {
    id: 4,
    icon: 'fa-headset',
    title: 'Servicio 24/7',
    description:
      'Estamos disponibles las 24 horas del día, los 7 días de la semana, para atender tus consultas y pedidos.',
  },
  {
    id: 5,
    icon: 'fa-user-tie',
    title: 'Chefs Maestros',
    description:
      'Contamos con cocineros expertos y certificados para garantizar una experiencia culinaria inigualable.',
  },
  {
    id: 6,
    icon: 'fa-utensils',
    title: 'Comida de Calidad',
    description:
      'Ingredientes frescos y de primera calidad, seleccionados cuidadosamente para el mejor sabor y nutrición.',
  },
  {
    id: 7,
    icon: 'fa-cart-plus',
    title: 'Pedidos en Línea',
    description: 'Realiza tu pedido cómodamente desde nuestra plataforma y recíbelo donde estés.',
  },
  {
    id: 8,
    icon: 'fa-headset',
    title: 'Servicio 24/7',
    description:
      'Estamos disponibles las 24 horas del día, los 7 días de la semana, para atender tus consultas y pedidos.',
  },
])
</script>

<template>
  <div>
    <PageHeader
      title="Servicios"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Paginas', link: '#' },
        { text: 'Servicio', link: '/service' },
      ]"
    />

    <div class="container-xxl py-5">
      <div class="container">
        <SectionTitle subtitle="Nuestros Servicios" title="Explora Nuestros Servicios" />

        <div class="row g-4">
          <div
            v-for="(service, index) in services"
            :key="service.id"
            class="col-lg-3 col-sm-6 wow fadeInUp"
            :data-wow-delay="`${0.1 + (index % 4) * 0.2}s`"
          >
            <ServiceCard :service="service" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
