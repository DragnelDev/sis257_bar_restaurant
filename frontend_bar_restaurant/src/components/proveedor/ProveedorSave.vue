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
      style="width: 35rem"
    >
      <form class="row g-3">
        <div class="col-12">
          <label for="nombreEmpresa" class="form-label">Nombre Empresa</label>
          <InputText
            id="nombreEmpresa"
            v-model="proveedorLocal.nombreEmpresa"
            class="form-control"
            autocomplete="off"
            autofocus
          />
        </div>

        <div class="col-md-6">
          <label for="nit" class="form-label">NIT</label>
          <InputText id="nit" v-model="proveedorLocal.nit" class="form-control" autocomplete="off" />
        </div>

        <div class="col-md-6">
          <label for="responsable" class="form-label">Responsable</label>
          <InputText id="responsable" v-model="proveedorLocal.responsable" class="form-control" autocomplete="off" />
        </div>

        <div class="col-12">
          <label for="direccion" class="form-label">Dirección</label>
          <InputText id="direccion" v-model="proveedorLocal.direccion" class="form-control" autocomplete="off" />
        </div>

        <div class="col-md-6">
          <label for="celular" class="form-label">Celular</label>
          <InputText id="celular" v-model="proveedorLocal.celular" class="form-control" autocomplete="off" />
        </div>

        <div class="col-md-6">
          <label for="email" class="form-label">Email</label>
          <InputText id="email" v-model="proveedorLocal.email" class="form-control" autocomplete="off" />
        </div>

        <div class="col-12">
          <label for="condicionPago" class="form-label">Condición de Pago</label>
          <InputText id="condicionPago" v-model="proveedorLocal.condicionPago" class="form-control" autocomplete="off" />
        </div>

        <div class="col-12 d-flex justify-content-end gap-2 mt-2">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            class="p-button-sm"
            @click="dialogVisible = false"
          />
          <Button type="button" label="Guardar" icon="pi pi-save" class="p-button-sm" @click="handleSave" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped></style>
