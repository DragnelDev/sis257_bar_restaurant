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
  precioVentaUnitario: 0,

  categoria: { id: 0, nombre: '' },
  unidadMedida: { id: 0, nombre: '', simbolo: '' },

  // IDs para el form
  idCategoria: 0 as number,
  idUnidadMedida: 0 as number,
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
      precioVentaUnitario: productos.value.precioVentaUnitario,
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
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Producto' : 'Crear Producto'"
    style="width: 100%; max-width: 650px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
  >
    <div class="form-container">
      <!-- Row 1: Nombre y Categoría -->
      <div class="form-row">
        <div class="form-field">
          <label for="nombre" class="form-label">Nombre</label>
          <InputText
            id="nombre"
            v-model="productos.nombre"
            class="w-full form-input"
            placeholder="Ingrese nombre"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="idCategoria" class="form-label">Categoría</label>
          <Dropdown
            id="idCategoria"
            v-model="productos.idCategoria"
            :options="categorias"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione categoría"
            class="w-full"
          />
        </div>
      </div>

      <!-- Row 2: Descripción completa -->
      <div class="form-field">
        <label for="descripcion" class="form-label">Descripción</label>
        <InputText
          id="descripcion"
          v-model="productos.descripcion"
          class="w-full form-input"
          placeholder="Ingrese descripción"
          autocomplete="off"
        />
      </div>

      <!-- Row 3: URL Imagen y Unidad -->
      <div class="form-row">
        <div class="form-field">
          <label for="urlImagen" class="form-label">URL Imagen</label>
          <InputText
            id="urlImagen"
            v-model="productos.urlImagen"
            class="w-full form-input"
            placeholder="https://ejemplo.com/imagen.jpg"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="idUnidadMedida" class="form-label">Unidad Medida</label>
          <Dropdown
            id="idUnidadMedida"
            v-model="productos.idUnidadMedida"
            :options="unidadesMedida"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione unidad"
            class="w-full"
          />
        </div>
      </div>

      <!-- Preview de imagen -->
      <div v-if="productos.urlImagen" class="form-field">
        <img
          :src="productos.urlImagen"
          alt="preview"
          style="max-width: 150px; border-radius: 8px; margin-top: 8px"
        />
      </div>

      <!-- Row 4: Costo y Perecedero -->
      <div class="form-row">
        <div class="form-field">
          <label for="costoUnitarioPromedio" class="form-label">Costo Promedio</label>
          <InputNumber
            id="costoUnitarioPromedio"
            v-model="productos.costoUnitarioPromedio"
            class="w-full"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            placeholder="0.00"
          />
        </div>
        <div class="form-field">
          <label for="perecedero" class="form-label">Perecedero</label>
          <div class="checkbox-wrapper">
            <input type="checkbox" id="perecedero" v-model="productos.perecedero" />
          </div>
        </div>
      </div>

      <!-- Row 5: Es Vendible -->
      <div class="form-field">
        <label for="esVendible" class="form-label">Es Vendible</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="esVendible" v-model="productos.esVendible" />
          <span class="checkbox-label">Sí, este producto es vendible</span>
        </div>
      </div>

      <!-- Row 6: Precio Venta (condicional) -->
      <div v-if="productos.esVendible" class="form-field">
        <label for="precioVentaUnitario" class="form-label">Precio Venta Unitario</label>
        <InputNumber
          id="precioVentaUnitario"
          v-model="productos.precioVentaUnitario"
          class="w-full"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          placeholder="0.00"
        />
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          class="btn-cancel"
          @click="dialogVisible = false"
        />
        <Button
          type="button"
          label="Guardar"
          class="btn-save"
          @click="handleSave"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Form Row - Grid Layout for multiple fields */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Form Label */
.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333333;
  display: block;
}

/* Form Input - Light Mode */
.form-input {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
  font-family: inherit !important;
}

.form-input:focus {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
  outline: none !important;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Checkbox wrapper */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  padding: 0.65rem 0;
  gap: 8px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff4081;
}

.checkbox-label {
  color: #555555;
  font-size: 0.9rem;
}

/* PrimeVue Dropdown Light Mode */
:deep(.p-dropdown) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  border-radius: 6px !important;
  width: 100%;
}

:deep(.p-dropdown .p-dropdown-label) {
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
}

:deep(.p-dropdown:hover) {
  border-color: #c1c7cd !important;
}

:deep(.p-dropdown.p-focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
  color: #333333 !important;
  padding: 0.75rem 1rem !important;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background: #ff4081 !important;
  color: white !important;
}

/* PrimeVue InputNumber Light Mode */
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
}

:deep(.p-inputnumber .p-inputnumber-input:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
}

:deep(.p-inputnumber-button) {
  background: #f8f9fa !important;
  border: 1px solid #d1d9df !important;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e1e8ed;
}

/* Save Button */
.btn-save {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: white !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.25) !important;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(255, 64, 129, 0.35) !important;
}

.btn-save:active:not(:disabled) {
  transform: translateY(0) !important;
}

.btn-save:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* Cancel Button */
.btn-cancel {
  background-color: #ffffff !important;
  color: #333333 !important;
  border: 2px solid #d1d9df !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

.btn-cancel:hover {
  background-color: #f8f9fa !important;
  border-color: #c1c7cd !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.btn-cancel:active {
  transform: translateY(0) !important;
}

/* Dialog Customization */
:deep(.dialog-header-custom) {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
  border-bottom: 2px solid rgba(255, 64, 129, 0.15) !important;
  padding: 20px !important;
}

:deep(.dialog-header-custom .p-dialog-title) {
  color: #333333 !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
}

:deep(.dialog-content-custom) {
  background-color: #ffffff !important;
  padding: 20px !important;
  color: #333333 !important;
}

/* Focus states for accessibility */
:deep(.p-button:focus) {
  outline: 3px solid rgba(255, 64, 129, 0.25) !important;
  outline-offset: 2px !important;
}
</style>
