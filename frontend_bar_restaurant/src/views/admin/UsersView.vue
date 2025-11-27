<script setup lang="ts">
import type { Usuario } from '@/models/Usuario'
import type { Empleado } from '@/models/Empleado'
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Dropdown from 'primevue/dropdown'

const ENDPOINT = 'usuarios'
const users = ref<Usuario[]>([])

const searchQuery = ref('')
const selectedRole = ref('all')
const showAddModal = ref(false)
const mostrarDetalleDialog = ref(false)
const usuarioDetalle = ref<Usuario | null>(null)

// Variables de paginación
const paginaActual = ref<number>(1)
const itemsPorPagina = ref<number>(10)

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

// Datos paginados
const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return filteredUsers.value.slice(inicio, fin)
})

// Total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPorPagina.value)
})

// Rango de páginas para mostrar
const rangosPaginas = computed(() => {
  const paginas = []
  const maxPaginas = 5
  let inicio = Math.max(1, paginaActual.value - Math.floor(maxPaginas / 2))
  let fin = Math.min(totalPaginas.value, inicio + maxPaginas - 1)

  if (fin - inicio < maxPaginas - 1) {
    inicio = Math.max(1, fin - maxPaginas + 1)
  }

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  return paginas
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

const getRoleBadgeClass = (rol: string) => {
  const classes: Record<string, string> = {
    ADMINISTRADOR: 'bg-danger',
    CHEF: 'bg-primary',
    MESERO: 'bg-info',
    CAJERO: 'bg-warning',
    CONTADOR: 'bg-secondary',
  }
  return classes[rol] || 'bg-secondary'
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
      msg = (err as any).response?.data?.message || msg
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

const mostrarDetalle = (user: Usuario) => {
  usuarioDetalle.value = user
  mostrarDetalleDialog.value = true
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

function cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

function onBusqueda() {
  paginaActual.value = 1
}

onMounted(async () => {
  await obtenerEmpleados()
  await obtenerLista()
})
</script>

<template>
  <div class="users-view">
    <div class="page-header mb-4">
      <h2 class="mb-1"><i class="pi pi-users me-2"></i>Gestión de Usuarios</h2>
      <p class="text-muted">Administra los usuarios y sus roles dentro del sistema</p>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="row mb-3 align-items-end">
      <div class="col-md-5">
        <InputGroup>
          <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
          <InputText
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por usuario..."
            @input="onBusqueda"
          />
        </InputGroup>
      </div>

      <div class="col-md-3">
        <Dropdown
          v-model="selectedRole"
          :options="[{ label: 'Todos los Roles', value: 'all' }, ...rolesOptions]"
          optionLabel="label"
          optionValue="value"
          class="w-100"
          placeholder="Filtrar por rol"
          @change="onBusqueda"
        />
      </div>

      <div class="col-md-4 text-end">
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

    <!-- Tabla de Usuarios -->
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Empleado</th>
            <th>Estado</th>
            <th style="width: 160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in usuariosPaginados" :key="user.id">
            <td class="text-center">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
            <td class="fw-bold">{{ user.usuario }}</td>
            <td>
              <span class="badge" :class="getRoleBadgeClass(user.rol)">
                {{ user.rol }}
              </span>
            </td>
            <td>
              <i class="pi pi-user me-2 text-muted"></i>
              {{ getEmpleadoNombreCompleto(user.empleado) }}
            </td>
            <td>
              <span v-if="user.activo" class="badge bg-success">Activo</span>
              <span v-else class="badge bg-danger">Inactivo</span>
            </td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button
                  icon="pi pi-eye"
                  aria-label="Ver Detalle"
                  class="p-button-text p-button-sm text-info"
                  @click="mostrarDetalle(user)"
                />
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  class="p-button-text p-button-sm"
                  @click="editUser(user)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  class="p-button-text p-button-sm text-danger"
                  @click="deleteUser(user.id)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="usuariosPaginados.length === 0">
            <td colspan="6" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted">
        Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} a
        {{ Math.min(paginaActual * itemsPorPagina, filteredUsers.length) }} de
        {{ filteredUsers.length }} registros
      </div>

      <nav aria-label="Paginación">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: paginaActual === 1 }">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual - 1)">
              <i class="pi pi-angle-left"></i>
            </a>
          </li>

          <li v-if="rangosPaginas[0] > 1" class="page-item">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(1)">1</a>
          </li>
          <li v-if="rangosPaginas[0] > 2" class="page-item disabled">
            <span class="page-link">...</span>
          </li>

          <li
            v-for="pagina in rangosPaginas"
            :key="pagina"
            class="page-item"
            :class="{ active: pagina === paginaActual }"
          >
            <a class="page-link" href="#" @click.prevent="cambiarPagina(pagina)">
              {{ pagina }}
            </a>
          </li>

          <li
            v-if="rangosPaginas[rangosPaginas.length - 1] < totalPaginas - 1"
            class="page-item disabled"
          >
            <span class="page-link">...</span>
          </li>
          <li v-if="rangosPaginas[rangosPaginas.length - 1] < totalPaginas" class="page-item">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(totalPaginas)">
              {{ totalPaginas }}
            </a>
          </li>

          <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual + 1)">
              <i class="pi pi-angle-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Dialog de Detalle de Usuario -->
    <Dialog
      v-model:visible="mostrarDetalleDialog"
      header="Información del Usuario"
      :style="{ width: '45rem' }"
      :modal="true"
    >
      <div v-if="usuarioDetalle" class="detalle-usuario">
        <!-- Header con Avatar -->
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <i class="pi pi-user"></i>
            </div>
          </div>
          <div class="profile-info">
            <h4 class="usuario-nombre">@{{ usuarioDetalle.usuario }}</h4>
            <div class="mt-2">
              <span class="badge" :class="getRoleBadgeClass(usuarioDetalle.rol)">
                <i class="pi pi-shield me-1"></i>{{ usuarioDetalle.rol }}
              </span>
              <span class="ms-2 badge" :class="usuarioDetalle.activo ? 'bg-success' : 'bg-danger'">
                <i
                  class="pi me-1"
                  :class="usuarioDetalle.activo ? 'pi-check-circle' : 'pi-times-circle'"
                ></i>
                {{ usuarioDetalle.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <hr class="separator" />

        <!-- Información del Empleado Asociado -->
        <div class="section-container">
          <h6 class="section-title"><i class="pi pi-user me-2"></i>Empleado Asociado</h6>
          <div class="info-card">
            <div class="info-icon bg-primary">
              <i class="pi pi-id-card"></i>
            </div>
            <div class="info-text">
              <label>Nombre Completo</label>
              <span>{{ getEmpleadoNombreCompleto(usuarioDetalle.empleado) }}</span>
            </div>
          </div>

          <div v-if="usuarioDetalle.empleado" class="mt-3">
            <div class="row">
              <div class="col-md-6">
                <div class="info-item-simple">
                  <strong><i class="pi pi-briefcase me-2 text-primary"></i>Cargo:</strong>
                  <span class="ms-2">{{ usuarioDetalle.empleado.cargo || 'N/A' }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item-simple">
                  <strong><i class="pi pi-phone me-2 text-success"></i>Celular:</strong>
                  <a :href="`tel:${usuarioDetalle.empleado.celular}`" class="ms-2 text-primary">
                    {{ usuarioDetalle.empleado.celular || 'N/A' }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de Seguridad -->
        <div class="section-container">
          <h6 class="section-title"><i class="pi pi-lock me-2"></i>Información de Seguridad</h6>
          <div class="alert alert-info d-flex align-items-center">
            <i class="pi pi-info-circle me-2"></i>
            <span>
              El usuario tiene acceso al sistema con permisos de
              <strong>{{ usuarioDetalle.rol }}</strong
              >.
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Editar Usuario"
          icon="pi pi-pencil"
          class="me-2"
          @click="
            () => {
              mostrarDetalleDialog = false
              editUser(usuarioDetalle!)
            }
          "
        />
        <Button label="Cerrar" severity="secondary" @click="mostrarDetalleDialog = false" />
      </template>
    </Dialog>

    <!-- Dialog de Agregar/Editar Usuario -->
    <Dialog
      v-model:visible="showAddModal"
      :header="modoEdicion ? 'Editar Usuario' : 'Agregar Nuevo Usuario'"
      :modal="true"
      style="width: 40rem"
    >
      <div v-if="formError" class="alert alert-danger d-flex align-items-center">
        <i class="pi pi-exclamation-triangle me-2"></i>
        <span>{{ formError }}</span>
      </div>

      <div class="p-fluid">
        <div class="mb-3">
          <label class="form-label fw-semibold">Usuario</label>
          <InputText v-model="newUserForm.usuario" class="w-100" placeholder="Nombre de usuario" />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Clave</label>
          <InputText
            v-model="newUserForm.clave"
            type="password"
            class="w-100"
            placeholder="Contraseña (mín. 6 caracteres)"
          />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Confirmar Clave</label>
          <InputText
            v-model="(newUserForm as any).confirmPassword"
            type="password"
            class="w-100"
            :class="{ 'is-invalid': !passwordMatch && (newUserForm as any).confirmPassword }"
            placeholder="Confirmar contraseña"
          />
          <small v-if="!passwordMatch && (newUserForm as any).confirmPassword" class="text-danger"
            >Las contraseñas no coinciden</small
          >
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Rol</label>
          <Dropdown
            v-model="newUserForm.rol"
            :options="rolesOptions"
            optionLabel="label"
            optionValue="value"
            class="w-100"
            placeholder="Selecciona un rol"
          />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Empleado</label>
          <Dropdown
            v-model="newUserForm.idEmpleado"
            :options="empleadosOptions"
            optionLabel="label"
            optionValue="value"
            class="w-100"
            placeholder="Selecciona un empleado"
            :filter="true"
            @filter="filterEmpleados"
            filterPlaceholder="Buscar empleado..."
          />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Estado</label>
          <Dropdown
            v-model="newUserForm.activo"
            :options="[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false },
            ]"
            optionLabel="label"
            optionValue="value"
            class="w-100"
          />
        </div>
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
.users-view {
  padding: 1rem;
}

.page-header h2 {
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.table-responsive {
  overflow-x: auto;
}

table {
  min-width: 800px;
  border-collapse: collapse;
}

table th,
table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.pagination .page-link {
  cursor: pointer;
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
}

/* Detalle de Usuario */
.detalle-usuario {
  padding: 0.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.usuario-nombre {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.separator {
  margin: 1.5rem 0;
  border-top: 2px solid #e9ecef;
}

.section-container {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.info-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.info-icon.bg-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-text label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
}

.info-text span,
.info-text a {
  color: #212529;
  font-size: 1rem;
  font-weight: 500;
}

.info-item-simple {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
