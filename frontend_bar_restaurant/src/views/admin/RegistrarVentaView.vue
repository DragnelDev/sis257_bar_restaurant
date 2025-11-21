<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from '../../plugins/axios'
import { useAuth } from '../../composables/useAuth'

const ENDPOINT = 'ventas'
// --- 1. INTERFACES (Adaptadas de tu backend) ---
interface Receta {
  id: number
  nombreReceta: string
  precioVentaActual: number
  categoria: string
  urlImagen: string
}

interface DetalleVentaItem {
  idReceta: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

// --- 2. PROPS y EMITS ---
const props = defineProps<{
  initialMesaId: number // ID de la mesa actual
  initialVentaId?: number | null // ID de la venta si se está editando una orden existente
}>()

const emit = defineEmits(['close']) // Para que el botón "Volver" funcione

// --- 3. ESTADO LOCAL DE LA VENTA ---
const currentOrder = ref<DetalleVentaItem[]>([]) // El carrito
const mesaId = ref(props.initialMesaId)
const ventaId = ref(props.initialVentaId || null)

// Auth
const { user, checkAuth } = useAuth()
checkAuth()

// ESTADO DE FILTROS Y BÚSQUEDA
const selectedCategory = ref('all')
const searchQuery = ref('')

// ESTADO DE PAGO
const tipoPago = ref('EFECTIVO')
const montoRecibido = ref<number | null>(null)

// ESTADO DE FACTURACIÓN (NUEVOS CAMPOS)
const requiereFactura = ref(false)
const nitCI = ref('')
const nombreFiscal = ref('')

// --- 4. DATOS DEL MENÚ (serán cargados desde /recetas y normalizados) ---
const menuItems = ref<Receta[]>([])

// Normaliza posibles estructuras de la API a la forma que usa el componente
const normalizeReceta = (r: unknown): Receta => {
  const obj: any = r as any
  const precioRaw = obj.precioVentaActual ?? obj.price ?? 0
  let precioNum = 0
  if (typeof precioRaw === 'string') {
    const cleaned = precioRaw.replace(',', '.').replace(/[^0-9.-]/g, '')
    precioNum = parseFloat(cleaned)
  } else {
    precioNum = Number(precioRaw)
  }
  if (!Number.isFinite(precioNum)) precioNum = 0
  return {
    id: obj.id,
    nombreReceta: obj.nombreReceta || obj.name || 'Sin nombre',
    precioVentaActual: precioNum,
    // Soporta `categoria` como string o como objeto { nombre }
    categoria:
      typeof obj.categoria === 'string'
        ? obj.categoria
        : obj.categoria?.nombre || obj.category || 'principal',
    urlImagen: obj.urlImagen || obj.image || '/img/default.jpg',
  }
}

// Formatea precios de forma segura para la plantilla
const formatPrice = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

const loadMenu = async () => {
  try {
    const res = await axios.get('/recetas')
    // Manejar varias envolturas comunes: res.data, res.data.data, res.data.items
    let data: unknown = res?.data
    if (data && (data as any).data) data = (data as any).data
    if (data && (data as any).items) data = (data as any).items

    if (!Array.isArray(data)) {
      console.warn('Respuesta de /recetas inesperada:', res)
      menuItems.value = []
      return
    }

    const normalized = (data as unknown[]).map((r) => normalizeReceta(r))
    menuItems.value = normalized
    console.debug(
      `Menú cargado: ${menuItems.value.length} recetas. Categorías:`,
      Array.from(new Set(menuItems.value.map((m) => m.categoria))),
    )
    // Si está vacío en desarrollo, opcionalmente poblar con ejemplo para visualización
    if (menuItems.value.length === 0 && import.meta.env.DEV) {
      console.info('Falló carga de recetas; usando datos de ejemplo en modo DEV')
      menuItems.value = [
        {
          id: 999,
          nombreReceta: 'Ejemplo - Hamburguesa',
          precioVentaActual: 35,
          categoria: 'principal',
          urlImagen: '/img/hamburguesa.jpg',
        },
        {
          id: 998,
          nombreReceta: 'Ejemplo - Papas',
          precioVentaActual: 15,
          categoria: 'acompañamiento',
          urlImagen: '/img/papas.jpg',
        },
      ]
    }
  } catch (err) {
    console.warn('No se pudo cargar el menú desde /recetas:', err)
    // Fallback en modo desarrollo para facilitar pruebas
    if (import.meta.env.DEV) {
      menuItems.value = [
        {
          id: 999,
          nombreReceta: 'Ejemplo - Hamburguesa',
          precioVentaActual: 35,
          categoria: 'principal',
          urlImagen: '/img/hamburguesa.jpg',
        },
        {
          id: 998,
          nombreReceta: 'Ejemplo - Papas',
          precioVentaActual: 15,
          categoria: 'acompañamiento',
          urlImagen: '/img/papas.jpg',
        },
      ]
    } else {
      menuItems.value = []
    }
  }
}

// Cargar una venta existente y poblar el carrito
const loadVenta = async (vId: number) => {
  try {
    const res = await axios.get(`/${ENDPOINT}/${vId}`)
    let data = res?.data
    if (data && (data as any).data) data = (data as any).data

    if (!data || !Array.isArray(data.detalles)) {
      console.warn('Venta no encontrada o sin detalles:', res)
      return
    }

    // Poblar currentOrder con los detalles existentes
    currentOrder.value = (data.detalles as any[]).map((d: any) => ({
      idReceta: d.idReceta,
      name: d.name || d.nombreReceta || 'Sin nombre',
      price: Number(d.price ?? d.precioUnitarioVenta ?? 0),
      quantity: Number(d.quantity ?? d.cantidad ?? 0),
      subtotal:
        Number(d.quantity ?? d.cantidad ?? 0) * Number(d.price ?? d.precioUnitarioVenta ?? 0),
    }))

    // Cargar otros datos de la venta
    tipoPago.value = data.tipoPago || 'EFECTIVO'
    requiereFactura.value = data.requiereFactura || false
    nitCI.value = data.nitCI || ''
    nombreFiscal.value = data.nombreFiscal || ''

    console.debug(`Venta #${vId} cargada: ${currentOrder.value.length} ítems`)
  } catch (err) {
    console.warn(`No se pudo cargar la venta #${vId}:`, err)
  }
}

onMounted(() => {
  loadMenu()
  // Si hay una venta existente, cargarla
  if (props.initialVentaId) {
    loadVenta(props.initialVentaId)
  }
})

// Sincronizar cambios en props (en caso de que las props cambien)
watch(
  () => props.initialMesaId,
  (newMesaId) => {
    mesaId.value = newMesaId
  },
)

watch(
  () => props.initialVentaId,
  (newVentaId) => {
    if (newVentaId) {
      ventaId.value = newVentaId
      loadVenta(newVentaId)
    }
  },
)

// --- 5. PROPIEDADES COMPUTADAS ---
const totalPagar = computed(() => {
  return currentOrder.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const vuelto = computed(() => {
  if (
    tipoPago.value === 'EFECTIVO' &&
    montoRecibido.value !== null &&
    montoRecibido.value > totalPagar.value
  ) {
    return montoRecibido.value - totalPagar.value
  }
  return 0
})

const filteredItems = computed(() => {
  return menuItems.value.filter((item) => {
    const matchesCategory =
      selectedCategory.value === 'all' || item.categoria === selectedCategory.value
    const matchesSearch = item.nombreReceta.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    principal: 'primary',
    acompañamiento: 'success',
    bebidas: 'info',
    postres: 'warning',
  }
  return colors[category] || 'secondary'
}

// Lista dinámica de categorías (incluye 'all')
const uniqueCategories = computed(() => {
  const set = new Set<string>()
  menuItems.value.forEach((m) => set.add(m.categoria || 'principal'))
  return ['all', ...Array.from(set)]
})

const formatCategoryLabel = (c: string) => {
  if (c === 'all') return 'Todas las Categorias'
  return c.charAt(0).toUpperCase() + c.slice(1)
}

// --- 6. LÓGICA DE CARRITO (ÍDEM ANTERIOR) ---
const addItemToOrder = (item: Receta) => {
  const existingItem = currentOrder.value.find((i) => i.idReceta === item.id)

  if (existingItem) {
    existingItem.quantity += 1
    existingItem.subtotal = existingItem.quantity * existingItem.price
  } else {
    currentOrder.value.push({
      idReceta: item.id,
      name: item.nombreReceta,
      price: Number(item.precioVentaActual) || 0,
      quantity: 1,
      subtotal: Number(item.precioVentaActual) || 0,
    })
  }
}

const updateItemQuantity = (idReceta: number, change: number) => {
  const item = currentOrder.value.find((i) => i.idReceta === idReceta)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      currentOrder.value = currentOrder.value.filter((i) => i.idReceta !== idReceta)
    } else {
      item.subtotal = item.quantity * item.price
    }
  }
}

// --- 7. LÓGICA DE PAGO/CIERRE DE VENTA (EL PUNTO CLAVE) ---
const checkout = async () => {
  if (currentOrder.value.length === 0) {
    alert('La orden está vacía. No se puede procesar la venta.')
    return
  }

  if (
    tipoPago.value === 'EFECTIVO' &&
    (montoRecibido.value === null || montoRecibido.value < totalPagar.value)
  ) {
    alert('Falta ingresar el monto recibido o el monto es insuficiente.')
    return
  }

  // VALIDACIÓN DE FACTURA
  if (requiereFactura.value && (!nitCI.value || !nombreFiscal.value)) {
    alert('Debe ingresar el NIT/CI y la Razón Social para emitir la factura.')
    return
  }

  // 1. Mapear la orden al DTO de tu backend
  const detallesVenta = currentOrder.value.map((item) => ({
    idReceta: item.idReceta,
    cantidad: item.quantity,
    precioUnitarioVenta: item.price,
  }))

  // Validaciones de integridad (evitar FK violations)
  if (!mesaId.value || Number(mesaId.value) === 0) {
    alert('La venta debe estar asociada a una mesa válida. Verifique la mesa asignada.')
    return
  }

  const idUsuario = Number(user.value?.id ?? 0)
  if (!idUsuario || idUsuario === 0) {
    alert('No hay un usuario autenticado. Inicie sesión antes de procesar la venta.')
    return
  }

  // 2. Construir el objeto de Venta con DATOS FISCALES
  const ventaPayload: any = {
    idMesa: Number(mesaId.value),
    idUsuario: idUsuario,
    total: totalPagar.value,
    estado: 'PAGADA', // CRÍTICO: Activa descuento de stock
    tipoPago: tipoPago.value,
    detalles: detallesVenta,
    requiereFactura: requiereFactura.value,
    // El backend suele esperar strings para nit/nombre; enviar cadena vacía si no aplica
    nitCI: requiereFactura.value ? nitCI.value : '',
    nombreFiscal: requiereFactura.value ? nombreFiscal.value : '',
  }
  try {
    // --- 3. ENVÍO AL BACKEND (NestJS) ---
    const endpoint = ventaId.value ? `/${ENDPOINT}/${ventaId.value}/pagar` : `/${ENDPOINT}`

    console.debug(`Enviando venta a ${endpoint}:`, ventaPayload)
    const res = await axios.post(endpoint, ventaPayload)

    console.info('Respuesta del servidor al crear/pagar venta:', res?.data)
    alert(`✅ Venta procesada con éxito. Total: $${totalPagar.value.toFixed(2)}.`)

    // 4. Limpiar y Emitir evento para volver
    currentOrder.value = []
    montoRecibido.value = null
    // Opcional: actualizar ventaId si backend devuelve el id
    if (res?.data?.id) ventaId.value = res.data.id
    emit('close')
  } catch (error) {
    console.error('Error al procesar la venta:', error)
    // Mostrar detalles si la respuesta del servidor provee información
    const err: any = error
    if (err.response && err.response.data) {
      const serverData = err.response.data
      const msg = serverData.message || serverData.error || JSON.stringify(serverData)
      alert(`❌ Error al procesar la venta: ${msg}`)
    } else if (err.message) {
      alert(`❌ Error al procesar la venta: ${err.message}`)
    } else {
      alert('❌ Error al procesar la venta. Intente de nuevo.')
    }
  }
}
</script>

<template>
  <div class="pos-screen container-fluid p-4">
    <div class="page-header mb-4 d-flex justify-content-between align-items-center">
      <div>
        <h2 class="mb-1">Punto de Venta (POS)</h2>
        <p class="text-muted">
          Mesa Asignada: **{{ mesaId }}** | Venta ID: {{ ventaId || 'Nueva' }}
        </p>
      </div>
      <button class="btn btn-secondary" @click="emit('close')">
        <i class="fa fa-arrow-left me-1"></i> Volver a Mesas
      </button>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card mb-4">
          <div class="card-body p-3">
            <div class="row g-2">
              <div class="col-md-7">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Buscar plato..."
                  v-model="searchQuery"
                />
              </div>
              <div class="col-md-5">
                <select class="form-select" v-model="selectedCategory">
                  <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
                    {{ formatCategoryLabel(cat) }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 menu-grid scrollable-menu">
          <div v-for="item in filteredItems" :key="item.id" class="col-lg-3 col-md-4 col-sm-6">
            <div class="menu-item-card text-center" @click="addItemToOrder(item)">
              <img
                :src="item.urlImagen"
                :alt="item.nombreReceta"
                class="img-fluid rounded mb-2"
                style="height: 100px; object-fit: cover"
              />
              <div class="mb-1">
                <span :class="['badge', 'bg-' + getCategoryColor(item.categoria)]">
                  {{ item.categoria }}
                </span>
              </div>
              <h6 class="mb-0">{{ item.nombreReceta }}</h6>
              <span class="price fw-bold">${{ formatPrice(item.precioVentaActual) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card order-summary sticky-top-card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">📝 Orden de Venta</h5>
          </div>

          <div class="card-body p-0 order-list-body">
            <ul class="list-group list-group-flush order-list">
              <li
                v-if="currentOrder.length === 0"
                class="list-group-item text-muted text-center py-4"
              >
                Agregue ítems del menú.
              </li>
              <li
                v-for="item in currentOrder"
                :key="item.idReceta"
                class="list-group-item d-flex align-items-center justify-content-between"
              >
                <div>
                  <span class="badge bg-primary me-2">{{ item.quantity }}x</span>
                  <strong>{{ item.name }}</strong>
                </div>
                <div class="d-flex align-items-center">
                  <div class="btn-group btn-group-sm me-3" role="group">
                    <button
                      class="btn btn-outline-danger"
                      @click="updateItemQuantity(item.idReceta, -1)"
                    >
                      <i class="fa fa-minus"></i>
                    </button>
                    <button
                      class="btn btn-outline-success"
                      @click="updateItemQuantity(item.idReceta, 1)"
                    >
                      <i class="fa fa-plus"></i>
                    </button>
                  </div>
                  <div class="fs-5 fw-bold text-end" style="width: 80px">
                    ${{ formatPrice(item.subtotal) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="card-footer p-3 bg-light">
            <hr class="my-2" />
            <div class="d-flex justify-content-between align-items-center mb-3 text-primary">
              <h4>TOTAL A PAGAR:</h4>
              <h3 class="fw-bolder">${{ totalPagar.toFixed(2) }}</h3>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Método de Pago:</label>
              <select class="form-select" v-model="tipoPago">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta (Débito/Crédito)</option>
                <option value="QR">Transferencia/QR</option>
              </select>
            </div>

            <div v-if="tipoPago === 'EFECTIVO'" class="mb-3">
              <label class="form-label fw-bold">Monto Recibido:</label>
              <input
                type="number"
                class="form-control form-control-lg"
                v-model.number="montoRecibido"
                placeholder="0.00"
              />
            </div>

            <div
              v-if="tipoPago === 'EFECTIVO'"
              class="mb-4 d-flex justify-content-between text-success fw-bold fs-5"
            >
              <span>Vuelto:</span>
              <span>${{ vuelto.toFixed(2) }}</span>
            </div>

            <hr class="my-3" />
            <h5 class="fw-bold mb-3">Opciones de Facturación</h5>

            <div class="form-check form-switch mb-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="requiereFactura"
                v-model="requiereFactura"
              />
              <label class="form-check-label" for="requiereFactura"
                >El cliente requiere Factura</label
              >
            </div>

            <div v-if="requiereFactura">
              <div class="mb-3">
                <label class="form-label">NIT / CI:</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="nitCI"
                  placeholder="Ej: 1234567012"
                />
              </div>
              <div class="mb-4">
                <label class="form-label">Razón Social / Nombre Fiscal:</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="nombreFiscal"
                  placeholder="Ej: Juan Pérez o CONSUMIDOR FINAL"
                />
              </div>
            </div>

            <button
              class="btn btn-primary w-100 btn-lg"
              :disabled="currentOrder.length === 0"
              @click="checkout"
            >
              <i class="fa fa-cash-register me-2"></i> COBRAR Y CERRAR VENTA
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-item-card {
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.1s;
}
.menu-item-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.price {
  color: var(--bs-primary);
}

.scrollable-menu {
  max-height: 70vh; /* Altura máxima del menú */
  overflow-y: auto;
}

.sticky-top-card {
  position: sticky;
  top: 20px;
}

.order-list-body {
  max-height: 40vh; /* Altura máxima para la lista de ítems */
  overflow-y: auto;
}
</style>
