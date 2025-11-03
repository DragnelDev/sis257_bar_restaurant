<script setup lang="ts">
import type { Venta } from '@/models/Venta'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'ventas'
const ventas = ref<Venta[]>([])
const ventaDelete = ref<Venta | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const ventasFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase()
  return ventas.value.filter(
    (venta) =>
      (venta.estado ?? '').toLowerCase().includes(q) ||
      String(venta.idMesa ?? '').includes(q) ||
      String(venta.idUsuario ?? '').includes(q) ||
      String(venta.total ?? '').includes(q),
  )
})

async function obtenerLista() {
  ventas.value = await http.get(ENDPOINT).then((res) => res.data)
}

function emitirEdicion(venta: Venta) {
  emit('edit', venta)
}

function mostrarEliminarConfirm(venta: Venta) {
  ventaDelete.value = venta
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  if (ventaDelete.value?.id) {
    await http.delete(`${ENDPOINT}/${ventaDelete.value.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
  }
}

onMounted(obtenerLista)
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="col-7 pl-0 mt-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText
          v-model="busqueda"
          type="text"
          placeholder="Buscar por estado, mesa, usuario o total"
        />
      </InputGroup>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Estado</th>
          <th>Total</th>
          <th>ID Mesa</th>
          <th>ID Usuario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(venta, index) in ventasFiltradas" :key="venta.id">
          <td>{{ index + 1 }}</td>
          <td>{{ venta.estado }}</td>
          <td>{{ venta.total }}</td>
          <td>{{ venta.idMesa }}</td>
          <td>{{ venta.idUsuario }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(venta)" />
            <Button
              icon="pi pi-trash"
              aria-label="Eliminar"
              text
              @click="mostrarEliminarConfirm(venta)"
            />
          </td>
        </tr>
        <tr v-if="ventasFiltradas.length === 0">
          <td colspan="6">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar la venta con estado "{{ ventaDelete?.estado }}"?</p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="mostrarConfirmDialog = false"
        />
        <Button type="button" label="Eliminar" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
