<script setup lang="ts">
import type { Usuario } from '@/models/Usuario'
import type { Empleado } from '@/models/Empleado'
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const ENDPOINT = 'usuarios'
const users = ref<Usuario[]>([])

const searchQuery = ref('')
const selectedRole = ref('all')
const showAddModal = ref(false)

const defaultUsuario = (): Partial<Usuario> => ({
  id: 0,
  idEmpleado: 0,
  empleado: {
    id: 0,
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
  },
  usuario: '',
  clave: '',
  rol: '',
  activo: true,
})

const newUserForm = ref<Partial<Usuario> & { confirmPassword?: string }>(defaultUsuario())

const formError = ref('')
const loading = ref(false)
const modoEdicion = ref(false)

const filteredUsers = computed(() => {
  return users.value.filter((usuario) => {
    const matchesSearch = usuario.usuario.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = selectedRole.value === 'all' || usuario.rol === selectedRole.value
    return matchesSearch && matchesRole
  })
})

const rolesOptions = [
  { label: 'ADMINISTRADOR', value: 'ADMINISTRADOR' },
  { label: 'CAJERO', value: 'CAJERO' },
  { label: 'CHEF', value: 'CHEF' },
  { label: 'MESERO', value: 'MESERO' },
  { label: 'CONTADOR', value: 'CONTADOR' },
]

const passwordMatch = computed(() => {
  const confirmPassword =
    (newUserForm.value as Partial<Usuario> & { confirmPassword?: string })?.confirmPassword || ''
  if (!confirmPassword) return true
  return newUserForm.value.clave === confirmPassword
})

const obtenerLista = async () => {
  try {
    const response = await http.get(ENDPOINT)
    users.value = response.data.data || response.data
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
  }
}

const filterUsers = (): void => {
  // Este método ahora solo es para compatibilidad; el filtrado es reactivo via computed
}

const getRoleColor = (rol: string) => {
  const colors: Record<string, string> = {
    ADMINISTRADOR: 'danger',
    CHEF: 'primary',
    MESERO: 'info',
    CAJERO: 'warning',
    CONTADOR: 'secondary',
  }
  return colors[rol] || 'secondary'
}

const getEmpleadoNombreCompleto = (empleado: Usuario['empleado'] | undefined): string => {
  if (!empleado) return '-'
  return `${empleado.nombre || ''} ${empleado.apellidoPaterno || ''} ${empleado.apellidoMaterno || ''}`.trim()
}

const empleados = ref<Empleado[]>([])
const empleadosFiltrados = ref<Empleado[]>([])

const obtenerEmpleados = async () => {
  try {
    const response = await http.get('empleados')
    empleados.value = response.data.data || response.data
    empleadosFiltrados.value = empleados.value
  } catch (err) {
    console.error('Error al cargar empleados:', err)
  }
}

const filterEmpleados = (event: { query: string }) => {
  const filtered = empleados.value.filter((emp: Empleado) =>
    getEmpleadoNombreCompleto(emp).toLowerCase().includes(event.query.toLowerCase()),
  )
  empleadosFiltrados.value = filtered
}

const empleadosOptions = computed(() => {
  return empleadosFiltrados.value.map((emp: Empleado) => ({
    label: getEmpleadoNombreCompleto(emp),
    value: emp.id,
    empleado: emp,
  }))
})

const getEmpleadoById = (id: number): Empleado | undefined => {
  return empleados.value.find((emp) => emp.id === id)
}

const closeAddModal = () => {
  showAddModal.value = false
  resetForm()
}

const resetForm = () => {
  newUserForm.value = defaultUsuario() as Partial<Usuario> & { confirmPassword?: string }
  formError.value = ''
  modoEdicion.value = false
}

