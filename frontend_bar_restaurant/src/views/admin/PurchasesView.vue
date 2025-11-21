<script setup lang="ts">
import CompraList from '@/components/compra/CompraList.vue'
import CompraSave from '@/components/compra/CompraSave.vue'
import type { Compra } from '@/models/Compra'
import Button from 'primevue/button'
import { ref, type ComponentPublicInstance } from 'vue'

const mostrarDialog = ref(false)
type CompraListInstance = ComponentPublicInstance & { obtenerLista?: () => void }
const compraListRef = ref<CompraListInstance | null>(null)
const compraEdit = ref<Compra | null>(null)

function handleCreate() {
  compraEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(compra: Compra) {
  compraEdit.value = compra
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  compraListRef.value?.obtenerLista?.()
}
</script>

<template>
  <div>
    <h2>Compras</h2>
    <Button label="Registrar un nueva compra" icon="pi pi-plus" @click="handleCreate" />
    <CompraList ref="compraListRef" @edit="handleEdit" />
    <CompraSave
      :mostrar="mostrarDialog"
      :compra="compraEdit ?? ({} as Compra)"
      :modoEdicion="!!compraEdit"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
  </div>
</template>
