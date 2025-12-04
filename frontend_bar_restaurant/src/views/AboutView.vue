<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import AboutSection from '../components/home/AboutSection.vue'
import TeamSection from '../components/home/TeamSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Acerca de Nosotros"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Paginas', link: '#' },
        { text: 'Acerca de', link: '/about' },
      ]"
    />
    <AboutSection />
    <TeamSection />
  </div>
</template>
