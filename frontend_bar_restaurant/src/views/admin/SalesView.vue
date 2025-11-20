<script setup lang="ts">
import VentaList from '@/components/venta/VentaList.vue'
import { ref, type ComponentPublicInstance } from 'vue'

type VentaListInstance = ComponentPublicInstance & { obtenerLista?: () => void }
const ventaListRef = ref<VentaListInstance | null>(null)


</script>

<template>
  <div>
    <VentaList ref="ventaListRef" />
  </div>
</template>
