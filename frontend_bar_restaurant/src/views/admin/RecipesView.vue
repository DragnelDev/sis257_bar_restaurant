<script setup lang="ts">
import RecetaList from '@/components/receta/RecetaList.vue'
import RecetaSave from '@/components/receta/RecetaSave.vue'
import type { Receta } from '@/models/Receta'
import Button from 'primevue/button'
import { ref, type ComponentPublicInstance } from 'vue'

const mostrarDialog = ref(false)
type RecetaListInstance = ComponentPublicInstance & { obtenerLista?: () => void }
const recetaListRef = ref<RecetaListInstance | null>(null)
const recetaEdit = ref<Receta | null>(null)

function handleCreate() {
  recetaEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(receta: Receta) {
  recetaEdit.value = receta
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  // cuando se guarda, refrescamos la lista
  recetaListRef.value?.obtenerLista?.()
}
</script>

<template>
  <div class="container-fluid px-3 py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Gestión de Recetas</h2>
      <Button label="Registrar nueva receta" icon="pi pi-plus" class="p-button-primary" @click="handleCreate" />
    </div>

    <RecetaList ref="recetaListRef" @edit="handleEdit" />

    <RecetaSave
      :mostrar="mostrarDialog"
      :receta="recetaEdit ?? ({} as Receta)"
      :modoEdicion="!!recetaEdit"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
  </div>
</template>
