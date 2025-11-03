<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import MenuSection from '../components/home/MenuSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Food Menu"
      :breadcrumbs="[
        { text: 'Home', link: '/' },
        { text: 'Pages', link: '#' },
        { text: 'Menu', link: '/menu' },
      ]"
    />
    <MenuSection />
  </div>
</template>
