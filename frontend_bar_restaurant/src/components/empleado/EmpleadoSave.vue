<script setup lang="ts">
import type { Empleado } from '@/models/Empleado'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import { computed, ref, watch } from 'vue'
import http from '../../plugins/axios'

const ENDPOINT = 'empleados'
const props = defineProps({
  mostrar: Boolean,
  empleado: {
    type: Object as () => Empleado,
    default: () => ({}) as Empleado,
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

function defaultEmpleado(): Empleado {
  return {
    id: 0,
    cedulaIdentidad: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    direccion: '',
    celular: '',
    email: '',
    fechaIngreso: '',
    cargo: '',
    salario: 0,
    activo: true,
  }
}

const empleado = ref<Empleado>({ ...((props.empleado as Empleado) || defaultEmpleado()) })

const fechaNacimientoDate = ref<Date | null>(null)
const fechaIngresoDate = ref<Date | null>(null)

// Restricciones de fecha para nacimiento (máximo 60 años, no futuro)
const maxFechaNacimiento = computed(() => {
  const hoy = new Date()
  const hace60Anos = new Date(hoy.getFullYear() - 60, hoy.getMonth(), hoy.getDate())
  return hoy > hace60Anos ? hoy : hace60Anos
})

// Restricciones de fecha para ingreso (desde hoy en adelante)
const minFechaIngreso = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return hoy
})

// Opciones para el estado activo/inactivo
const opcionesActivo = [
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false },
]

// Opciones para el cargo (roles)
const opcionesCargo = [
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Cajero', value: 'Cajero' },
  { label: 'Chef', value: 'Chef' },
]

