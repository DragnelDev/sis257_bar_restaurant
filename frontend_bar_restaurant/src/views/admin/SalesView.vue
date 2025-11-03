<script setup lang="ts">
import VentaList from '@/components/venta/VentaList.vue'
import VentaSave from '@/components/venta/VentaSave.vue'
import type { Venta } from '@/models/Venta'
import Button from 'primevue/button'
import { ref, type ComponentPublicInstance } from 'vue'

const mostrarDialog = ref(false)
type VentaListInstance = ComponentPublicInstance & { obtenerLista?: () => void }
const ventaListRef = ref<VentaListInstance | null>(null)
const ventaEdit = ref<Venta | null>(null)

function handleCreate() {
  ventaEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(venta: Venta) {
  ventaEdit.value = venta
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  ventaListRef.value?.obtenerLista?.()
}
</script>

<template>
  <div>
    <h2>Ventas</h2>
    <Button label="Crear Nueva" icon="pi pi-plus" @click="handleCreate" />
    <VentaList ref="ventaListRef" @edit="handleEdit" />
    <VentaSave
      :mostrar="mostrarDialog"
      :venta="ventaEdit ?? ({} as Venta)"
      :modoEdicion="!!ventaEdit"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
  </div>
</template>
