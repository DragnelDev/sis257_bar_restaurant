<script setup lang="ts">
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber } from 'primevue'
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

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const producto = ref<Producto>({ ...props.producto })
watch(
  () => props.producto,
  (newVal) => {
    producto.value = { ...newVal }
  },
)

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
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Error al guardar el producto'
    alert(msg)
  }
}
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
        <label for="idCategoria" class="font-semibold w-3">ID Categoría</label>
        <InputNumber
          id="idCategoria"
          v-model="producto.idCategoria"
          class="flex-auto"
          :min="0"
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
        <Button
          type="button"
          label="Guardar"
          icon="pi pi-save"
          @click="handleSave"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