// Validación simple
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!empleado.value.cedulaIdentidad || empleado.value.cedulaIdentidad.trim() === '') {
    errors.value.cedulaIdentidad = 'La cédula es obligatoria'
  }
  if (!empleado.value.nombre || empleado.value.nombre.trim() === '') {
    errors.value.nombre = 'El nombre es obligatorio'
  }

  // Validación Fecha de Nacimiento
  if (!fechaNacimientoDate.value) {
    errors.value.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
  } else {
    const f = new Date(fechaNacimientoDate.value)
    f.setHours(0, 0, 0, 0)

    if (f > today) {
      errors.value.fechaNacimiento = 'La fecha de nacimiento no puede ser futura'
    } else {
      // Validar que no sea mayor a 60 años
      const edad = today.getFullYear() - f.getFullYear()
      const mes = today.getMonth() - f.getMonth()
      const dia = today.getDate() - f.getDate()

      let edadReal = edad
      if (mes < 0 || (mes === 0 && dia < 0)) {
        edadReal = edad - 1
      }

      if (edadReal > 60) {
        errors.value.fechaNacimiento = 'La edad no puede ser mayor a 60 años'
      }
    }
  }

  // Validación Fecha de Ingreso - debe ser desde hoy en adelante
  if (fechaIngresoDate.value) {
    const fi = new Date(fechaIngresoDate.value)
    fi.setHours(0, 0, 0, 0)

    if (fi < today) {
      errors.value.fechaIngreso = 'La fecha de ingreso no puede ser anterior a hoy'
    }
  }

  if (empleado.value.email && empleado.value.email.trim() !== '') {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(empleado.value.email)) {
      errors.value.email = 'Email inválido'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Mantener validación reactiva cuando el usuario cambia campos
watch(
  [empleado, fechaNacimientoDate],
  () => {
    validate()
  },
  { deep: true },
)

watch(
  () => props.empleado,
  (newVal) => {
    if (newVal) {
      empleado.value = { ...(newVal as Empleado) }
      // Convertir las fechas a Date si vienen como string
      if (newVal.fechaNacimiento) {
        fechaNacimientoDate.value =
          typeof newVal.fechaNacimiento === 'string'
            ? new Date(newVal.fechaNacimiento)
            : (newVal.fechaNacimiento as Date)
      } else {
        fechaNacimientoDate.value = null
      }
      if (newVal.fechaIngreso) {
        fechaIngresoDate.value =
          typeof newVal.fechaIngreso === 'string'
            ? new Date(newVal.fechaIngreso)
            : (newVal.fechaIngreso as Date)
      } else {
        fechaIngresoDate.value = null
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.mostrar,
  (newVal) => {
    if (newVal && !props.modoEdicion) {
      // Resetear el formulario cuando se abre en modo creación
      empleado.value = defaultEmpleado()
      fechaNacimientoDate.value = null
      fechaIngresoDate.value = null
    }
  },
)

async function handleSave() {
  try {
    // Validar antes de enviar
    if (!validate()) {
      // Los errores están en `errors`
      return
    }

    // Convertir las fechas al formato correcto para el backend
    let fechaNacimientoFormatted: string | null = null
    let fechaIngresoFormatted: string | null = null
    if (fechaNacimientoDate.value) {
      const date = new Date(fechaNacimientoDate.value)
      const formatted = date.toISOString().split('T')
      fechaNacimientoFormatted = formatted[0] || null
    }
    if (fechaIngresoDate.value) {
      const d2 = new Date(fechaIngresoDate.value)
      const formatted = d2.toISOString().split('T')
      fechaIngresoFormatted = formatted[0] || null
    }

    const body = {
      cedulaIdentidad: empleado.value.cedulaIdentidad,
      nombre: empleado.value.nombre,
      apellidoPaterno: empleado.value.apellidoPaterno,
      apellidoMaterno: empleado.value.apellidoMaterno,
      fechaNacimiento: fechaNacimientoFormatted,
      fechaIngreso: fechaIngresoFormatted,
      direccion: empleado.value.direccion,
      celular: empleado.value.celular,
      email: empleado.value.email,
      cargo: empleado.value.cargo,
      salario: empleado.value.salario,
      activo: empleado.value.activo,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${empleado.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    empleado.value = {} as Empleado
    fechaNacimientoDate.value = null
    dialogVisible.value = false
  } catch (err: unknown) {
    let msg = 'Error al guardar el empleado'
    if (err && typeof err === 'object' && 'response' in err) {
      // @ts-expect-error acceder a propiedad response de objeto de error
      msg = err.response?.data?.message || msg
    } else if (err instanceof Error) {
      msg = err.message
    }
    alert(msg)
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Empleado' : 'Agregar Empleado'"
    style="width: 100%; max-width: 650px"
    modal
    :pt="{ header: { class: 'dialog-header-custom' }, content: { class: 'dialog-content-custom' } }"
  >
    <div class="form-container">
      <!-- Row 1: Cédula y Nombre -->
      <div class="form-row">
        <div class="form-field">
          <label for="cedulaIdentidad" class="form-label">Cédula</label>
          <InputText
            id="cedulaIdentidad"
            v-model="empleado.cedulaIdentidad"
            class="w-full form-input"
            placeholder="Ingrese cédula"
            autocomplete="off"
          />
          <small v-if="errors.cedulaIdentidad" class="error-text">{{ errors.cedulaIdentidad }}</small>
        </div>
        <div class="form-field">
          <label for="nombre" class="form-label">Nombre</label>
          <InputText
            id="nombre"
            v-model="empleado.nombre"
            class="w-full form-input"
            placeholder="Ingrese nombre"
            autocomplete="off"
          />
          <small v-if="errors.nombre" class="error-text">{{ errors.nombre }}</small>
        </div>
      </div>

      <!-- Row 2: Apellidos -->
      <div class="form-row">
        <div class="form-field">
          <label for="apellidoPaterno" class="form-label">Apellido Paterno</label>
          <InputText
            id="apellidoPaterno"
            v-model="empleado.apellidoPaterno"
            class="w-full form-input"
            placeholder="Apellido paterno"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="apellidoMaterno" class="form-label">Apellido Materno</label>
          <InputText
            id="apellidoMaterno"
            v-model="empleado.apellidoMaterno"
            class="w-full form-input"
            placeholder="Apellido materno"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Row 3: Fechas -->
      <div class="form-row">
        <div class="form-field">
          <label for="fechaNacimiento" class="form-label">Fecha Nacimiento</label>
          <Calendar
            id="fechaNacimiento"
            v-model="fechaNacimientoDate"
            class="w-full"
            :show-icon="true"
            date-format="dd/mm/yy"
            :max-date="maxFechaNacimiento"
          />
          <small v-if="errors.fechaNacimiento" class="error-text">{{ errors.fechaNacimiento }}</small>
        </div>
        <div class="form-field">
          <label for="fechaIngreso" class="form-label">Fecha Ingreso</label>
          <Calendar
            id="fechaIngreso"
            v-model="fechaIngresoDate"
            class="w-full"
            :show-icon="true"
            date-format="dd/mm/yy"
            :min-date="minFechaIngreso"
          />
          <small v-if="errors.fechaIngreso" class="error-text">{{ errors.fechaIngreso }}</small>
        </div>
      </div>

      <!-- Row 4: Contacto -->
      <div class="form-row">
        <div class="form-field">
          <label for="celular" class="form-label">Celular</label>
          <InputText
            id="celular"
            v-model="empleado.celular"
            class="w-full form-input"
            placeholder="+591 XXXXXXX"
            autocomplete="off"
          />
        </div>
        <div class="form-field">
          <label for="email" class="form-label">Email</label>
          <InputText
            id="email"
            v-model="empleado.email"
            class="w-full form-input"
            placeholder="correo@ejemplo.com"
            type="email"
            autocomplete="off"
          />
          <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
        </div>
      </div>

      <!-- Row 5: Dirección -->
      <div class="form-field">
        <label for="direccion" class="form-label">Dirección</label>
        <Textarea
          id="direccion"
          v-model="empleado.direccion"
          rows="2"
          class="w-full form-1.  **Botones de Éxito (.p-button-success o .p-button-primary):**
    * Fondo (background-color) debe ser Azul Brillante: #007BFF.
    * Color del texto debe ser Blanco Puro: #FFFFFF.
    * Eliminar el color verde por defecto también en los estados :hover y :focus.
2.  **Asegurar Sobrescritura:** Utilizar selectores de alta especificidad (puedes añadir la clase de la página o usar !important como último recurso) para anular los estilos del tema por defecto de PrimeFaces/PrimeVue.
*/input"
          placeholder="Ingrese dirección completa"
        />
      </div>

      <!-- Row 6: Cargo y Salario -->
      <div class="form-row">
        <div class="form-field">
          <label for="cargo" class="form-label">Cargo</label>
          <Dropdown
            id="cargo"
            v-model="empleado.cargo"
            :options="opcionesCargo"
            option-label="label"
            option-value="value"
            placeholder="Seleccione cargo"
            class="w-full"
          />
        </div>
        <div class="form-field">
          <label for="salario" class="form-label">Salario</label>
          <InputNumber
            id="salario"
            v-model="empleado.salario"
            class="w-full"
            mode="decimal"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            placeholder="0.00"
          />
        </div>
      </div>

      <!-- Row 7: Estado -->
      <div class="form-field">
        <label for="activo" class="form-label">Estado</label>
        <Dropdown
          id="activo"
          v-model="empleado.activo"
          :options="opcionesActivo"
          option-label="label"
          option-value="value"
          class="w-full"
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
          :disabled="Object.keys(errors).length > 0"
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

/* PrimeVue Textarea Light Mode */
:deep(.p-inputtextarea) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  padding: 0.65rem 0.875rem !important;
  border-radius: 6px !important;
  font-size: 0.95rem !important;
  font-family: inherit !important;
}

:deep(.p-inputtextarea:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
  outline: none !important;
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

/* PrimeVue Calendar Light Mode */
:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-calendar .p-calendar-w-btn) {
  width: 100%;
  display: flex;
  flex-direction: row;
}

:deep(.p-calendar .p-calendar-w-btn .p-inputtext) {
  background-color: #ffffff !important;
  border: 1.5px solid #d1d9df !important;
  color: #333333 !important;
  border-radius: 6px 0 0 6px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  flex: 1;
}

:deep(.p-calendar .p-calendar-w-btn .p-inputtext:focus) {
  border-color: #ff4081 !important;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1) !important;
  outline: none !important;
}

:deep(.p-calendar .p-icon-button) {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: #ffffff !important;
  border: 2px solid #ff4081 !important;
  border-radius: 0 6px 6px 0 !important;
  width: auto !important;
  height: auto !important;
  min-width: 55px !important;
  padding: 0.8rem 1.2rem !important;
  font-size: 1.4rem !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
  position: relative !important;
}

:deep(.p-calendar .p-icon-button i) {
  font-size: 1.4rem !important;
  color: #ffffff !important;
  display: inline-block !important;
  position: relative !important;
  z-index: 2 !important;
}

/* Asegurar que no haya fondo negro */
:deep(.p-calendar .p-icon-button span) {
  color: #ffffff !important;
  font-size: 1.4rem !important;
}

:deep(.p-calendar .p-icon-button svg) {
  fill: #ffffff !important;
  stroke: #ffffff !important;
}

:deep(.p-calendar .p-icon-button:hover) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
  box-shadow: 0 4px 12px rgba(255, 64, 129, 0.3) !important;
  transform: translateY(-2px) !important;
}

:deep(.p-calendar .p-icon-button:active) {
  transform: translateY(0) !important;
}

/* Override para iconos de calendario - Forzar color blanco */
:deep(.p-calendar .p-icon-button::before) {
  color: #ffffff !important;
}

:deep(.p-calendar .p-icon-button::after) {
  color: #ffffff !important;
}

/* Calendar Panel - Completamente Blanco */
:deep(.p-datepicker) {
  background-color: #ffffff !important;
  border: 2px solid #d1d9df !important;
  border-radius: 8px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
  padding: 16px !important;
}

:deep(.p-datepicker-header) {
  background-color: #ffffff !important;
  border-bottom: 2px solid #e1e8ed !important;
  padding: 12px 0 !important;
  margin-bottom: 12px !important;
}

:deep(.p-datepicker-header .p-datepicker-title) {
  color: #333333 !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
}

:deep(.p-datepicker-header button) {
  color: #ff4081 !important;
  background: transparent !important;
  border: none !important;
  font-size: 1.1rem !important;
  cursor: pointer !important;
}

:deep(.p-datepicker-header button:hover) {
  background: rgba(255, 64, 129, 0.1) !important;
  border-radius: 4px !important;
}

:deep(.p-datepicker-calendar) {
  padding: 0 !important;
}

:deep(.p-datepicker-calendar table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.p-datepicker-weekheader) {
  padding: 8px 0 !important;
}

:deep(.p-datepicker-weekheader > div) {
  color: #666666 !important;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  padding: 4px 0 !important;
  text-align: center !important;
}

:deep(.p-datepicker-calendar td) {
  padding: 2px !important;
  text-align: center !important;
}

:deep(.p-datepicker-calendar td > span) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  background-color: #f8f9fa !important;
  color: #333333 !important;
  border-radius: 4px !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

:deep(.p-datepicker-calendar td > span:hover) {
  background-color: #e8eaed !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
}

:deep(.p-datepicker-calendar .p-highlighted) {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%) !important;
  color: white !important;
  font-weight: 700 !important;
}

:deep(.p-datepicker-calendar .p-highlighted:hover) {
  background: linear-gradient(135deg, #f50057 0%, #e60065 100%) !important;
}

:deep(.p-datepicker-calendar .p-datepicker-other-month > span) {
  color: #b0b6bc !important;
  background-color: transparent !important;
}

/* Deshabilitar fechas fuera del rango */
:deep(.p-datepicker-calendar .p-disabled) {
  color: #d1d9df !important;
  background-color: #f5f5f5 !important;
  cursor: not-allowed !important;
}

:deep(.p-datepicker-calendar .p-disabled:hover) {
  background-color: #f5f5f5 !important;
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

