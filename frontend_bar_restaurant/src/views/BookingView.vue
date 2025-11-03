<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import ReservationSection from '../components/home/ReservationSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Booking"
      :breadcrumbs="[
        { text: 'Home', link: '/' },
        { text: 'Pages', link: '#' },
        { text: 'Booking', link: '/booking' },
      ]"
    />
    <ReservationSection />
  </div>
</template>
