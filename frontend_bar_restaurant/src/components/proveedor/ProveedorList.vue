<template>
  <div>
    <div class="col-7 pl-0 mt-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre o NIT" />
      </InputGroup>
    </div>

    <div v-if="error" class="error-message mt-4">{{ error }}</div>
    <div v-if="cargando" class="loading-message mt-4">Cargando proveedores...</div>

    <table v-if="!cargando && !error">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>NIT</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prov in proveedoresFiltrados" :key="prov.id">
          <td>{{ prov.id }}</td>
          <td>{{ prov.nombre }}</td>
          <td>{{ prov.nit }}</td>
          <td>{{ prov.telefono }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitEdit(prov)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text @click="confirmDelete(prov)" />
          </td>
        </tr>
        <tr v-if="proveedoresFiltrados.length === 0">
          <td colspan="5">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Eliminar proveedor {{ proveedorDelete?.nombre }}?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Proveedor } from '@/models/Proveedor'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'proveedores'
const proveedores = ref<Proveedor[]>([])
const proveedorDelete = ref<Proveedor | null>(null)
const mostrarConfirmDialog = ref(false)
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const emit = defineEmits(['edit'])

const proveedoresFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return proveedores.value.filter(
    (p) => (p.nombre || '').toLowerCase().includes(q) || (p.nit || '').toLowerCase().includes(q),
  )
})

async function obtenerLista() {
  try {
    cargando.value = true
    error.value = ''
    const response = await http.get(ENDPOINT)
    proveedores.value = response.data
  } catch (err) {
    console.error('Error al obtener proveedores', err)
    error.value = err instanceof Error ? err.message : 'Error al cargar proveedores'
    proveedores.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerLista()
})

defineExpose({ obtenerLista })

function emitEdit(p: Proveedor) {
  emit('edit', p)
}

function confirmDelete(p: Proveedor) {
  proveedorDelete.value = p
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  if (!proveedorDelete.value) return
  await http.delete(`${ENDPOINT}/${proveedorDelete.value.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}
</script>

<style scoped></style>
