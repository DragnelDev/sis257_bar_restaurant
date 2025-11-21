<template>
  <div>
    <div class="col-7 pl-0 mt-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre o NIT" />
      </InputGroup>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <div v-if="cargando" class="alert alert-info mt-3">Cargando proveedores...</div>

    <div v-if="!cargando && !error" class="table-responsive mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark text-white">
          <tr>
            <th style="width: 48px">Nro</th>
            <th>Nombre de Empresa</th>
            <th>NIT</th>
            <th>Responsable</th>
            <th>Direccion</th>
            <th>Celular</th>
            <th>Email</th>
            <th>Condicion de Pago</th>
            <th style="width: 120px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(prov, index) in proveedoresFiltrados"
            :key="prov.id"
            :class="{ 'row-alternate': index % 2 === 1 }"
          >
            <td class="text-center">{{ (pagina - 1) * paginaSize + index + 1 }}</td>
            <td>{{ prov.nombreEmpresa }}</td>
            <td>{{ prov.nit }}</td>
            <td>{{ prov.responsable }}</td>
            <td class="text-truncate" style="max-width: 200px">{{ prov.direccion }}</td>
            <td>{{ prov.celular }}</td>
            <td>{{ prov.email }}</td>
            <td>{{ prov.condicionPago }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <Button
                  icon="pi pi-pencil"
                  aria-label="Editar"
                  class="p-button-text p-button-sm"
                  @click="emitEdit(prov)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  class="p-button-text p-button-sm text-danger"
                  @click="confirmDelete(prov)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="proveedoresFiltrados.length === 0">
            <td colspan="9" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>
        ¿Eliminar proveedor {{ proveedorDelete?.nombreEmpresa || proveedorDelete?.responsable }}?
      </p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="mostrarConfirmDialog = false"
        />
        <Button type="button" label="Eliminar" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Proveedor } from '@/models/Proveedor'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'proveedores'
const proveedores = ref<Proveedor[]>([])
const proveedorDelete = ref<Proveedor | null>(null)
const mostrarConfirmDialog = ref(false)
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const emit = defineEmits(['edit'])

const proveedoresFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return proveedores.value.filter(
    (p) =>
      (p.nombreEmpresa || '').toLowerCase().includes(q) || (p.nit || '').toLowerCase().includes(q),
  )
})

async function obtenerLista() {
  try {
    cargando.value = true
    error.value = ''
    const response = await http.get(ENDPOINT)
    proveedores.value = response.data
  } catch (err) {
    console.error('Error al obtener proveedores', err)
    error.value = err instanceof Error ? err.message : 'Error al cargar proveedores'
    proveedores.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerLista()
})

defineExpose({ obtenerLista })

function emitEdit(p: Proveedor) {
  emit('edit', p)
}

function confirmDelete(p: Proveedor) {
  proveedorDelete.value = p
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  if (!proveedorDelete.value) return
  await http.delete(`${ENDPOINT}/${proveedorDelete.value.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}

// Paginación
const pagina = ref<number>(1)
const paginaSize = ref<number>(10)
</script>

<style scoped>
.row-alternate {
  background: rgba(0, 0, 0, 0.02);
}
.error-message {
  color: #721c24;
  background: #f8d7da;
  padding: 0.6rem;
  border-radius: 0.25rem;
}
.loading-message {
  color: #0c5460;
  background: #d1ecf1;
  padding: 0.6rem;
  border-radius: 0.25rem;
}
.table-responsive .table td,
.table-responsive .table th {
  vertical-align: middle;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 576px) {
  .table-responsive table thead {
    display: none;
  }
  .table-responsive table tbody tr {
    display: block;
    margin-bottom: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 0.375rem;
    padding: 0.5rem;
  }
  .table-responsive table tbody td {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0.5rem;
  }
}
</style>
