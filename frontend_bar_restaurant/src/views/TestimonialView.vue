<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import TestimonialSection from '../components/home/TestimonialSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Testimonios"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Pagina', link: '#' },
        { text: 'Testimonio', link: '/testimonial' },
      ]"
    />
    <TestimonialSection />
  </div>
</template>
