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
  nombreEmpresa: '',
  nit: '',
  responsable: '',
  direccion: '',
  celular: '',
  email: '',
  condicionPago: '',
})

watch(
  () => props.proveedor,
  (newVal) => {
    if (newVal) proveedorLocal.value = { ...newVal }
    else
      proveedorLocal.value = {
        id: 0,
        nombreEmpresa: '',
        nit: '',
        responsable: '',
        direccion: '',
        celular: '',
        email: '',
        condicionPago: '',
      }
  },
  { immediate: true },
)

async function handleSave() {
  try {
    const body = {
      nombreEmpresa: proveedorLocal.value.nombreEmpresa,
      nit: proveedorLocal.value.nit,
      responsable: proveedorLocal.value.responsable,
      direccion: proveedorLocal.value.direccion,
      celular: proveedorLocal.value.celular,
      email: proveedorLocal.value.email,
      condicionPago: proveedorLocal.value.condicionPago,
    }

    if (props.modoEdicion && proveedorLocal.value.id) {
      await http.patch(`${ENDPOINT}/${proveedorLocal.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    emit('guardar')
    proveedorLocal.value = {
      id: 0,
      nombreEmpresa: '',
      nit: '',
      responsable: '',
      direccion: '',
      celular: '',
      email: '',
      condicionPago: '',
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
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Proveedor' : 'Crear Proveedor'"
      style="width: 25rem"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="nombreEmpresa" class="font-semibold w-3">Nombre Empresa</label>
        <InputText
          id="nombreEmpresa"
          v-model="proveedorLocal.nombreEmpresa"
          class="flex-auto"
          autocomplete="off"
          autofocus
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="nit" class="font-semibold w-3">NIT</label>
        <InputText id="nit" v-model="proveedorLocal.nit" class="flex-auto" autocomplete="off" />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="responsable" class="font-semibold w-3">Responsable</label>
        <InputText
          id="responsable"
          v-model="proveedorLocal.responsable"
          class="flex-auto"
          autocomplete="off"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="direccion" class="font-semibold w-3">Direccion</label>
        <InputText
          id="direccion"
          v-model="proveedorLocal.direccion"
          class="flex-auto"
          autocomplete="off"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="celular" class="font-semibold w-3">Celular</label>
        <InputText
          id="celular"
          v-model="proveedorLocal.celular"
          class="flex-auto"
          autocomplete="off"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="email" class="font-semibold w-3">Email</label>
        <InputText id="email" v-model="proveedorLocal.email" class="flex-auto" autocomplete="off" />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="condicionPago" class="font-semibold w-3">Condicion de Pago</label>
        <InputText
          id="condicionPago"
          v-model="proveedorLocal.condicionPago"
          class="flex-auto"
          autocomplete="off"
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
