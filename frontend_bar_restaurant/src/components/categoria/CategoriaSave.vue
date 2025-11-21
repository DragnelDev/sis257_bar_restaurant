<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'categorias'
const props = defineProps({
  mostrar: Boolean,
  categoria: {
    type: Object as () => Categoria,
    default: () => ({}) as Categoria,
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

const categoria = ref<Categoria>({ ...props.categoria })
watch(
  () => props.categoria,
  (newVal) => {
    categoria.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: categoria.value.nombre,
      descripcion: categoria.value.descripcion,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${categoria.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    categoria.value = {} as Categoria
    dialogVisible.value = false
  } catch (error) {
    let msg = 'Ocurrió un error'
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>
      const response = e['response'] as Record<string, unknown> | undefined
      const data = response?.['data'] as Record<string, unknown> | undefined
      const message = data?.['message']
      if (typeof message === 'string') msg = message
      else if (typeof e['message'] === 'string') msg = e['message'] as string
      else {
        try {
          msg = JSON.stringify(e)
        } catch {
          msg = 'Ocurrió un error'
        }
      }
    } else {
      msg = String(error)
    }
    alert(msg)
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Categoria' : 'Crear Categoria'"
      style="width: 25rem"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText
          id="nombre"
          v-model="categoria.nombre"
          class="flex-auto"
          placeholder="Ingrese el nombre de la categoría"
        />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="descripcion" class="font-semibold w-3">Descripción</label>
        <InputText
          id="descripcion"
          v-model="categoria.descripcion"
          class="flex-auto"
          placeholder="Ingrese la descripción de la categoría"
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
