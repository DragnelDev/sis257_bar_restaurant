<script setup lang="ts">
import type { Service } from '../../types'

interface Props {
  service: Service
}

defineProps<Props>()
</script>

<template>
  <div class="service-item rounded pt-3">
    <div class="p-4">
      <i :class="`fa fa-3x ${service.icon} text-primary mb-4`"></i>
      <h5>{{ service.title }}</h5>
      <p>{{ service.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.service-item {
  box-shadow: 0 0 45px rgba(0, 0, 0, 0.08);
  transition: 0.5s;
}

.service-item:hover {
  background: var(--primary);
}

.service-item:hover h5,
.service-item:hover p {
  color: white;
}

.service-item:hover i {
  color: white !important;
}
</style>
