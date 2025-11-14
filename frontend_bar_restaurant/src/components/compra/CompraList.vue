<script setup lang="ts">
import type { Compra } from '@/models/compra'
import type { DetalleCompra } from '@/models/DetalleCompra'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'detalle-compras/detailed-list'
const detallesCompra = ref<DetalleCompra[]>([])
const compraDelete = ref<Compra | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
// El evento 'edit' emitirá el objeto Compra
const emit = defineEmits(['edit'])

function fechaToString(f: string | Date | null | undefined) {
  if (!f) return ''
  // Aseguramos que la fecha sea un objeto Date si viene de la API como string ISO
  const date = typeof f === 'string' ? new Date(f) : f
  if (date instanceof Date && !isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  return String(f)
}

// El filtro debe buscar en las propiedades del detalle, la compra, el proveedor, etc.
const detallesFiltrados = computed(() => {
  return detallesCompra.value.filter((detalle) => {
    const q = busqueda.value.toLowerCase()
    const compra = detalle.compra // Accedemos a la cabecera

    return (
      // Búsqueda por Proveedor (asumiendo nombre en el objeto proveedor)
      compra?.proveedor?.nombreEmpresa?.toLowerCase().includes(q) ||
      // Búsqueda por Producto (asumiendo nombre en el objeto producto)
      detalle.producto?.nombre?.toLowerCase().includes(q) ||
      // Búsqueda por Usuario (asumiendo nombre en el objeto usuario)
      compra?.usuario?.usuario?.includes(q) ||
      // Búsqueda por Fecha
      fechaToString(compra?.fechaCompra).toLowerCase().includes(q) ||
      // Búsqueda por Total
      String(detalle.subTotal ?? '').includes(q)
    )
  })
})

async function obtenerLista() {
  // Tipado a DetalleCompra[]
  detallesCompra.value = await http.get<DetalleCompra[]>(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(compra: Compra) {
  emit('edit', compra)
}

function mostrarEliminarConfirm(compra: Compra) {
  compraDelete.value = compra
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  // La eliminación solo requiere el ID
  await http.delete(`${ENDPOINT}/${compraDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}

onMounted(() => {
  obtenerLista()
})
// La función obtenerLista es expuesta para que el componente padre la pueda llamar
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
          placeholder="Buscar por fecha, proveedor, usuario o total"
        />
      </InputGroup>
    </div>

    <table class="table-responsive">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Proveedor</th>
          <th>Numero de Factura</th>
          <th>Fecha Compra</th>
          <th>Fecha Recepcion</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Costo Unitario</th>
          <th>Sub Total</th>
          <th>Usuario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(detalle, index) in detallesFiltrados" :key="detalle.id">
          <td>{{ index + 1 }}</td>

          <td>{{ detalle.compra?.proveedor?.nombreEmpresa ?? 'N/A' }}</td>
          <td>{{ detalle.compra?.numeroFactura }}</td>
          <td>{{ fechaToString(detalle.compra?.fechaCompra) }}</td>
          <td>{{ fechaToString(detalle.compra?.fechaRecepcion) }}</td>

          <td>{{ detalle.producto?.nombre ?? 'N/A' }}</td>
          <td>{{ detalle.cantidad }}</td>
          <td>{{ detalle.precioUnitarioCompra }}</td>
          <td>{{ detalle.subTotal }}</td>

          <td>{{ detalle.compra?.usuario?.usuario ?? 'N/A' }}</td>

          <td>
            <Button
              v-if="detalle.compra"
              icon="pi pi-pencil"
              aria-label="Ver/Editar Compra"
              text
              @click="emitirEdicion(detalle.compra)"
            />
            <Button
              v-if="detalle.compra"
              icon="pi pi-trash"
              aria-label="Eliminar Compra"
              text
              @click="mostrarEliminarConfirm(detalle.compra)"
            />
          </td>
        </tr>
        <tr v-if="detallesFiltrados.length === 0">
          <td colspan="9">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>
        ¿Estás seguro de que deseas eliminar la compra con fecha **{{
          fechaToString(compraDelete?.fechaCompra)
        }}**?
      </p>
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

<style scoped>
.table-responsive {
  overflow-x: auto; /* Permite el desplazamiento horizontal */
}

/* Opcional: Forzar un ancho mínimo para la tabla para que el scroll funcione */
table {
  min-width: 600px;
  border-collapse: collapse;
}

/* Estilos de PrimeVue para la tabla si no están aplicados */
table th,
table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6; /* Líneas de PrimeVue */
}
</style>
