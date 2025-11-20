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

    <div class="table-responsive mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width:48px">Nro.</th>
            <th>Nombre Receta</th>
            <th style="width:110px">Imagen</th>
            <th>Descripcion</th>
            <th>Precio Venta</th>
            <th>Costo Actual</th>
            <th>Cant.</th>
            <th>Unidad</th>
            <th>Producto</th>
            <th>Stock</th>
            <th style="width:120px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(detalle, index) in detallesFiltrados" :key="detalle.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="fw-bold">{{ detalle?.receta?.nombreReceta ?? 'N/A' }}</td>
            <td>
              <img
                :src="detalle?.receta?.urlImagen || '/public/img/default-recipe.png'"
                :alt="`Imagen de ${detalle?.receta?.nombreReceta || 'receta'}`"
                class="imagen-receta-tabla"
              />
            </td>
            <td class="text-truncate" style="max-width:280px">{{ detalle?.receta?.descripcion ?? 'N/A' }}</td>
            <td>Bs. {{ detalle?.receta?.precioVentaActual ?? '0.00' }}</td>
            <td>Bs. {{ detalle?.receta?.costoActual ?? '0.00' }}</td>
            <td class="text-center">{{ detalle.cantidadConsumida }}</td>
            <td class="text-center">{{ detalle.unidadConsumo }}</td>
            <td>{{ detalle.producto?.nombre ?? 'N/A' }}</td>
            <td class="text-center">{{ detalle.producto?.stockActual ?? 'N/A' }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button icon="pi pi-pencil" aria-label="Editar" class="p-button-text p-button-sm" @click="emitirEdicion(detalle.receta)" />
                <Button icon="pi pi-trash" aria-label="Eliminar" class="p-button-text p-button-sm text-danger" @click="mostrarEliminarConfirm(detalle.receta)" />
              </div>
            </td>
          </tr>
          <tr v-if="detallesFiltrados.length === 0">
            <td colspan="11" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

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
.imagen-receta-tabla {
  width: 80px; /* Mantener el ancho original o ajustarlo */
  height: 80px; /* Asegurar que sea cuadrada para un redondeado perfecto */
  object-fit: cover; /* Recortar la imagen para que cubra el área sin distorsionarse */
  border-radius: 10px; /* Redondear las esquinas (puedes usar 50% para hacerla circular) */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra suave para darle profundidad */
  transition: transform 0.2s ease-in-out; /* Transición suave para efectos hover */
}

.imagen-receta-tabla:hover {
  transform: scale(1.05); /* Ligeramente más grande al pasar el ratón */
}

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

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 576px) {
  .table-responsive table thead {
    display: none;
  }
  .table-responsive table tbody tr {
    display: block;
    margin-bottom: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 0.375rem;
    padding: 0.5rem;
  }
  .table-responsive table tbody td {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0.5rem;
  }
}
</style>
