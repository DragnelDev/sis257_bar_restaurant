<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import type { Producto } from '@/models/producto'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber, Dropdown, Checkbox } from 'primevue'
import { computed, ref, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { UnidadMedida } from '@/models/UnidadMedida'

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
const toast = useToast()
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) {
      resetForm()
      emit('close')
    }
  },
})

const defaultProducto = (): Producto => ({
  idCategoria: 0,
  idUnidadMedida: 0,
  nombre: '',
  urlImagen: '',
  descripcion: '',
  costoUnitarioPromedio: 0,
  perecedero: false,
  esVendible: false,
  precioVentaUnitario: undefined,
} as Producto)

const productoLocal = ref<Producto>(defaultProducto())
const errors = ref<Record<string, string>>({})

// Watch para sincronizar props con estado local
watch(
  () => props.producto,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      productoLocal.value = {
        ...defaultProducto(),
        ...(newVal as Producto),
        idCategoria: newVal.categoria?.id || newVal.idCategoria || 0,
        idUnidadMedida: newVal.unidadMedida?.id || newVal.idUnidadMedida || 0
      }
    } else {
      resetForm()
    }
  },
  { immediate: true, deep: true }
)

// Watch para validación en tiempo real
watch(
  () => productoLocal.value,
  () => {
    validateForm()
  },
  { deep: true }
)

// Cargar categorías al montar el componente
onMounted(() => {
  obtenerCategorias()
  obtenerUnidadesMedida()
})

async function obtenerCategorias() {
  try {
    const response = await http.get('categorias')
    categorias.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las categorías',
      life: 3000,
    })
    categorias.value = []
  }
}

async function obtenerUnidadesMedida() {
  try {
    const response = await http.get('unidad-medidas')
    unidadesMedida.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    console.error('Error al cargar unidades de medida:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las unidades de medida',
      life: 3000,
    })
    unidadesMedida.value = []
  }
}

function validateForm(): boolean {
  errors.value = {}

  if (!productoLocal.value.nombre?.trim()) {
    errors.value.nombre = 'El nombre es obligatorio'
  } else if (productoLocal.value.nombre.trim().length < 2) {
    errors.value.nombre = 'El nombre debe tener al menos 2 caracteres'
  }

  if (!productoLocal.value.idCategoria || productoLocal.value.idCategoria <= 0) {
    errors.value.categoria = 'Debe seleccionar una categoría'
  }

  if (!productoLocal.value.idUnidadMedida || productoLocal.value.idUnidadMedida <= 0) {
    errors.value.idUnidadMedida = 'Debe seleccionar una unidad de medida'
  }

  if (productoLocal.value.costoUnitarioPromedio < 0) {
    errors.value.costoUnitarioPromedio = 'El costo no puede ser negativo'
  }

  return Object.keys(errors.value).length === 0
}

function resetForm() {
  productoLocal.value = defaultProducto()
  errors.value = {}
}

