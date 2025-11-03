<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import type { Producto } from '@/models/Producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber, Dropdown } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'productos'
const props = defineProps({
  mostrar: Boolean,
  producto: {
    type: Object as () => Producto,
    default: () => ({}) as Producto,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const categorias = ref<Categoria[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const producto = ref<Producto>({
  id: 0,
  idCategoria: 0,
  nombre: '',
  descripcion: '',
  precioVenta: 0,
  stock: 0,
  fechaCreacion: new Date(),
  fechaModificacion: new Date(),
  fechaEliminacion: null,
  categoria: {
    id: 0,
    idCategoria: 0,
    nombre: '',
    descripcion: '',
    fechaCreacion: new Date(),
    fechaModificacion: new Date(),
    fechaEliminacion: null,
  },
})

watch(
  () => props.producto,
  (newVal) => {
    if (newVal) {
      producto.value = { ...newVal }
    } else {
      producto.value = {
        id: 0,
        idCategoria: 0,
        nombre: '',
        descripcion: '',
        precioVenta: 0,
        stock: 0,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        fechaEliminacion: null,
        categoria: {
          id: 0,
          idCategoria: 0,
          nombre: '',
          descripcion: '',
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
          fechaEliminacion: null,
        },
      }
    }
  },
  { immediate: true },
)

async function obtenerCategorias() {
  categorias.value = await http.get('categorias').then((response) => response.data)
}

async function handleSave() {
  try {
    const body = {
      idCategoria: producto.value.idCategoria,
      nombre: producto.value.nombre,
      descripcion: producto.value.descripcion,
      precioVenta: producto.value.precioVenta,
      stock: producto.value.stock,
    }

    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${producto.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    emit('guardar')
    producto.value = {} as Producto
    dialogVisible.value = false
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar el producto'
    console.error('Error al guardar:', error)
    alert(errorMessage)
  }
}
watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      obtenerCategorias()
    }
  },
)
</script>

<template>
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Producto' : 'Crear Producto'"
      style="width: 25rem"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText
          id="nombre"
          v-model="producto.nombre"
          class="flex-auto"
          autocomplete="off"
          autofocus
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="categoria" class="font-semibold w-3">Categoria</label>
        <Dropdown
          id="categoria"
          v-model="producto.idCategoria"
          :options="categorias"
          optionLabel="nombre"
          optionValue="id"
          class="flex-auto"
          placeholder="Seleccione una categoría"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="descripcion" class="font-semibold w-3">Descripción</label>
        <InputText
          id="descripcion"
          v-model="producto.descripcion"
          class="flex-auto"
          autocomplete="off"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="precioVenta" class="font-semibold w-3">Precio Venta</label>
        <InputNumber
          id="precioVenta"
          v-model="producto.precioVenta"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          class="flex-auto"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="stock" class="font-semibold w-3">Stock</label>
        <InputNumber
          id="stock"
          v-model="producto.stock"
          class="flex-auto"
          :min="0"
          :showButtons="true"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          @click="dialogVisible = false"
        />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
