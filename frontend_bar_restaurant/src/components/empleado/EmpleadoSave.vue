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

  if (!empleado.value.cedulaIdentidad || empleado.value.cedulaIdentidad.trim() === '') {
    errors.value.cedulaIdentidad = 'La cédula es obligatoria'
  }
  if (!empleado.value.nombre || empleado.value.nombre.trim() === '') {
    errors.value.nombre = 'El nombre es obligatorio'
  }
  if (!fechaNacimientoDate.value) {
    errors.value.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
  } else {
    const f = new Date(fechaNacimientoDate.value)
    if (f > today) {
      errors.value.fechaNacimiento = 'La fecha de nacimiento no puede ser futura'
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
      fechaNacimientoFormatted = date.toISOString().split('T')[0]
    }
    if (fechaIngresoDate.value) {
      const d2 = new Date(fechaIngresoDate.value)
      fechaIngresoFormatted = d2.toISOString().split('T')[0]
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
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Empleado' : 'Crear Empleado'"
      style="width: 40rem"
    >
      <div class="mb-4">
        <label for="cedulaIdentidad" class="font-semibold block mb-1">Cedula Identidad</label>
        <InputText
          id="cedulaIdentidad"
          v-model="empleado.cedulaIdentidad"
          class="w-full"
          autocomplete="off"
        />
        <small v-if="errors.cedulaIdentidad" class="error-text">{{ errors.cedulaIdentidad }}</small>
      </div>

      <div class="mb-4">
        <label for="nombre" class="font-semibold block mb-1">Nombre</label>
        <InputText id="nombre" v-model="empleado.nombre" class="w-full" autocomplete="off" />
        <small v-if="errors.nombre" class="error-text">{{ errors.nombre }}</small>
      </div>

      <div class="mb-4">
        <label for="apellidoPaterno" class="font-semibold block mb-1">Apellido Paterno</label>
        <InputText
          id="apellidoPaterno"
          v-model="empleado.apellidoPaterno"
          class="w-full"
          autocomplete="off"
        />
      </div>

      <div class="mb-4">
        <label for="apellidoMaterno" class="font-semibold block mb-1">Apellido Materno</label>
        <InputText
          id="apellidoMaterno"
          v-model="empleado.apellidoMaterno"
          class="w-full"
          autocomplete="off"
        />
      </div>

      <div class="mb-4">
        <label for="direccion" class="font-semibold block mb-1">Dirección</label>
        <Textarea
          id="direccion"
          v-model="empleado.direccion"
          rows="3"
          class="w-full"
          autocomplete="off"
        />
      </div>

      <div class="mb-4">
        <label for="fechaNacimiento" class="font-semibold block mb-1">Fecha de Nacimiento</label>
        <Calendar
          id="fechaNacimiento"
          v-model="fechaNacimientoDate"
          class="w-full"
          :showIcon="true"
          dateFormat="dd-mm-yy"
        />
        <small v-if="errors.fechaNacimiento" class="error-text">{{ errors.fechaNacimiento }}</small>
      </div>

      <div class="mb-4">
        <label for="celular" class="font-semibold block mb-1">Celular</label>
        <InputText id="celular" v-model="empleado.celular" class="w-full" autocomplete="off" />
      </div>

      <div class="mb-4">
        <label for="email" class="font-semibold block mb-1">Email</label>
        <InputText id="email" v-model="empleado.email" class="w-full" autocomplete="off" />
        <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
      </div>

      <div class="mb-4">
        <label for="fechaIngreso" class="font-semibold block mb-1">Fecha de Ingreso</label>
        <Calendar
          id="fechaIngreso"
          v-model="fechaIngresoDate"
          class="w-full"
          :showIcon="true"
          dateFormat="dd-mm-yy"
        />
        <small v-if="errors.fechaIngreso" class="error-text">{{ errors.fechaIngreso }}</small>
      </div>

      <div class="mb-4">
        <label for="cargo" class="font-semibold block mb-1">Cargo</label>
        <Dropdown
          id="cargo"
          v-model="empleado.cargo"
          :options="opcionesCargo"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div>
        <label for="salario" class="font-semibold block mb-1">Salario</label>
        <InputNumber id="salario" v-model="empleado.salario" class="w-full" mode="decimal" />
      </div>

      <!-- Avatar field removed as per UX requirement -->

      <div class="mb-4">
        <label for="activo" class="font-semibold block mb-1">Activo</label>
        <Dropdown
          id="activo"
          v-model="empleado.activo"
          :options="opcionesActivo"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          @click="dialogVisible = false"
        ></Button>
        <Button
          type="button"
          label="Guardar"
          icon="pi pi-save"
          @click="handleSave"
          :disabled="Object.keys(errors).length > 0"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}
</style>