async function handleSave() {
  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Por favor, corrija los errores en el formulario',
      life: 3000,
    })
    return
  }

  loading.value = true
  try {
    const body = {
      idCategoria: Number(productoLocal.value.idCategoria),
      nombre: productoLocal.value.nombre.trim(),
      urlImagen: productoLocal.value.urlImagen?.trim() || '',
      descripcion: productoLocal.value.descripcion?.trim() || '',
      idUnidadMedida: Number(productoLocal.value.idUnidadMedida),
      costoUnitarioPromedio: Number(productoLocal.value.costoUnitarioPromedio) || 0,
      perecedero: Boolean(productoLocal.value.perecedero),
      esVendible: Boolean(productoLocal.value.esVendible),
      precioVentaUnitario: productoLocal.value.esVendible ? Number(productoLocal.value.precioVentaUnitario) || 0 : 0,
    }

    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${productoLocal.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Producto actualizado correctamente',
        life: 3000,
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Producto creado correctamente',
        life: 3000,
      })
    }

    emit('guardar')
    resetForm()
    dialogVisible.value = false
  } catch (error: any) {
    console.error('Error al guardar:', error)

    let errorMessage = 'Error al guardar el producto'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Producto' : 'Nuevo Producto'"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '500px' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw', '480px': '95vw' }"
    :closable="true"
    :closeOnEscape="true"
    class="producto-dialog"
  >
    <div class="form-container">
      <!-- Nombre -->
      <div class="form-field">
        <label for="nombre" class="form-label">
          Nombre
          <span class="required-asterisk" aria-hidden="true">*</span>
        </label>
        <InputText
          id="nombre"
          v-model="productoLocal.nombre"
          class="w-full form-input"
          :class="{ 'p-invalid': errors.nombre }"
          autocomplete="off"
          autofocus
          placeholder="Nombre del producto"
          aria-describedby="nombre-error"
          :aria-invalid="!!errors.nombre"
        />
        <small v-if="errors.nombre" id="nombre-error" class="error-text">
          {{ errors.nombre }}
        </small>
      </div>

      <!-- Categoría -->
      <div class="form-field">
        <label for="categoria" class="form-label">
          Categoría
          <span class="required-asterisk" aria-hidden="true">*</span>
        </label>
        <Dropdown
          id="categoria"
          v-model="productoLocal.idCategoria"
          :options="categorias"
          optionLabel="nombre"
          optionValue="id"
          class="w-full"
          :class="{ 'p-invalid': errors.categoria }"
          placeholder="Seleccione categoría"
          :filter="true"
          filterPlaceholder="Buscar categoría..."
          showClear
          :loading="categorias.length === 0"
          aria-describedby="categoria-error"
          :aria-invalid="!!errors.categoria"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex align-items-center">
              <span>{{ categorias.find(c => c.id === slotProps.value)?.nombre || slotProps.value }}</span>
            </div>
            <span v-else class="text-color-secondary">
              Seleccione categoría
            </span>
          </template>
        </Dropdown>
        <small v-if="errors.categoria" id="categoria-error" class="error-text">
          {{ errors.categoria }}
        </small>
      </div>

      <!-- URL Imagen -->
      <div class="form-field">
        <label for="urlImagen" class="form-label">URL de Imagen</label>
        <InputText
          id="urlImagen"
          v-model="productoLocal.urlImagen"
          class="w-full form-input"
          autocomplete="off"
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <!-- Descripción -->
      <div class="form-field">
        <label for="descripcion" class="form-label">Descripción</label>
        <InputText
          id="descripcion"
          v-model="productoLocal.descripcion"
          class="w-full form-input"
          autocomplete="off"
          placeholder="Descripción del producto"
        />
      </div>

      <!-- Unidad de Medida -->
      <div class="form-field">
        <label for="unidadMedida" class="form-label">
          Unidad de Medida
          <span class="required-asterisk" aria-hidden="true">*</span>
        </label>
        <Dropdown
          id="unidadMedida"
          v-model="productoLocal.idUnidadMedida"
          :options="unidadesMedida"
          optionLabel="nombre"
          optionValue="id"
          class="w-full"
          :class="{ 'p-invalid': errors.idUnidadMedida }"
          placeholder="Seleccione unidad"
          :filter="true"
          filterPlaceholder="Buscar unidad..."
          showClear
          :loading="unidadesMedida.length === 0"
          aria-describedby="unidad-error"
          :aria-invalid="!!errors.idUnidadMedida"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex align-items-center">
              <span>{{ unidadesMedida.find(u => u.id === slotProps.value)?.nombre || slotProps.value }}</span>
            </div>
            <span v-else class="text-color-secondary">
              Seleccione unidad
            </span>
          </template>
        </Dropdown>
        <small v-if="errors.idUnidadMedida" id="unidad-error" class="error-text">
          {{ errors.idUnidadMedida }}
        </small>
      </div>

      <!-- Costo Promedio -->
      <div class="form-field">
        <label for="costoPromedio" class="form-label">Costo Promedio</label>
        <InputNumber
          id="costoPromedio"
          v-model="productoLocal.costoUnitarioPromedio"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          class="w-full"
          :class="{ 'p-invalid': errors.costoUnitarioPromedio }"
          :min="0"
          :max="9999999"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          placeholder="0.00"
          aria-describedby="costo-error"
          :aria-invalid="!!errors.costoUnitarioPromedio"
        />
        <small v-if="errors.costoUnitarioPromedio" id="costo-error" class="error-text">
          {{ errors.costoUnitarioPromedio }}
        </small>
      </div>

      <!-- Es Vendible -->
      <div class="form-field">
        <div class="checkbox-container">
          <Checkbox
            id="esVendible"
            v-model="productoLocal.esVendible"
            :binary="true"
            class="checkbox-input"
          />
          <label for="esVendible" class="checkbox-label">
            Es Vendible
          </label>
        </div>
        <small class="helper-text">
          Marque si el producto puede ser vendido
        </small>
      </div>

      <!-- Precio Venta Unitario -->
      <div v-if="productoLocal.esVendible" class="form-field">
        <label for="precioVenta" class="form-label">Precio de Venta Unitario</label>
        <InputNumber
          id="precioVenta"
          v-model="productoLocal.precioVentaUnitario"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          class="w-full"
          :min="0"
          :max="9999999"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          placeholder="0.00"
        />
      </div>

      <!-- Perecedero -->
      <div class="form-field">
        <div class="checkbox-container">
          <Checkbox
            id="perecedero"
            v-model="productoLocal.perecedero"
            :binary="true"
            class="checkbox-input"
          />
          <label for="perecedero" class="checkbox-label">
            Producto Perecedero
          </label>
        </div>
        <small class="helper-text">
          Marque si el producto tiene fecha de vencimiento
        </small>
      </div>
    </div>

    <template #footer>
      <div class="form-actions">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          class="btn-cancel"
          @click="dialogVisible = false"
          :disabled="loading"
        />
        <Button
          type="button"
          :label="props.modoEdicion ? 'Actualizar' : 'Guardar'"
          :icon="loading ? 'pi pi-spinner pi-spin' : 'pi pi-save'"
          class="btn-save"
          @click="handleSave"
          :disabled="loading || Object.keys(errors).length > 0"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0.5rem 0;
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
  margin-bottom: 2px;
}

