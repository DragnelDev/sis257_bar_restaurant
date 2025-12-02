<script setup lang="ts">
import type { Proveedor } from '@/models/Proveedor'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'proveedores'
const props = defineProps({
  mostrar: Boolean,
  proveedor: {
    type: Object as () => Proveedor | null,
    default: () => null,
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

const proveedorLocal = ref<Proveedor>({
  id: 0,
  nombreEmpresa: '',
  nit: '',
  responsable: '',
  direccion: '',
  celular: '',
  email: '',
  condicionPago: '',
})

watch(
  () => props.proveedor,
  (newVal) => {
    if (newVal) proveedorLocal.value = { ...newVal }
    else
      proveedorLocal.value = {
        id: 0,
        nombreEmpresa: '',
        nit: '',
        responsable: '',
        direccion: '',
        celular: '',
        email: '',
        condicionPago: '',
      }
  },
  { immediate: true },
)

async function handleSave() {
  try {
    const body = {
      nombreEmpresa: proveedorLocal.value.nombreEmpresa,
      nit: proveedorLocal.value.nit,
      responsable: proveedorLocal.value.responsable,
      direccion: proveedorLocal.value.direccion,
      celular: proveedorLocal.value.celular,
      email: proveedorLocal.value.email,
      condicionPago: proveedorLocal.value.condicionPago,
    }

    if (props.modoEdicion && proveedorLocal.value.id) {
      await http.patch(`${ENDPOINT}/${proveedorLocal.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    emit('guardar')
    proveedorLocal.value = {
      id: 0,
      nombreEmpresa: '',
      nit: '',
      responsable: '',
      direccion: '',
      celular: '',
      email: '',
      condicionPago: '',
    }
    dialogVisible.value = false
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar el proveedor'
    console.error('Error al guardar proveedor:', error)
    alert(errorMessage)
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Proveedor' : 'Crear Proveedor'"
    style="width: 100%; max-width: 650px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
  >
    <div class="form-container">
      <!-- Row 1: Nombre Empresa y NIT -->
      <div class="form-row">
        <div class="form-field">
          <label for="nombreEmpresa" class="form-label">Nombre Empresa</label>
          <InputText
            id="nombreEmpresa"
            v-model="proveedorLocal.nombreEmpresa"
            class="w-full form-input"
            placeholder="Ingrese nombre"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="nit" class="form-label">NIT</label>
          <InputText
            id="nit"
            v-model="proveedorLocal.nit"
            class="w-full form-input"
            placeholder="Ingrese NIT"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Row 2: Responsable y Dirección -->
      <div class="form-row">
        <div class="form-field">
          <label for="responsable" class="form-label">Responsable</label>
          <InputText
            id="responsable"
            v-model="proveedorLocal.responsable"
            class="w-full form-input"
            placeholder="Ingrese nombre"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="direccion" class="form-label">Dirección</label>
          <InputText
            id="direccion"
            v-model="proveedorLocal.direccion"
            class="w-full form-input"
            placeholder="Ingrese dirección"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Row 3: Celular y Email -->
      <div class="form-row">
        <div class="form-field">
          <label for="celular" class="form-label">Celular</label>
          <InputText
            id="celular"
            v-model="proveedorLocal.celular"
            class="w-full form-input"
            placeholder="+591 XXXXXXX"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="email" class="form-label">Email</label>
          <InputText
            id="email"
            v-model="proveedorLocal.email"
            class="w-full form-input"
            placeholder="correo@ejemplo.com"
            type="email"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Row 4: Condición de Pago completa -->
      <div class="form-field">
        <label for="condicionPago" class="form-label">Condición de Pago</label>
        <InputText
          id="condicionPago"
          v-model="proveedorLocal.condicionPago"
          class="w-full form-input"
          placeholder="Ingrese condición de pago"
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