const handleAddUser = async () => {
  formError.value = ''

  // Validaciones
  if (!newUserForm.value.usuario || newUserForm.value.usuario.trim() === '') {
    formError.value = 'El usuario es obligatorio'
    return
  }

  if (!newUserForm.value.clave || newUserForm.value.clave.length < 6) {
    formError.value = 'La clave debe tener al menos 6 caracteres'
    return
  }

  if (!passwordMatch.value) {
    formError.value = 'Las contraseñas no coinciden'
    return
  }

  if (!newUserForm.value.rol) {
    formError.value = 'El rol es obligatorio'
    return
  }

  loading.value = true

  try {
    const body = {
      idEmpleado: newUserForm.value.idEmpleado || 0,
      usuario: newUserForm.value.usuario,
      clave: newUserForm.value.clave,
      rol: (newUserForm.value.rol as string).toUpperCase(),
      activo: newUserForm.value.activo,
    }

    if (modoEdicion.value && newUserForm.value.id) {
      await http.patch(`${ENDPOINT}/${newUserForm.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }

    await obtenerLista()
    closeAddModal()
    alert(modoEdicion.value ? 'Usuario actualizado' : 'Usuario registrado exitosamente')
  } catch (err: unknown) {
    let msg = 'Error al guardar el usuario'
    if (err && typeof err === 'object' && 'response' in err) {
      // @ts-expect-error accessing response on error object
      msg = err.response?.data?.message || msg
    } else if (err instanceof Error) {
      msg = err.message
    }
    formError.value = msg
  } finally {
    loading.value = false
  }
}

const editUser = (user: Usuario) => {
  const empleado = getEmpleadoById(user.idEmpleado)
  newUserForm.value = {
    ...user,
    empleado: empleado || user.empleado,
  } as Partial<Usuario> & { confirmPassword?: string }
  modoEdicion.value = true
  showAddModal.value = true
}

const deleteUser = async (id: number) => {
  if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
    try {
      await http.delete(`${ENDPOINT}/${id}`)
      await obtenerLista()
      alert('Usuario eliminado')
    } catch (err) {
      console.error('Error al eliminar:', err)
      alert('Error al eliminar el usuario')
    }
  }
}

onMounted(async () => {
  await obtenerEmpleados()
  await obtenerLista()
})
</script>

<template>
  <div class="users-view p-4"> <div class="page-header mb-4">
      <h2 class="text-2xl font-bold">Gestión de Usuarios</h2>
      <p class="text-muted text-sm">Administra los usuarios y sus roles dentro del sistema.</p>
    </div>

    <div class="card p-datatable-card mb-4">
      <div class="flex flex-wrap gap-3 align-items-center p-3">
        <span class="p-input-icon-left flex-grow-1">
          <i class="pi pi-search"></i>
          <InputText v-model="searchQuery" placeholder="Buscar por usuario..." class="w-full search-input" />
        </span>

        <Dropdown
          v-model="selectedRole"
          :options="[{ label: 'Todos los Roles', value: 'all' }, ...rolesOptions]"
          optionLabel="label"
          optionValue="value"
          class="w-12rem"
        />

        <Button
          label="Agregar Usuario"
          icon="pi pi-user-plus"
          severity="success"
          @click="
            () => {
              resetForm()
              showAddModal = true
            }
          "
        />
      </div>
    </div>

    <div class="card p-datatable-card">
      <DataTable :value="filteredUsers" responsiveLayout="scroll" stripedRows>
        <Column field="usuario" header="Usuario" style="width: 15%" />
        <Column field="rol" header="Rol" style="width: 15%">
          <template #body="slotProps">
            <span :class="['p-tag', 'p-tag-' + getRoleColor(slotProps.data.rol)]">
              {{ slotProps.data.rol }}
            </span>
          </template>
        </Column>
        <Column header="Empleado" style="width: 35%">
          <template #body="slotProps">
            <i class="pi pi-user mr-2 text-muted" />
            {{ getEmpleadoNombreCompleto(slotProps.data.empleado) }}
          </template>
        </Column>
        <Column field="activo" header="Estado" style="width: 10%">
          <template #body="slotProps">
            <span v-if="slotProps.data.activo" class="p-tag p-tag-success-alt">Activo</span>
            <span v-else class="p-tag p-tag-danger-alt">Inactivo</span>
          </template>
        </Column>
        <Column header="Acciones" style="width: 15%; text-align: center;">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-sm me-2"
              severity="warning"
              text
              @click="editUser(slotProps.data)"
              v-tooltip.top="'Editar'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-sm"
              severity="danger"
              text
              @click="deleteUser(slotProps.data.id)"
              v-tooltip.top="'Eliminar'"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="filteredUsers.length === 0 && !loading" class="empty-state">
      <i class="pi pi-users empty-icon"></i>
      <h5 class="empty-text-title">No hay usuarios registrados</h5>
      <p class="empty-text-subtitle">Comienza agregando un nuevo usuario o ajusta tus filtros.</p>
    </div>

    <Dialog
      v-model:visible="showAddModal"
      :header="modoEdicion ? 'Editar Usuario' : 'Agregar Nuevo Usuario'"
      :modal="true"
      style="width: 40rem"
      class="p-dialog-form"
    >
      <div v-if="formError" class="p-message p-component p-message-error mb-4">
        <div class="p-message-wrapper">
          <i class="pi pi-exclamation-triangle p-message-icon mr-2"></i>
          <span class="p-message-text">{{ formError }}</span>
        </div>
      </div>

      <div class="p-fluid">
        <div class="mb-4">
          <label class="font-semibold block mb-2">Usuario</label>
          <InputText v-model="newUserForm.usuario" class="w-full" placeholder="Nombre de usuario" />
        </div>

        <div class="mb-4">
          <label class="font-semibold block mb-2">Clave</label>
          <InputText
            v-model="newUserForm.clave"
            type="password"
            class="w-full"
            placeholder="Contraseña (mín. 6 caracteres)"
          />
        </div>

        <div class="mb-4">
          <label class="font-semibold block mb-2">Confirmar Clave</label>
          <InputText
            v-model="(newUserForm as any).confirmPassword"
            type="password"
            class="w-full"
            :class="{ 'p-invalid': !passwordMatch && (newUserForm as any).confirmPassword }"
            placeholder="Confirmar contraseña"
          />
          <small v-if="!passwordMatch && (newUserForm as any).confirmPassword" class="error-text">Las contraseñas no coinciden</small>
        </div>

        <div class="mb-4">
          <label class="font-semibold block mb-2">Rol</label>
          <Dropdown
            v-model="newUserForm.rol"
            :options="rolesOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            placeholder="Selecciona un rol"
          />
        </div>

        <div class="mb-4">
          <label class="font-semibold block mb-2">Empleado</label>
          <Dropdown
            v-model="newUserForm.idEmpleado"
            :options="empleadosOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            placeholder="Selecciona un empleado"
            :filter="true"
            @filter="filterEmpleados"
            filterPlaceholder="Buscar empleado..."
          />
          <small v-if="newUserForm.idEmpleado" class="text-muted mt-2 block">
            Empleado asociado: {{ getEmpleadoNombreCompleto(newUserForm.empleado) }}
          </small>
        </div>

        <div class="mb-4">
          <label class="font-semibold block mb-2">Estado</label>
          <Dropdown
            v-model="newUserForm.activo"
            :options="[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false },
            ]"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeAddModal" severity="secondary" outlined />
        <Button
          :label="modoEdicion ? 'Actualizar' : 'Crear'"
          icon="pi pi-save"
          @click="handleAddUser"
          :loading="loading"
          :disabled="loading || !passwordMatch || !newUserForm.usuario"
          severity="primary"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* ======================================================= */
/* I. ESTILOS DE UTILIDAD Y LAYOUT */
/* ======================================================= */
/* Reset de clases internas y utilidades PrimeVue */
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.flex-grow-1 { flex-grow: 1; }
.align-items-center { align-items: center; }
.gap-3 { gap: 1rem; }
.p-4 { padding: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }
.block { display: block; }
.font-semibold { font-weight: 600; }
.text-2xl { font-size: 1.5rem; }
.text-sm { font-size: 0.875rem; }
.w-full { width: 100%; }
.w-12rem { width: 12rem; }

/* Estilos de Contenedores y Tarjetas */
.card {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.p-datatable-card {
  padding: 0; /* La tabla ya tiene padding interno */
}
.users-view {
    background-color: #f8f9fa; /* Fondo general suave */
}

/* Títulos y texto secundario */
.page-header h2 {
    color: #343a40;
    font-weight: 700;
}
.text-muted {
    color: #6c757d;
}

/* ======================================================= */
/* II. ESTILOS DE COMPONENTES DE PRIME VUE */
/* ======================================================= */

/* Input de Búsqueda */
.search-input {
    height: 42px;
}
/* Asegurar el padding izquierdo en el input */
:deep(.p-input-icon-left > .p-inputtext) {
  padding-left: 2.5rem !important;
}

/* Dropdown */
.p-dropdown {
    height: 42px;
}

/* DataTable Estilos */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f9fa; /* Fondo claro del encabezado */
  color: #495057; /* Texto oscuro */
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  padding: 1rem;
}

/* Botones de Acción en Fila (Usamos text y rounded) */
:deep(.p-button.p-button-sm) {
    width: 2rem;
    height: 2rem;
}

/* Tags de Rol y Estado */
.p-tag {
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

/* Tags de Rol (Colores basados en getRoleColor) */
.p-tag-danger { /* ADMINISTRADOR */ background-color: #f8d7da; color: #721c24; }
.p-tag-primary { /* CHEF */ background-color: #cce5ff; color: #004085; }
.p-tag-info { /* MESERO */ background-color: #d1ecf1; color: #0c5460; }
.p-tag-warning { /* CAJERO */ background-color: #fff3cd; color: #856404; }
.p-tag-secondary { /* CONTADOR / Default */ background-color: #e2e3e5; color: #383d41; }

/* Tags de Estado (Activo/Inactivo) */
.p-tag-success-alt { /* Activo */
    background-color: #d4edda;
    color: #155724;
}
.p-tag-danger-alt { /* Inactivo */
    background-color: #f8d7da;
    color: #721c24;
}

/* ======================================================= */
/* III. ESTADOS DE FORMULARIO Y MODAL */
/* ======================================================= */

/* Alertas PrimeVue (para formError) */
.p-message {
    padding: 1rem;
    border-radius: 6px;
    background-color: #fff0f0; /* Fondo de error suave */
    border: 1px solid #f5c2c7;
    color: #842029;
}

/* Campo Inválido (Password Match) */
.p-invalid {
    border-color: #dc2626 !important;
}
.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}

/* Empty State Styling */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    border: 1px dashed #ced4da;
    border-radius: 6px;
    margin-top: 1rem;
    background-color: #ffffff;
}
.empty-icon {
    font-size: 3rem;
    color: #adb5bd;
    margin-bottom: 1rem;
}
.empty-text-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #495057;
}
.empty-text-subtitle {
    color: #6c757d;
}
</style>
