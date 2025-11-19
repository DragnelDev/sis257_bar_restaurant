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
  <div class="users-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">Gestión de Usuarios</h2>
      <p class="text-muted">Administra los usuarios del sistema</p>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex gap-3 p-4">
        <span class="p-input-icon-left flex-1">
          <i class="pi pi-search"></i>
          <InputText v-model="searchQuery" placeholder="Buscar por usuario..." class="w-full" />
        </span>

        <Dropdown
          v-model="selectedRole"
          :options="[{ label: 'Todos los Roles', value: 'all' }, ...rolesOptions]"
          optionLabel="label"
          optionValue="value"
          class="w-32"
        />

        <Button
          label="Agregar Usuario"
          icon="pi pi-plus"
          @click="
            () => {
              resetForm()
              showAddModal = true
            }
          "
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <DataTable :value="filteredUsers" responsiveLayout="scroll" stripedRows>
        <Column field="usuario" header="Usuario" />
        <Column field="rol" header="Rol">
          <template #body="slotProps">
            <span class="pi pi-check" :style="{ color: getRoleColor(slotProps.data.rol) }" />
            {{ slotProps.data.rol }}
          </template>
        </Column>
        <Column header="Empleado">
          <template #body="slotProps">
            {{ getEmpleadoNombreCompleto(slotProps.data.empleado) }}
          </template>
        </Column>
        <Column field="activo" header="Estado">
          <template #body="slotProps">
            <span v-if="slotProps.data.activo" class="badge bg-success">Activo</span>
            <span v-else class="badge bg-danger">Inactivo</span>
          </template>
        </Column>
        <Column header="Acciones" style="width: 10%">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning me-2"
              @click="editUser(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="deleteUser(slotProps.data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Empty State -->
    <div v-if="filteredUsers.length === 0" class="text-center py-5">
      <i class="pi pi-users pi-4x text-muted mb-3"></i>
      <h5 class="text-muted">No hay usuarios</h5>
      <p class="text-muted">Intenta ajustar tu búsqueda o filtros</p>
    </div>

    <!-- Modal para Agregar/Editar Usuario -->
    <Dialog
      v-model:visible="showAddModal"
      :header="modoEdicion ? 'Editar Usuario' : 'Agregar Nuevo Usuario'"
      :modal="true"
      style="width: 40rem"
    >
      <!-- Alert de error -->
      <div v-if="formError" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="pi pi-exclamation-triangle me-2"></i>
        {{ formError }}
        <button type="button" class="btn-close" @click="formError = ''"></button>
      </div>

      <!-- Campos del formulario -->
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
          :class="{ 'ng-invalid': !passwordMatch }"
          placeholder="Confirmar contraseña"
        />
        <small v-if="!passwordMatch" class="error-text">Las contraseñas no coinciden</small>
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
        <small v-if="newUserForm.idEmpleado" class="text-muted d-block mt-2">
          Empleado: {{ getEmpleadoNombreCompleto(newUserForm.empleado) }}
        </small>
      </div>

      <div class="mb-4">
        <label class="font-semibold block mb-2">Activo</label>
        <Dropdown
          v-model="newUserForm.activo"
          :options="[
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ]"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeAddModal" severity="secondary" />
        <Button
          :label="modoEdicion ? 'Actualizar' : 'Crear'"
          icon="pi pi-save"
          @click="handleAddUser"
          :loading="loading"
          :disabled="loading || !passwordMatch || !newUserForm.usuario"
        />
      </template>
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

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

:deep(.p-input-icon-left > i) {
  left: 1rem;
}

:deep(.p-input-icon-left > .p-inputtext) {
  padding-left: 2.5rem;
}

.flex {
  display: flex;
}

.gap-3 {
  gap: 1rem;
}

.w-full {
  width: 100%;
}

.w-32 {
  width: 8rem;
}

.p-4 {
  padding: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.font-semibold {
  font-weight: 600;
}

.block {
  display: block;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}
</style>
