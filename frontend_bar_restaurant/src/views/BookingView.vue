<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import ReservationSection from '../components/home/ReservationSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Reservas"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Paginas', link: '#' },
        { text: 'Reserva', link: '/booking' },
      ]"
    />
    <ReservationSection />
  </div>
</template>
