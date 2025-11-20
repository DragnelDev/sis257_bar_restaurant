<script setup lang="ts">
import ProveedorList from '@/components/proveedor/ProveedorList.vue'
import ProveedorSave from '@/components/proveedor/ProveedorSave.vue'
import type { Proveedor } from '@/models/Proveedor'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const proveedorListRef = ref<InstanceType<typeof ProveedorList> | null>(null)
const proveedorEdit = ref<Proveedor | null>(null)

function handleCreate() {
  proveedorEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(proveedor: Proveedor) {
  proveedorEdit.value = proveedor
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  proveedorListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container-fluid px-3 py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Proveedores</h2>
      <div>
        <Button label="Crear Nuevo" icon="pi pi-plus" class="p-button-primary" @click="handleCreate" />
      </div>
    </div>

    <ProveedorList ref="proveedorListRef" @edit="handleEdit" />

    <ProveedorSave
      :mostrar="mostrarDialog"
      :proveedor="proveedorEdit"
      :modoEdicion="!!proveedorEdit"
      @guardar="handleGuardar"
      @close="handleCloseDialog"
    />
  </div>
</template>
