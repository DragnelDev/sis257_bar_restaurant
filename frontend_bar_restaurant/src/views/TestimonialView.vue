<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import TestimonialSection from '../components/home/TestimonialSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Testimonial"
      :breadcrumbs="[
        { text: 'Home', link: '/' },
        { text: 'Pages', link: '#' },
        { text: 'Testimonial', link: '/testimonial' },
      ]"
    />
    <TestimonialSection />
  </div>
</template>