.required-asterisk {
  color: #e74c3c;
  margin-left: 2px;
}

/* Form Input */
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
  border-color: #ff4081 !important; /* Cambiado a rosa */
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important; /* Cambiado a rosa */
  outline: none !important;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Checkbox */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-input {
  transform: scale(1.1);
}

.checkbox-label {
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  user-select: none;
}

.helper-text {
  color: #666666;
  font-size: 0.85rem;
  margin-top: 4px;
  margin-left: 28px;
}

/* Error Text */
.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 500;
  display: block;
  margin-top: 4px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid #e1e8ed;
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
  }

  .form-actions .p-button {
    width: 100%;
  }
}

/* Save Button - Cambiado a rosa */
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

/* PrimeVue Overrides */
:deep(.p-dialog-content) {
  padding: 1.5rem !important;
}

:deep(.p-dialog-header) {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
  border-bottom: 2px solid rgba(255, 64, 129, 0.15) !important; /* Cambiado a rosa */
  padding: 20px !important;
}

:deep(.p-dialog-header .p-dialog-title) {
  color: #333333 !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
}

:deep(.p-dropdown) {
  width: 100%;
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  border-radius: 6px !important;
}

:deep(.p-dropdown .p-dropdown-label) {
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
}

:deep(.p-dropdown:hover) {
  border-color: #c1c7cd !important;
}

:deep(.p-dropdown.p-focus) {
  border-color: #ff4081 !important; /* Cambiado a rosa */
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important; /* Cambiado a rosa */
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
  color: #333333 !important;
  padding: 0.75rem 1rem !important;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background: #ff4081 !important; /* Cambiado a rosa */
  color: white !important;
}

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
  border-color: #ff4081 !important; /* Cambiado a rosa */
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important; /* Cambiado a rosa */
}

:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #d1d9df !important;
  border-radius: 4px !important;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: #ff4081 !important; /* Cambiado a rosa */
  border-color: #ff4081 !important; /* Cambiado a rosa */
}

/* Focus states for accessibility */
:deep(.p-button:focus) {
  outline: 3px solid rgba(255, 64, 129, 0.25) !important; /* Cambiado a rosa */
  outline-offset: 2px !important;
}
</style>
