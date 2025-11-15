<script setup lang="ts">
import CategoriaSave from '@/components/categoria/CategoriaSave.vue'
import ProductoList from '@/components/producto/ProductoList.vue'
import ProductoSave from '@/components/producto/ProductoSave.vue'
import type { Categoria } from '@/models/Categoria'
import type { Producto } from '@/models/producto'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const productoListRef = ref<InstanceType<typeof ProductoList> | null>(null)
const productoEdit = ref<Producto | null>(null)

//Categoria
const mostrarDialogCategoria = ref(false)
const categoriaEdit = ref<Categoria | null>(null)

function handleCreateCategoria() {
  categoriaEdit.value = null
  mostrarDialogCategoria.value = true
}

function handleGuardarCategoria() {
  CategoriaSave.value?.obtenerLista()
}

function handleCreate() {
  productoEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(producto: Producto) {
  productoEdit.value = producto
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  productoListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="mx-2 mt-6 md:m-7">
    <h2>Gestión de Productos(Materia prima)</h2>
    <div class="flex space-x-4 mb-4">
      <Button label="Añadir Nuevo Producto" icon="pi pi-plus" @click="handleCreate" />
      <Button label="Añadir Categoria" icon="pi pi-plus" @click="handleCreateCategoria" />
    </div>
    <ProductoList ref="productoListRef" @edit="handleEdit" />
    <ProductoSave
      :mostrar="mostrarDialog"
      :producto="productoEdit"
      :modoEdicion="!!productoEdit"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
    <CategoriaSave
      :mostrar="mostrarDialogCategoria"
      :categoria="categoriaEdit"
      :modoEdicion="!!categoriaEdit"
      @guardar="handleGuardarCategoria"
      @close="mostrarDialogCategoria = false"
    />
  </div>
</template>

<style scoped></style>
