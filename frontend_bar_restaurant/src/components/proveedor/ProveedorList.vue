<template>
  <div>
    <div class="col-7 pl-0 mt-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o NIT"
          @input="onBusqueda"
        />
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
            <th style="width: 160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(prov, index) in proveedoresPaginados" :key="prov.id">
            <td class="text-center">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
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
                  icon="pi pi-eye"
                  aria-label="Ver Detalle"
                  class="p-button-text p-button-sm text-info"
                  @click="mostrarDetalle(prov)"
                />
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
          <tr v-if="proveedoresPaginados.length === 0">
            <td colspan="9" class="text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      v-if="!cargando && !error && totalPaginas > 1"
      class="d-flex justify-content-between align-items-center mt-3"
    >
      <div class="text-muted">
        Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} a
        {{ Math.min(paginaActual * itemsPorPagina, proveedoresFiltrados.length) }} de
        {{ proveedoresFiltrados.length }} registros
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

    <!-- Dialog de Confirmación de Eliminación -->
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

    <!-- Dialog de Detalle de Proveedor -->
    <Dialog
      v-model:visible="mostrarDetalleDialog"
      :header="`Detalle del Proveedor`"
      :style="{ width: '50rem' }"
      :modal="true"
    >
      <div v-if="proveedorDetalle" class="detalle-proveedor">
        <div class="row">
          <div class="col-md-6">
            <div class="info-card mb-3">
              <h6 class="info-header">
                <i class="pi pi-building me-2"></i>Información de la Empresa
              </h6>
              <div class="info-content">
                <div class="info-item">
                  <strong>Nombre de Empresa:</strong>
                  <span>{{ proveedorDetalle.nombreEmpresa || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <strong>NIT:</strong>
                  <span>{{ proveedorDetalle.nit || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <strong>Condición de Pago:</strong>
                  <span class="badge bg-primary">{{
                    proveedorDetalle.condicionPago || 'N/A'
                  }}</span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h6 class="info-header"><i class="pi pi-map-marker me-2"></i>Ubicación</h6>
              <div class="info-content">
                <div class="info-item">
                  <strong>Dirección:</strong>
                  <span>{{ proveedorDetalle.direccion || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="info-card mb-3">
              <h6 class="info-header">
                <i class="pi pi-user me-2"></i>Información del Responsable
              </h6>
              <div class="info-content">
                <div class="info-item">
                  <strong>Responsable:</strong>
                  <span>{{ proveedorDetalle.responsable || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h6 class="info-header"><i class="pi pi-phone me-2"></i>Información de Contacto</h6>
              <div class="info-content">
                <div class="info-item">
                  <strong>Celular:</strong>
                  <span>
                    <a :href="`tel:${proveedorDetalle.celular}`" class="text-primary">
                      {{ proveedorDetalle.celular || 'N/A' }}
                    </a>
                  </span>
                </div>
                <div class="info-item">
                  <strong>Email:</strong>
                  <span>
                    <a :href="`mailto:${proveedorDetalle.email}`" class="text-primary">
                      {{ proveedorDetalle.email || 'N/A' }}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cerrar" @click="mostrarDetalleDialog = false" />
      </template>
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
const proveedorDetalle = ref<Proveedor | null>(null)
const mostrarConfirmDialog = ref(false)
const mostrarDetalleDialog = ref(false)
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')

// Variables de paginación
const paginaActual = ref<number>(1)
const itemsPorPagina = ref<number>(10)

const emit = defineEmits(['edit'])

// Filtrado de datos
const proveedoresFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return proveedores.value.filter(
    (p) =>
      (p.nombreEmpresa || '').toLowerCase().includes(q) ||
      (p.nit || '').toLowerCase().includes(q) ||
      (p.responsable || '').toLowerCase().includes(q),
  )
})

// Datos paginados
const proveedoresPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return proveedoresFiltrados.value.slice(inicio, fin)
})

// Total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(proveedoresFiltrados.value.length / itemsPorPagina.value)
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

function emitEdit(p: Proveedor) {
  emit('edit', p)
}

function confirmDelete(p: Proveedor) {
  proveedorDelete.value = p
  mostrarConfirmDialog.value = true
}

function mostrarDetalle(p: Proveedor) {
  proveedorDetalle.value = p
  mostrarDetalleDialog.value = true
}

async function eliminar() {
  if (!proveedorDelete.value) return
  await http.delete(`${ENDPOINT}/${proveedorDelete.value.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}

function cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

// Resetear a página 1 cuando se busca
function onBusqueda() {
  paginaActual.value = 1
}

onMounted(() => {
  obtenerLista()
})

defineExpose({ obtenerLista })
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

.pagination .page-link {
  cursor: pointer;
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
}

/* Estilos para el detalle del proveedor */
.detalle-proveedor {
  max-height: 70vh;
  overflow-y: auto;
}

.info-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.info-header {
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dee2e6;
  display: flex;
  align-items: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

.info-item span {
  font-size: 1rem;
  color: #212529;
}

.info-item a {
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
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

  .info-card {
    margin-bottom: 1rem;
  }
}
</style>
