<script setup lang="ts">
import type { Compra } from '@/models/Compra'
import type { DetalleCompra } from '@/models/DetalleCompra'
import http from '@/plugins/axios'

import { Button, Dialog, InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'

import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'detalle-compras/detailed-list'

const detallesCompra = ref<DetalleCompra[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const busqueda = ref('')
const compraDelete = ref<Compra | null>(null)
const mostrarConfirmDialog = ref(false)

const toast = useToast()
const emit = defineEmits(['edit'])

function fechaToString(f: any): string {
  if (!f) return ''
  const d = typeof f === 'string' ? new Date(f) : f
  return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : ''
}

const detallesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  if (!q) return detallesCompra.value

  return detallesCompra.value.filter((d) => {
    const c = d.compra
    return [
      c?.proveedor?.nombreEmpresa,
      c?.numeroFactura,
      d.producto?.nombre,
      c?.usuario?.usuario,
      fechaToString(c?.fechaCompra),
      d.subTotal?.toString(),
      d.precioUnitarioCompra?.toString(),
    ]
      .map((x) => (x ?? '').toString().toLowerCase())
      .some((x) => x.includes(q))
  })
})

async function obtenerLista() {
  try {
    loading.value = true
    errorMessage.value = null

    const response = await http.get(ENDPOINT)

    let data = response.data

    if (Array.isArray(data)) {
      detallesCompra.value = data as DetalleCompra[]
    }
    else if (Array.isArray(data.detalles)) {
      detallesCompra.value = data.detalles
    }
    else {
      const firstArray = Object.values(data).find((v) => Array.isArray(v))
      detallesCompra.value = (firstArray as DetalleCompra[]) ?? []
    }
  } catch (error: any) {
    console.error('Error cargando detalles:', error)
    errorMessage.value = 'No se pudieron cargar los detalles de compra.'
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage.value, life: 4000 })
  } finally {
    loading.value = false
  }
}

function emitirEdicion(compra: Compra) {
  emit('edit', compra)
}

function mostrarEliminarConfirm(compra: Compra) {
  compraDelete.value = compra
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  if (!compraDelete.value?.id) return

  try {
    await http.delete(`compras/${compraDelete.value.id}`)

    toast.add({
      severity: 'success',
      summary: 'Compra eliminada',
      detail: 'La compra fue eliminada correctamente.',
      life: 3000,
    })

    mostrarConfirmDialog.value = false
    obtenerLista()
  } catch (error) {
    console.error('Error eliminando compra:', error)
    toast.add({
      severity: 'error',
      summary: 'Error al eliminar',
      detail: 'No se pudo eliminar la compra.',
      life: 4000,
    })
  }
}

onMounted(() => obtenerLista())

defineExpose({ obtenerLista })
</script>

<template>
  <div class="card p-4">
    <div class="grid p-fluid">
      <div class="col-12 md:col-4 mb-4">
        <div class="p-inputgroup">
          <span class="p-inputgroup-addon">
            <i class="pi pi-search" />
          </span>
          <InputText
            v-model="busqueda"
            placeholder="Buscar por proveedor"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="p-mb-3">Cargando compras...</div>
    <div v-else-if="errorMessage" class="p-mb-3 text-danger">{{ errorMessage }}</div>

    <div class="overflow-auto border-round border-1 surface-border">
      <table class="p-datatable-table w-full compra-details-list-table">
        <thead>
          <tr>
            <th>Nro.</th>
            <th>Proveedor</th>
            <th>Factura</th>
            <th>Fecha Compra</th>
            <th>Fecha Recepción</th>
            <th>Producto</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Costo Unitario</th>
            <th class="text-right">Sub Total</th>
            <th>Usuario</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(detalle, i) in detallesFiltrados"
            :key="detalle.id"
            class="hover:surface-hover transition-colors"
          >
            <td>{{ i + 1 }}</td>
            <td>{{ detalle.compra?.proveedor?.nombreEmpresa ?? 'N/A' }}</td>
            <td>{{ detalle.compra?.numeroFactura }}</td>
            <td>{{ fechaToString(detalle.compra?.fechaCompra) }}</td>
            <td>{{ fechaToString(detalle.compra?.fechaRecepcion) }}</td>

            <td>{{ detalle.producto?.nombre ?? 'N/A' }}</td>
            <td class="text-right">{{ detalle.cantidad }}</td>
            <td class="text-right">{{ Number(detalle.precioUnitarioCompra).toFixed(2) }}</td>
            <td class="text-right font-bold">{{ Number(detalle.subTotal).toFixed(2) }}</td>

            <td>{{ detalle.compra?.usuario?.usuario }}</td>

            <td class="text-center">
              <Button
                icon="pi pi-pencil"
                severity="info"
                text
                rounded
                class="p-button-sm"
                @click="emitirEdicion(detalle.compra)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                class="p-button-sm ml-2"
                @click="mostrarEliminarConfirm(detalle.compra)"
              />
            </td>
          </tr>

          <tr v-if="detallesFiltrados.length === 0">
            <td colspan="11" class="text-center p-3 text-color-secondary">
              No se encontraron resultados para su búsqueda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>

        <p class="m-0">
          ¿Eliminar la <b>COMPRA COMPLETA</b> con fecha
          <b>{{ fechaToString(compraDelete?.fechaCompra) }}</b
          >?
          <br />
          Esta acción no se puede deshacer.
        </p>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="mostrarConfirmDialog = false"
        />
        <Button label="Eliminar" severity="danger" icon="pi pi-trash" @click="eliminar" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.compra-details-list-table {
  border-collapse: collapse;
}

.compra-details-list-table th {
  background: var(--surface-ground);
  color: var(--text-color-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  white-space: nowrap;
}

.compra-details-list-table th,
.compra-details-list-table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}
.font-bold {
  font-weight: bold;
}
</style>
