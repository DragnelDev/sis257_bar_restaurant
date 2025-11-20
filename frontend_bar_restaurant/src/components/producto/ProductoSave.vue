<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import type { Producto } from '@/models/producto'
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
const UNIDADES = ['Litro', 'Kilo', 'Unidad', 'g', 'ml']

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const defaultProducto = (): Producto => ({
  id: 0,
  idCategoria: 0,
  nombre: '',
  descripcion: '',
  unidadMedida: '',
  stockActual: 0,
  costoUnitarioPromedio: 0,
  perecedero: false,
  categoria: {
    id: 0,
    nombre: '',
    descripcion: '',
  },
})

const productos = ref<Producto>(defaultProducto())

watch(
  () => props.producto,
  (newVal) => {
    if (newVal) {
      productos.value = { ...defaultProducto(), ...(newVal as Producto) }
    } else {
      productos.value = defaultProducto()
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
      idCategoria: productos.value.idCategoria,
      nombre: productos.value.nombre,
      descripcion: productos.value.descripcion,
      unidadMedida: productos.value.unidadMedida,
      costoUnitarioPromedio: productos.value.costoUnitarioPromedio,
      perecedero: productos.value.perecedero,
    }

    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${productos.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    emit('guardar')
    productos.value = defaultProducto()
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
          v-model="productos.nombre"
          class="flex-auto"
          autocomplete="off"
          autofocus
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="categoria" class="font-semibold w-3">Categoria</label>
        <Dropdown
          id="categoria"
          v-model="productos.idCategoria"
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
          v-model="productos.descripcion"
          class="flex-auto"
          autocomplete="off"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="costoPromedio" class="font-semibold w-3">Costo Promedio</label>
        <InputNumber
          id="costoPromedio"
          v-model="productos.costoUnitarioPromedio"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          class="flex-auto"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="unidadMedida" class="font-semibold w-3">Unidad Medida</label>
        <Dropdown
          id="unidadMedida"
          v-model="productos.unidadMedida"
          :options="UNIDADES"
          class="flex-auto"
          placeholder="Seleccione unidad"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="perecedero" class="font-semibold w-3">Perecedero</label>
        <input id="perecedero" type="checkbox" v-model="productos.perecedero" />
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
