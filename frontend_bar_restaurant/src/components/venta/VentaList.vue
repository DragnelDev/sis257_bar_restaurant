<script setup lang="ts">
import type { DetalleVentaItem, Venta } from '@/models/venta'
import http from '@/plugins/axios'
// Se eliminan: Dialog, Button (solo se usa para visualizar)
import { InputGroup, InputGroupAddon, InputText, Dropdown, Button, Dialog } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'ventas'
const ventas = ref<Venta[]>([])
const detalleVentas = ref<DetalleVentaItem[]>([])

const busqueda = ref<string>('')

// Visualizador de detalles
const selectedVenta = ref<Venta | null>(null)
const dialogVisible = ref(false)

// El evento 'edit' se cambia a 'view'
const emit = defineEmits(['view'])

// --- Paginación y Opciones ---
const opcionesFilas = [10, 25, 50, 100]
const filasPorPagina = ref<number>(10)
const paginaActual = ref<number>(1)

// --- Funciones de Cálculo de Rentabilidad (Se mantienen) ---

function calcularCostoTotal(venta: Venta): number {
  if (!venta.detalleVentas || venta.detalleVentas.length === 0) {
    return 0
  }

  const costo = venta.detalleVentas.reduce((sum, detalle) => {
    const costoUnitario = parseFloat(detalle.costo_unitario ?? '0')
    return sum + costoUnitario * detalle.cantidad
  }, 0)

  return parseFloat(costo.toFixed(2))
}

function calcularGananciaBruta(venta: Venta): number {
  const total = parseFloat(venta.total ?? '0')
  const costoTotal = calcularCostoTotal(venta)
  return parseFloat((total - costoTotal).toFixed(2))
}

function calcularCantidadItems(venta: Venta): number {
  if (!venta.detalleVentas || venta.detalleVentas.length === 0) {
    return 0
  }
  return venta.detalleVentas.reduce((sum, detalle) => sum + detalle.cantidad, 0)
}

function formatFecha(fecha: string): string {
  try {
    const date = new Date(fecha)
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    return fecha
  }
}

// --- Propiedades Computed (Se mantienen) ---

const ventasFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase()
  return ventas.value.filter(
    (venta) =>
      (venta.estado ?? '').toLowerCase().includes(q) ||
      (venta.tipoPago ?? '').toLowerCase().includes(q) ||
      (venta.fecha ?? '').toLowerCase().includes(q) ||
      (venta.mesa?.numeroMesa.toString() ?? '').includes(q) ||
      (venta.usuario?.usuario ?? '').toLowerCase().includes(q) ||
      (venta.cliente?.nombreFiscal ?? '').toLowerCase().includes(q) ||
      String(venta.total ?? '').includes(q),
  )
})

const ventasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * filasPorPagina.value
  const fin = inicio + filasPorPagina.value
  return ventasFiltradas.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(ventasFiltradas.value.length / filasPorPagina.value)
})

const resumenTotales = computed(() => {
  const totalVentas = ventasFiltradas.value.reduce((sum, v) => sum + parseFloat(v.total ?? '0'), 0)
  const costoTotal = ventasFiltradas.value.reduce((sum, v) => sum + calcularCostoTotal(v), 0)
  const gananciaTotal = totalVentas - costoTotal

  return {
    totalVentas: parseFloat(totalVentas.toFixed(2)),
    costoTotal: parseFloat(costoTotal.toFixed(2)),
    gananciaTotal: parseFloat(gananciaTotal.toFixed(2)),
  }
})

// --- Funciones de Fetch y UI ---

async function obtenerLista() {
  ventas.value = await http.get(ENDPOINT).then((res) => res.data)
  paginaActual.value = 1
}

/**
 * Emite el evento para visualizar los detalles de la venta.
 * @param venta La venta seleccionada.
 */
function emitirVisualizacion(venta: Venta) {
  // abrir diálogo localmente y también emitir evento hacia el padre
  selectedVenta.value = venta
  dialogVisible.value = true
  emit('view', venta)
}

onMounted(obtenerLista)
defineExpose({ obtenerLista })
</script>

