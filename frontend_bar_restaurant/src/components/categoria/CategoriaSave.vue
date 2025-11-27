<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, Dropdown } from 'primevue'
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

const ENDPOINT = 'categorias'
const toast = useToast()

const props = defineProps({
  mostrar: Boolean,
  categoria: { type: Object as () => Categoria, default: () => ({}) as Categoria },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (v) => {
    if (!v) emit('close')
  },
})

const categoria = ref<Categoria>({
  id: undefined,
  nombre: '',
  descripcion: '',
  tipoCategoria: '',
})

watch(
  () => props.categoria,
  (n) => {
    if (n) categoria.value = { ...n }
  },
)

const opcionesTipo = [
  { label: 'Inventario', value: 'INVENTARIO' },
  { label: 'Menú', value: 'MENÚ' },
]

function limpiarFormulario() {
  categoria.value = { nombre: '', descripcion: '', tipoCategoria: '' }
}

async function handleSave() {
  if (!categoria.value.nombre.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Nombre requerido',
      detail: 'Ingrese un nombre para la categoría',
      life: 3000,
    })
    return
  }
  if (!categoria.value.tipoCategoria) {
    toast.add({
      severity: 'warn',
      summary: 'Tipo requerido',
      detail: 'Seleccione un tipo de categoría',
      life: 3000,
    })
    return
  }

  const body = {
    nombre: categoria.value.nombre,
    descripcion: categoria.value.descripcion,
    tipoCategoria: categoria.value.tipoCategoria,
  }

  try {
    if (props.modoEdicion && categoria.value.id) {
      await http.patch(`${ENDPOINT}/${categoria.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Categoría actualizada',
        detail: `La categoría "${categoria.value.nombre}" se actualizó correctamente`,
        life: 4000,
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Categoría creada',
        detail: `La categoría "${categoria.value.nombre}" se creó correctamente`,
        life: 4000,
      })
    }

    emit('guardar')
    limpiarFormulario()
    dialogVisible.value = false
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || 'Error al guardar categoría'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Categoría' : 'Crear Categoría'"
    style="width: 25rem"
    modal
  >
    <div class="flex items-center gap-4 mb-4">
      <label for="nombre" class="font-semibold w-3">Nombre</label>
      <InputText
        id="nombre"
        v-model="categoria.nombre"
        class="flex-auto"
        placeholder="Ingrese el nombre"
      />
    </div>

    <div class="flex items-center gap-4 mb-4">
      <label for="descripcion" class="font-semibold w-3">Descripción</label>
      <InputText
        id="descripcion"
        v-model="categoria.descripcion"
        class="flex-auto"
        placeholder="Ingrese la descripción"
      />
    </div>

    <div class="flex items-center gap-4 mb-4">
      <label for="tipo" class="font-semibold w-3">Tipo</label>
      <Dropdown
        id="tipo"
        v-model="categoria.tipoCategoria"
        :options="opcionesTipo"
        optionLabel="label"
        optionValue="value"
        class="flex-auto"
        placeholder="Seleccione un tipo"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        @click="dialogVisible = false"
      />
      <Button label="Guardar" icon="pi pi-save" @click="handleSave" />
    </div>
  </Dialog>
</template>

<style scoped></style>
