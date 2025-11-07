<script setup lang="ts">
import type { Proveedor } from '@/models/Proveedor'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'proveedores'
const props = defineProps({
  mostrar: Boolean,
  proveedor: {
    type: Object as () => Proveedor | null,
    default: () => null,
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

const proveedorLocal = ref<Proveedor>({
  id: 0,
  nombre: '',
  nit: '',
  telefono: '',
  fechaCreacion: new Date(),
  fechaModificacion: new Date(),
  fechaEliminacion: null,
})

watch(
  () => props.proveedor,
  (newVal) => {
    if (newVal) proveedorLocal.value = { ...newVal }
    else
      proveedorLocal.value = {
        id: 0,
        nombre: '',
        nit: '',
        telefono: '',
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        fechaEliminacion: null,
      }
  },
  { immediate: true },
)

async function handleSave() {
  try {
    const body = {
      nombre: proveedorLocal.value.nombre,
      nit: proveedorLocal.value.nit,
      telefono: proveedorLocal.value.telefono,
    }

    if (props.modoEdicion && proveedorLocal.value.id) {
      await http.patch(`${ENDPOINT}/${proveedorLocal.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    emit('guardar')
    proveedorLocal.value = {
      id: 0,
      nombre: '',
      nit: '',
      telefono: '',
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      fechaEliminacion: null,
    }
    dialogVisible.value = false
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar el proveedor'
    console.error('Error al guardar proveedor:', error)
    alert(errorMessage)
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Proveedor' : 'Crear Proveedor'" style="width: 25rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText id="nombre" v-model="proveedorLocal.nombre" class="flex-auto" autocomplete="off" autofocus />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="nit" class="font-semibold w-3">NIT</label>
        <InputText id="nit" v-model="proveedorLocal.nit" class="flex-auto" autocomplete="off" />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="telefono" class="font-semibold w-3">Teléfono</label>
        <InputText id="telefono" v-model="proveedorLocal.telefono" class="flex-auto" autocomplete="off" />
      </div>

      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
