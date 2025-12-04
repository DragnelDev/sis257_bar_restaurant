<script setup lang="ts">
import type { Categoria } from '@/models/Categoria'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, Dropdown } from 'primevue'
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

const ENDPOINT = 'categorias'
const toast = useToast()

const props = defineProps({
  mostrar: Boolean,
  categoria: { type: Object as () => Categoria, default: () => ({}) as Categoria },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (v) => {
    if (!v) emit('close')
  },
})

const formulario = ref<Categoria>({
  id: 0,
  nombre: '',
  descripcion: '',
  tipoCategoria: '',
})

watch(
  () => props.categoria,
  (n) => {
    if (n) formulario.value = { ...n }
  },
)

const opcionesTipo = [
  { label: 'Inventario', value: 'INVENTARIO' },
  { label: 'Menú', value: 'MENÚ' },
]

function limpiarFormulario() {
  formulario.value = { id: 0, nombre: '', descripcion: '', tipoCategoria: '' }
}

async function handleSave() {
  if (!formulario.value.nombre.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Nombre requerido',
      detail: 'Ingrese un nombre para la categoría',
      life: 3000,
    })
    return
  }
  if (!formulario.value.tipoCategoria) {
    toast.add({
      severity: 'warn',
      summary: 'Tipo requerido',
      detail: 'Seleccione un tipo de categoría',
      life: 3000,
    })
    return
  }

  const body = {
    nombre: formulario.value.nombre,
    descripcion: formulario.value.descripcion,
    tipoCategoria: formulario.value.tipoCategoria,
  }

  try {
    if (props.modoEdicion && formulario.value.id) {
      await http.patch(`${ENDPOINT}/${formulario.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Categoría actualizada',
        detail: `La categoría "${formulario.value.nombre}" se actualizó correctamente`,
        life: 4000,
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Categoría creada',
        detail: `La categoría "${formulario.value.nombre}" se creó correctamente`,
        life: 4000,
      })
    }

    emit('guardar')
    limpiarFormulario()
    dialogVisible.value = false
  } catch (error) {
    let msg = 'Error al guardar categoría'
    if (error && typeof error === 'object') {
      if ('response' in error && typeof (error as { response?: any }).response === 'object') {
        msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || msg
      } else if ('message' in error && typeof (error as { message?: string }).message === 'string') {
        msg = (error as { message?: string }).message || msg
      }
    }
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Categoría' : 'Crear Categoría'"
    style="width: 100%; max-width: 650px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
  >
    <div class="form-container">
      <!-- Row 1: Nombre y Tipo -->
      <div class="form-row">
        <div class="form-field">
          <label for="nombre" class="form-label">Nombre</label>
          <InputText
            id="nombre"
            v-model="formulario.nombre"
            class="w-full form-input"
            placeholder="Ingrese el nombre"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="tipo" class="form-label">Tipo</label>
          <Dropdown
            id="tipo"
            v-model="formulario.tipoCategoria"
            :options="opcionesTipo"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un tipo"
            class="w-full"
          />
        </div>
      </div>

      <!-- Row 2: Descripción completa -->
      <div class="form-field">
        <label for="descripcion" class="form-label">Descripción</label>
        <InputText
          id="descripcion"
          v-model="formulario.descripcion"
          class="w-full form-input"
          placeholder="Ingrese la descripción"
          autocomplete="off"
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
        <Button type="button" label="Guardar" class="btn-save" @click="handleSave" />
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
