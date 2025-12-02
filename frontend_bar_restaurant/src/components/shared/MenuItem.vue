<script setup lang="ts">
import type { MenuItem } from '../../types'

interface Props {
  item: MenuItem
}

defineProps<Props>()
</script>

<template>
  <div class="d-flex align-items-center">
    <img
      class="flex-shrink-0 img-fluid rounded"
      :src="item.image"
      :alt="item.name"
      style="width: 80px"
    />
    <div class="w-100 d-flex flex-column text-start ps-4">
      <h5 class="d-flex justify-content-between border-bottom pb-2">
        <span>{{ item.name }}</span>
        <span class="text-primary">Bs {{ item.price }}</span>
      </h5>
      <small class="fst-italic">{{ item.description }}</small>
    </div>
  </div>
</template>


<style scoped>
.img-fluid {
  object-fit: cover;
  height: 80px;
}
</style>
