<script setup lang="ts">
import CategoriaList from '@/components/categoria/CategoriaList.vue'
import CategoriaSave from '@/components/categoria/CategoriaSave.vue'
import type { Categoria } from '@/models/Categoria'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const categoriaListRef = ref<InstanceType<typeof CategoriaList> | null>(null)
const categoriaEdit = ref<Categoria | null>(null)

function handleCreate() {
  categoriaEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(categoria: Categoria) {
  categoriaEdit.value = categoria
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  categoriaListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="mx-2 mt-6 md:m-7">
    <h2>Categorias</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <CategoriaList ref="categoriaListRef" @edit="handleEdit" />
    <CategoriaSave
      :mostrar="mostrarDialog"
      :categoria="categoriaEdit"
      :modoEdicion="!!categoriaEdit"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
  </div>
</template>

<style scoped></style>
