<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import MenuSection from '../components/home/MenuSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Menú de Comidas"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Paginas', link: '#' },
        { text: 'Menú', link: '/menu' },
      ]"
    />
    <MenuSection />
  </div>
</template>
