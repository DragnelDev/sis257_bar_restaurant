<script setup lang="ts">
import type { DetalleReceta } from '@/models/DetalleReceta'
import type { Receta } from '@/models/Receta'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'recetas'
const detallesReceta = ref<DetalleReceta[]>([])
const recetaDelete = ref<Receta | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
// El evento 'edit' emitirá el objeto Compra
const emit = defineEmits(['edit'])

// El filtro debe buscar en las propiedades del detalle...
const detallesFiltrados = computed(() => {
  return detallesReceta.value.filter((detalle) => {
    const q = busqueda.value.toLowerCase()
    const receta = detalle.receta // Accedemos a la cabecera

    return (
      receta?.nombreReceta?.toLowerCase().includes(q) ||
      detalle.producto?.nombre?.toLowerCase().includes(q) ||
      detalle?.producto?.categoria?.nombre?.includes(q)
    )
  })
})

async function obtenerLista() {
  try {
    const response = await http.get(ENDPOINT)
    let data = response?.data

    // Si la respuesta viene envuelta en { data: ... }
    if (data && data.data) data = data.data

    // Si ya es un arreglo de detalles, asignar directamente
    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('idReceta')) {
      detallesReceta.value = data as DetalleReceta[]
      return
    }

    // Si la API devolvió un array de recetas con campo 'detalles' o 'ingredientes', aplanar a DetalleReceta[]
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      (data[0].hasOwnProperty('detalles') || data[0].hasOwnProperty('ingredientes'))
    ) {
      const flattened: DetalleReceta[] = []
      ;(data as any[]).forEach((recetaObj) => {
        const receta = recetaObj as any
        // soportar 'detalles' o 'ingredientes'
        const detallesArr = receta.detalles || receta.ingredientes || []
        detallesArr.forEach((d: any) => {
          flattened.push({
            id: d.id ?? 0,
            idReceta: d.idReceta ?? receta.id,
            idProducto: d.idProducto ?? d.producto?.id ?? 0,
            cantidadConsumida: Number(d.cantidadConsumida ?? d.cantidad ?? 0),
            unidadConsumo: d.unidadConsumo ?? d.unidad ?? '',
            receta: receta,
            producto: d.producto ?? null,
          })
        })
      })
      detallesReceta.value = flattened
      return
    }

    // Si la API devolvió directamente Receta[] sin detalles, convertir a lista vacía o loggear
    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('nombreReceta')) {
      // No hay detalles; intentamos informar y asignar vacío
      console.warn(
        'Recetas recibidas pero no contienen detalles. Debería usar un endpoint de detalles.',
      )
      detallesReceta.value = []
      return
    }

    // Fallback: asignar lo que venga (si es array)
    if (Array.isArray(data)) detallesReceta.value = data as DetalleReceta[]
    else detallesReceta.value = []
  } catch (err) {
    console.error('Error obteniendo recetas:', err)
    detallesReceta.value = []
  }
}

function emitirEdicion(receta: Receta) {
  emit('edit', receta)
}

function mostrarEliminarConfirm(receta: Receta) {
  recetaDelete.value = receta
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  // La eliminación solo requiere el ID
  await http.delete(`${ENDPOINT}/${recetaDelete.value?.id}`)
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
          placeholder="Buscar por receta, categoria o producto"
        />
      </InputGroup>
    </div>

    <table class="table-responsive">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Nombre Receta</th>
          <th>Descripcion</th>
          <th>Precio de Venta</th>
          <th>Costo Actual</th>
          <th>Cantidad Consumida</th>
          <th>Unidad Consumida</th>
          <th>Nombre Producto</th>
          <th>Stock Producto</th>
          <th>Perecedero</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(detalle, index) in detallesFiltrados" :key="detalle.id">
          <td>{{ index + 1 }}</td>

          <td>{{ detalle?.receta?.nombreReceta ?? 'N/A' }}</td>
          <td>{{ detalle?.receta?.descripcion ?? 'N/A' }}</td>
          <td>{{ detalle?.receta?.precioVentaActual ?? 'N/A' }}</td>
          <td>{{ detalle?.receta?.costoActual ?? 'N/A' }}</td>
          <td>{{ detalle.cantidadConsumida }}</td>
          <td>{{ detalle.unidadConsumo }}</td>

          <td>{{ detalle.producto?.nombre ?? 'N/A' }}</td>
          <td>{{ detalle.producto?.stockActual ?? 'N/A' }}</td>
          <td>{{ detalle.producto?.perecedero ?? 'N/A' }}</td>

          <td>
            <Button
              v-if="detalle.receta"
              icon="pi pi-pencil"
              aria-label="Ver/Editar Receta"
              text
              @click="emitirEdicion(detalle.receta)"
            />
            <Button
              v-if="detalle.receta"
              icon="pi pi-trash"
              aria-label="Eliminar Receta"
              text
              @click="mostrarEliminarConfirm(detalle.receta)"
            />
          </td>
        </tr>
        <tr v-if="detallesFiltrados.length === 0">
          <td colspan="11">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar la receta de **{{ recetaDelete?.nombreReceta }}**?</p>
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
