<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import AboutSection from '../components/home/AboutSection.vue'
import TeamSection from '../components/home/TeamSection.vue'
</script>

<template>
  <div>
    <PageHeader
      title="About Us"
      :breadcrumbs="[
        { text: 'Home', link: '/' },
        { text: 'Pages', link: '#' },
        { text: 'About', link: '/about' },
      ]"
    />
    <AboutSection />
    <TeamSection />
  </div>
</template>
