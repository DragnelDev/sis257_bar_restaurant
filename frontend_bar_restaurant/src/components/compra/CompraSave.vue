<script setup lang="ts">
import type { Compra } from '@/models/compra'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'compras'
const props = defineProps({
  mostrar: Boolean,
  compra: {
    type: Object as () => Compra,
    default: () => ({}) as Compra,
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

const localCompra = ref<Compra>({ ...(props.compra as Compra) })
watch(
  () => props.compra,
  (newVal) => {
    localCompra.value = { ...(newVal as Compra) }
  },
  { immediate: true },
)

async function handleSave() {
  try {
    const fecha = localCompra.value.fechaCompra
    const fechaToSend = fecha instanceof Date ? fecha.toISOString().slice(0, 10) : fecha
    const body = {
      fechaCompra: fechaToSend,
      total: localCompra.value.total,
      idProveedor: localCompra.value.idProveedor,
      idUsuario: localCompra.value.idUsuario,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${localCompra.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    localCompra.value = {} as Compra
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
      :header="props.modoEdicion ? 'Editar Compra' : 'Crear Compra'"
      style="width: 25rem"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="fechaCompra" class="font-semibold w-3">Fecha</label>
        <InputText
          id="fechaCompra"
          v-model="localCompra.fechaCompra"
          class="flex-auto"
          placeholder="YYYY-MM-DD"
        />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="total" class="font-semibold w-3">Total</label>
        <InputNumber
          id="total"
          v-model="localCompra.total"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          class="flex-auto"
        />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="idProveedor" class="font-semibold w-3">Id Proveedor</label>
  <InputNumber id="idProveedor" v-model="localCompra.idProveedor" class="flex-auto" :min="0" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="idUsuario" class="font-semibold w-3">Id Usuario</label>
  <InputNumber id="idUsuario" v-model="localCompra.idUsuario" class="flex-auto" :min="0" />
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          @click="dialogVisible = false"
        ></Button>
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave"></Button>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
