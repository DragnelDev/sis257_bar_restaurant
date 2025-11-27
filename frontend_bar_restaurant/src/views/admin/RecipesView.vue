<script setup lang="ts">
import RecetaList from '@/components/receta/RecetaList.vue'
import RecetaSave from '@/components/receta/RecetaSave.vue'
import type { Receta } from '@/models/Receta'
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import Button from 'primevue/button'
import { ref, type ComponentPublicInstance, onMounted } from 'vue'

const mostrarDialog = ref(false)
type RecetaListInstance = ComponentPublicInstance & { obtenerLista?: () => void }
const recetaListRef = ref<RecetaListInstance | null>(null)
const recetaEdit = ref<Receta | null>(null)

// Productos disponibles para usar en la receta
const productos = ref<Producto[]>([])

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
  // refrescar lista de recetas
  recetaListRef.value?.obtenerLista?.()
}

// ======================
// Cargar productos
// ======================
async function cargarProductos() {
  try {
    const { data } = await http.get('productos')
    productos.value = data
  } catch (error) {
    console.error('Error al cargar productos', error)
  }
}

onMounted(() => {
  cargarProductos()
})
</script>

<template>
  <div class="container-fluid px-3 py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Gestión de Recetas</h2>
      <Button
        label="Registrar nueva receta"
        icon="pi pi-plus"
        class="p-button-primary"
        @click="handleCreate"
      />
    </div>

    <RecetaList ref="recetaListRef" @edit="handleEdit" />

    <RecetaSave
      :mostrar="mostrarDialog"
      :receta="recetaEdit ?? ({} as Receta)"
      :modoEdicion="!!recetaEdit"
      :productos="productos"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
  </div>
</template>
