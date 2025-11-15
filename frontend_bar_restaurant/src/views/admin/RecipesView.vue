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
  <div>
    <h2>Gestion de Recetas</h2>
    <Button label="Registrar un nueva receta" icon="pi pi-plus" @click="handleCreate" />
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
