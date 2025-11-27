<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import type { Producto } from '@/models/producto'
import type { UnidadMedida } from '@/models/UnidadMedida'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber, Dropdown } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'productos'

const props = defineProps({
  mostrar: Boolean,
  producto: {
    type: Object as () => Producto,
    default: () => ({}) as Producto,
  },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

const categorias = ref<Categoria[]>([])
const unidadesMedida = ref<UnidadMedida[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

/* -----------------------------------------------
   Default producto ALINEADO con tu backend
-------------------------------------------------- */
const defaultProducto = (): Producto => ({
  id: 0,
  nombre: '',
  descripcion: '',
  urlImagen: '',
  stockActual: 0,
  stockMinimo: 0,
  costoUnitarioPromedio: 0,
  perecedero: false,
  esVendible: false,

  categoria: { id: 0, nombre: '' },
  unidadMedida: { id: 0, nombre: '', simbolo: '' },

  // IDs para el form
  idCategoria: 0 as any,
  idUnidadMedida: 0 as any,
})

const productos = ref<Producto>(defaultProducto())

/* -----------------------------------------------
   CARGAR PRODUCTO EN MODO EDICIÓN
-------------------------------------------------- */
watch(
  () => props.producto,
  (nuevo) => {
    if (props.modoEdicion && nuevo) {
      productos.value = {
        ...defaultProducto(),
        ...nuevo,
        idCategoria: nuevo.categoria?.id ?? 0,
        idUnidadMedida: nuevo.unidadMedida?.id ?? 0,
      }
    } else {
      productos.value = defaultProducto()
    }
  },
  { immediate: true },
)

/* -----------------------------------------------
   CARGAR LISTAS DEL BACKEND
-------------------------------------------------- */
async function obtenerCategorias() {
  categorias.value = await http.get('categorias').then((res) => res.data)
}

async function obtenerUnidades() {
  // AJUSTADO AL BACKEND ACTUAL
  unidadesMedida.value = await http.get('unidad-medidas').then((res) => res.data)
}

/* -----------------------------------------------
   GUARDAR PRODUCTO
-------------------------------------------------- */
async function handleSave() {
  try {
    const body = {
      idCategoria: productos.value.idCategoria,
      nombre: productos.value.nombre.trim(),
      descripcion: productos.value.descripcion.trim(),
      urlImagen: productos.value.urlImagen,
      idUnidadMedida: productos.value.idUnidadMedida,
      costoUnitarioPromedio: productos.value.costoUnitarioPromedio,
      perecedero: productos.value.perecedero,
      esVendible: productos.value.esVendible,
    }

    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${productos.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    emit('guardar')
    productos.value = defaultProducto()
    dialogVisible.value = false
  } catch (err) {
    console.error(err)
    alert('Error al guardar producto')
  }
}

/* -----------------------------------------------
   CUANDO SE ABRE EL MODAL, CARGAR DATOS
-------------------------------------------------- */
watch(
  () => props.mostrar,
  (nuevo) => {
    if (nuevo) {
      obtenerCategorias()
      obtenerUnidades()
    }
  },
)
</script>

<template>
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Producto' : 'Crear Producto'"
      style="width: 28rem"
    >
      <!-- NOMBRE -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Nombre</label>
        <InputText v-model="productos.nombre" class="flex-auto" />
      </div>

      <!-- CATEGORÍA -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Categoría</label>
        <Dropdown
          v-model="productos.idCategoria"
          :options="categorias"
          optionLabel="nombre"
          optionValue="id"
          class="flex-auto"
          placeholder="Seleccione categoría"
        />
      </div>

      <!-- DESCRIPCIÓN -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Descripción</label>
        <InputText v-model="productos.descripcion" class="flex-auto" />
      </div>

      <!-- URL IMAGEN -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">URL Imagen</label>
        <InputText
          v-model="productos.urlImagen"
          class="flex-auto"
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <!-- PREVIEW -->
      <div v-if="productos.urlImagen" class="mb-3 text-center">
        <img
          :src="productos.urlImagen"
          alt="preview"
          style="max-width: 150px; border-radius: 8px"
        />
      </div>

      <!-- UNIDAD MEDIDA -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Unidad</label>
        <Dropdown
          v-model="productos.idUnidadMedida"
          :options="unidadesMedida"
          optionLabel="nombre"
          optionValue="id"
          class="flex-auto"
          placeholder="Seleccione unidad"
        />
      </div>

      <!-- COSTO PROMEDIO -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Costo Prom.</label>
        <InputNumber
          v-model="productos.costoUnitarioPromedio"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          class="flex-auto"
        />
      </div>

      <!-- PERECEDERO -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Perecedero</label>
        <input type="checkbox" v-model="productos.perecedero" />
      </div>

      <!-- ES VENDIBLE -->
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-4">Vendible</label>
        <input type="checkbox" v-model="productos.esVendible" />
      </div>

      <!-- BOTONES -->
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="dialogVisible = false" />
        <Button label="Guardar" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