<template>
  <div class="container-fluid p-0">
    <h2 class="my-4">📊 Reporte Detallado de Ventas</h2>

    <div class="row mb-4 align-items-center">
      <div class="col-md-6 col-lg-4">
        <InputGroup>
          <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
          <InputText
            v-model="busqueda"
            type="text"
            placeholder="Buscar por cliente, estado, fecha, mesa o usuario"
          />
        </InputGroup>
      </div>

      <div class="col-md-6 col-lg-3 d-flex align-items-center mt-3 mt-md-0">
        <label for="filas" class="me-2 text-nowrap">Filas por página:</label>
        <Dropdown
          id="filas"
          v-model="filasPorPagina"
          :options="opcionesFilas"
          placeholder="Seleccionar"
          class="w-full"
        />
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card p-3 bg-primary text-white shadow-sm">
          <h5 class="card-title">Total Ingresos</h5>
          <h3>Bs. {{ resumenTotales.totalVentas }}</h3>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 bg-danger text-white shadow-sm">
          <h5 class="card-title">Costo Total</h5>
          <h3>Bs. {{ resumenTotales.costoTotal }}</h3>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 bg-success text-white shadow-sm">
          <h5 class="card-title">Ganancia Bruta</h5>
          <h3>Bs. {{ resumenTotales.gananciaTotal }}</h3>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="bg-dark text-white">
          <tr>
            <th>Nro.</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Tipo Pago</th>
            <th>Mesa</th>
            <th>Usuario</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Costo Venta</th>
            <th>Ganancia Bruta</th>
            <th>Cant. Ítems</th>
            <th>Visualizar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venta, index) in ventasPaginadas" :key="venta.id">
            <td>{{ (paginaActual - 1) * filasPorPagina + index + 1 }}</td>
            <td>{{ formatFecha(venta.fecha) }}</td>
            <td>{{ venta.estado }}</td>
            <td>{{ venta.tipoPago }}</td>
            <td>{{ venta.mesa?.numeroMesa ?? 'N/A' }}</td>
            <td>{{ venta.usuario?.usuario ?? 'N/A' }}</td>
            <td>{{ venta.cliente?.nombreFiscal ?? 'Consumidor Final' }}</td>
            <td class="text-end">Bs. {{ venta.total }}</td>
            <td class="text-end text-danger">Bs. {{ calcularCostoTotal(venta) }}</td>
            <td class="text-end text-success">Bs. {{ calcularGananciaBruta(venta) }}</td>
            <td class="text-center">{{ calcularCantidadItems(venta) }}</td>
            <td>
              <Button
                icon="pi pi-eye"
                aria-label="Visualizar"
                text
                severity="info"
                @click="emitirVisualizacion(venta)"
              />
            </td>
          </tr>
          <tr v-if="ventasPaginadas.length === 0">
            <td colspan="12" class="text-center">
              No se encontraron resultados para los filtros aplicados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialog: Detalles de venta -->
    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '800px' }"
      header="Detalles de la Venta"
    >
      <div v-if="selectedVenta">
        <div class="mb-2">
          <strong>Fecha:</strong> {{ formatFecha(selectedVenta.fecha) }} &nbsp;|&nbsp;
          <strong>Estado:</strong> {{ selectedVenta.estado }} &nbsp;|&nbsp;
          <strong>Tipo Pago:</strong> {{ selectedVenta.tipoPago }}
        </div>

        <div class="mb-2">
          <strong>Mesa:</strong>
          {{ selectedVenta.mesa?.numeroMesa ?? selectedVenta.idMesa ?? 'N/A' }} &nbsp;|&nbsp;
          <strong>Usuario:</strong> {{ selectedVenta.usuario?.usuario ?? 'N/A' }} &nbsp;|&nbsp;
          <strong>Cliente:</strong> {{ selectedVenta.cliente?.nombreFiscal ?? 'Consumidor Final' }}
        </div>

        <div class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead class="table-light">
              <tr>
                <th>Producto</th>
                <th class="text-end">Cantidad</th>
                <th class="text-end">Precio Unit.</th>
                <th class="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in selectedVenta.detalleVentas || []" :key="i">
                <td>
                  {{
                    (d.producto && d.producto.nombre) ||
                    d.nombreProducto ||
                    d.nombre ||
                    d.idProducto
                  }}
                </td>
                <td class="text-end">{{ d.cantidad ?? d.cantidadVenta ?? 0 }}</td>
                <td class="text-end">
                  Bs.
                  {{
                    parseFloat(d.precioUnitarioVenta ?? d.precio_unitario ?? d.precio ?? 0).toFixed(
                      2,
                    )
                  }}
                </td>
                <td class="text-end">
                  Bs.
                  {{
                    (
                      parseFloat(d.cantidad ?? d.cantidadVenta ?? 0) *
                      parseFloat(d.precioUnitarioVenta ?? d.precio_unitario ?? d.precio ?? 0)
                    ).toFixed(2)
                  }}
                </td>
              </tr>
              <tr v-if="!(selectedVenta.detalleVentas && selectedVenta.detalleVentas.length)">
                <td colspan="4" class="text-center">No hay detalles disponibles.</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end"><strong>Total Venta</strong></td>
                <td class="text-end">
                  <strong>Bs. {{ parseFloat(selectedVenta.total ?? '0').toFixed(2) }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <Button
            label="Cerrar"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="dialogVisible = false"
          />
        </div>
      </div>
      <div v-else>
        <p>No hay venta seleccionada.</p>
      </div>
    </Dialog>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <span>Mostrando {{ ventasPaginadas.length }} de {{ ventasFiltradas.length }} registros.</span>
      <div>
        <Button
          icon="pi pi-angle-left"
          @click="paginaActual--"
          :disabled="paginaActual === 1"
          class="p-button-sm me-2"
        />
        <span class="mx-2">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <Button
          icon="pi pi-angle-right"
          @click="paginaActual++"
          :disabled="paginaActual >= totalPaginas"
          class="p-button-sm"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos Bootstrap se mantienen */
.card h5 {
  font-size: 0.9rem;
}
.card h3 {
  font-weight: bold;
}
.table-responsive {
  overflow-x: auto;
}
/* Se añade un pequeño estilo para las celdas de Acciones/Visualizar */
.table th:last-child,
.table td:last-child {
  text-align: center;
  width: 80px; /* Ancho fijo para el botón */
}
</style>
