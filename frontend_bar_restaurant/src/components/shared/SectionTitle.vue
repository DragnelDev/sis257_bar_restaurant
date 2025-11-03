<script setup lang="ts">
interface Props {
  subtitle: string
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="text-center wow fadeInUp" data-wow-delay="0.1s">
    <h5 class="section-title ff-secondary text-center text-primary fw-normal">
      {{ subtitle }}
    </h5>
    <h1 class="mb-5">{{ title }}</h1>
  </div>
</template>

<style scoped>
.section-title {
  position: relative;
  display: inline-block;
}

.ff-secondary {
  font-family: 'Pacifico', cursive;
}
</style>
