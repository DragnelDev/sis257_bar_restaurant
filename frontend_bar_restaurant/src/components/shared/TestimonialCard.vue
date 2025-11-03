<script setup lang="ts">
import type { Testimonial } from '../../types'

interface Props {
  testimonial: Testimonial
}

defineProps<Props>()
</script>

<template>
  <div class="testimonial-item bg-transparent border rounded p-4 mx-auto" style="max-width: 800px">
    <i class="fa fa-quote-left fa-2x text-primary mb-3"></i>
    <p>{{ testimonial.quote }}</p>
    <div class="d-flex align-items-center">
      <img
        class="img-fluid flex-shrink-0 rounded-circle"
        :src="testimonial.image"
        :alt="testimonial.name"
        style="width: 50px; height: 50px"
      />
      <div class="ps-3">
        <h5 class="mb-1">{{ testimonial.name }}</h5>
        <small>{{ testimonial.profession }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.testimonial-item {
  transition: 0.5s;
}

.testimonial-item:hover {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}

.testimonial-item:hover p,
.testimonial-item:hover h5,
.testimonial-item:hover small,
.testimonial-item:hover i {
  color: white !important;
}

img {
  object-fit: cover;
}
</style>
