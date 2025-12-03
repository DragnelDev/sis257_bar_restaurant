<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../../plugins/axios'
import { useAuth } from '../../composables/useAuth'

const ENDPOINT = 'ventas'

// -------------------- TIPOS / INTERFACES --------------------
interface Receta {
  id: number
  nombreReceta: string
  precioVentaActual: number
  categoria: string
  urlImagen: string
}

interface Producto {
  id: number
  nombre: string
  precioVentaUnitario: number
  esVendible: boolean
  urlImagen?: string
}

type MenuUnifiedItem = {
  type: 'receta' | 'producto'
  id: number
  nombre: string
  precio: number
  categoria: string
  urlImagen: string
}

interface DetalleVentaItem {
  type: 'receta' | 'producto'
  id: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

// -------------------- PROPS / EMITS --------------------
const props = defineProps<{
  initialMesaId: number
  initialVentaId?: number | null
}>()

const emit = defineEmits(['close'])

// -------------------- ESTADO LOCAL --------------------
const currentOrder = ref<DetalleVentaItem[]>([])
const mesaId = ref(props.initialMesaId)
const ventaId = ref<number | null>(props.initialVentaId ?? null)

// Auth
const { user, checkAuth } = useAuth()
checkAuth()

// Router
const router = useRouter()

const goToMesas = async () => {
  try {
    await router.push({ name: 'admin-mesas' })
  } catch {
    emit('close')
  }
}

// filtros y búsqueda
const selectedCategory = ref('all')
const searchQuery = ref('')

// pago y facturación
const tipoPago = ref('EFECTIVO')
const montoRecibido = ref<number | null>(null)
const requiereFactura = ref(false)
const nitCI = ref('')
const nombreFiscal = ref('')

// datos cargados
const menuItems = ref<Receta[]>([])
const menuProductos = ref<Producto[]>([])

// -------------------- UTILIDADES --------------------
const formatPrice = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

// -------------------- LOADERS --------------------
const normalizeReceta = (obj: unknown): Receta => {
  const o = obj as Record<string, any>
  const precioRaw = o['precioVentaActual'] ?? o['price'] ?? 0
  let precioNum = 0
  if (typeof precioRaw === 'string') {
    const cleaned = precioRaw.replace(',', '.').replace(/[^0-9.-]/g, '')
    precioNum = parseFloat(cleaned)
  } else {
    precioNum = Number(precioRaw)
  }
  if (!Number.isFinite(precioNum)) precioNum = 0

  const idRaw = o['id']
  const id = typeof idRaw === 'number' ? idRaw : Number(idRaw) || 0

  const nombreReceta =
    (typeof o['nombreReceta'] === 'string' && o['nombreReceta']) ||
    (typeof o['nombre'] === 'string' && o['nombre']) ||
    (typeof o['name'] === 'string' && o['name']) ||
    'Sin nombre'

  const categoria =
    (typeof o['categoria'] === 'string' && o['categoria']) || 'principal'

  const urlImagen =
    (typeof o['urlImagen'] === 'string' && o['urlImagen']) ||
    (typeof o['imagen'] === 'string' && o['imagen']) ||
    (typeof o['image'] === 'string' && o['image']) ||
    '/img/default-recipe.jpg'

  return {
    id,
    nombreReceta,
    precioVentaActual: precioNum,
    categoria,
    urlImagen,
  }
}

const normalizeProducto = (obj: any): Producto => {
  const precioRaw = obj.precioVentaUnitario ?? obj.price ?? obj.costo ?? 0
  let precioNum = 0
  if (typeof precioRaw === 'string') {
    const cleaned = precioRaw.replace(',', '.').replace(/[^0-9.-]/g, '')
    precioNum = parseFloat(cleaned)
  } else {
    precioNum = Number(precioRaw)
  }
  if (!Number.isFinite(precioNum)) precioNum = 0

  const id = typeof obj.id === 'number' ? obj.id : Number(obj.id) || 0

  return {
    id,
    nombre: obj.nombre || obj.name || 'Sin nombre',
    precioVentaUnitario: precioNum,
    esVendible: obj.esVendible === true,
    urlImagen: obj.urlImagen ?? obj.image ?? '/img/default-product.jpg',
  }
}

const loadMenu = async () => {
  try {
    const res = await axios.get('/recetas')
    let data: any = res?.data
    if (data && data.data) data = data.data
    if (data && data.items) data = data.items
    if (!Array.isArray(data)) {
      console.warn('Respuesta de /recetas inesperada:', res)
      menuItems.value = []
      return
    }
    menuItems.value = (data as any[]).map((r) => normalizeReceta(r))
    if (menuItems.value.length === 0 && import.meta.env.DEV) {
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
    if (import.meta.env.DEV) {
      menuItems.value = [
        {
          id: 999,
          nombreReceta: 'Ejemplo - Hamburguesa',
          precioVentaActual: 35,
          categoria: 'principal',
          urlImagen: '/img/hamburguesa.jpg',
        },
      ]
    } else {
      menuItems.value = []
    }
  }
}

const loadProductosVendibles = async () => {
  try {
    const res = await axios.get('/productos')
    let data: any = res?.data
    if (data && data.data) data = data.data
    if (!Array.isArray(data)) {
      menuProductos.value = []
      return
    }
    menuProductos.value = (data as any[])
      .filter((p) => p.esVendible === true)
      .map((p) => normalizeProducto(p))
  } catch (err) {
    console.warn('Error cargando productos vendibles:', err)
    menuProductos.value = []
  }
}

// -------------------- VENTAS EXISTENTES --------------------
const loadVenta = async (vId: number) => {
  try {
    const res = await axios.get(`/${ENDPOINT}/${vId}`)
    let data: any = res?.data
    if (data && data.data) data = data.data

    if (!data) {
      console.warn('Venta no encontrada:', res)
      return
    }

    // Mapear detalles (acepta idProducto o idReceta)
    if (Array.isArray(data.detalles)) {
      currentOrder.value = (data.detalles as any[]).map((d) => {
        const isProducto = d.idProducto != null && d.idProducto !== undefined
        const isReceta = d.idReceta != null && d.idReceta !== undefined
        const id = isProducto ? d.idProducto : d.idReceta
        const type = isProducto ? 'producto' : 'receta'
        const name =
          d.name ||
          d.nombre ||
          d.nombreReceta ||
          (type === 'producto' ? `Producto #${id}` : `Receta #${id}`)

        const price = Number(d.precioUnitario ?? d.precioUnitarioVenta ?? d.price ?? 0) || 0
        const quantity = Number(d.cantidad ?? d.quantity ?? 0) || 0

        return {
          type,
          id,
          name,
          price,
          quantity,
          subtotal: price * quantity,
        } as DetalleVentaItem
      })
    } else {
      currentOrder.value = []
    }

    tipoPago.value = data.tipoPago || 'EFECTIVO'
    requiereFactura.value = data.requiereFactura || false
    nitCI.value = data.nitCI || ''
    nombreFiscal.value = data.nombreFiscal || ''

    console.debug(`Venta #${vId} cargada con ${currentOrder.value.length} ítems`)
  } catch (err) {
    console.warn(`No se pudo cargar la venta #${vId}:`, err)
  }
}

// -------------------- ON MOUNT --------------------
onMounted(() => {
  loadMenu()
  loadProductosVendibles()
  if (props.initialVentaId) {
    loadVenta(props.initialVentaId)
  }
})

// -------------------- WATCHERS --------------------
watch(
  () => props.initialMesaId,
  (n) => {
    mesaId.value = n
  },
)

watch(
  () => props.initialVentaId,
  (n) => {
    if (n) {
      ventaId.value = n
      loadVenta(n)
    }
  },
)

// -------------------- UNIFIED MENU & FILTRADO --------------------
const allItems = computed<MenuUnifiedItem[]>(() => {
  const recetas = menuItems.value.map((r) => ({
    type: 'receta' as const,
    id: r.id,
    nombre: r.nombreReceta,
    precio: r.precioVentaActual,
    categoria: r.categoria,
    urlImagen: r.urlImagen,
  }))
  const productos = menuProductos.value.map((p) => ({
    type: 'producto' as const,
    id: p.id,
    nombre: p.nombre,
    precio: p.precioVentaUnitario,
    categoria: 'producto',
    urlImagen: p.urlImagen ?? '/img/default-product.jpg',
  }))
  return [...recetas, ...productos]
})

const filteredItems = computed(() => {
  return allItems.value.filter((item) => {
    const matchesCategory =
      selectedCategory.value === 'all' || item.categoria === selectedCategory.value
    const matchesSearch = item.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const uniqueCategories = computed(() => {
  const set = new Set<string>()
  allItems.value.forEach((i) => set.add(i.categoria || 'producto'))
  return ['all', ...Array.from(set)]
})

// -------------------- CARRITO --------------------
const addItemToOrder = (item: MenuUnifiedItem) => {
  const existing = currentOrder.value.find((i) => i.type === item.type && i.id === item.id)
  if (existing) {
    existing.quantity += 1
    existing.subtotal = existing.price * existing.quantity
    return
  }
  currentOrder.value.push({
    type: item.type,
    id: item.id,
    name: item.nombre,
    price: Number(item.precio) || 0,
    quantity: 1,
    subtotal: Number(item.precio) || 0,
  })
}

const updateItemQuantity = (id: number, change: number, type: 'receta' | 'producto') => {
  const item = currentOrder.value.find((i) => i.id === id && i.type === type)
  if (!item) return
  item.quantity += change
  if (item.quantity <= 0) {
    currentOrder.value = currentOrder.value.filter((i) => !(i.id === id && i.type === type))
  } else {
    item.subtotal = item.quantity * item.price
  }
}

// -------------------- CALCULOS --------------------
const totalPagar = computed(() => {
  return currentOrder.value.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0)
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

// -------------------- CHECKOUT / POST --------------------
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

  if (requiereFactura.value && (!nitCI.value || !nombreFiscal.value)) {
    alert('Debe ingresar el NIT/CI y la Razón Social para emitir la factura.')
    return
  }

  if (!mesaId.value || Number(mesaId.value) === 0) {
    alert('La venta debe estar asociada a una mesa válida. Verifique la mesa asignada.')
    return
  }

  const idUsuario = Number(user.value?.id ?? 0)
  if (!idUsuario || idUsuario === 0) {
    alert('No hay un usuario autenticado. Inicie sesión antes de procesar la venta.')
    return
  }

  // Mapear detalles al esquema esperado por el backend
  const detallesVenta = currentOrder.value.map((item) => ({
    idProducto: item.type === 'producto' ? item.id : null,
    idReceta: item.type === 'receta' ? item.id : null,
    cantidad: item.quantity,
    precioUnitario: item.price,
  }))

  const ventaPayload: any = {
    idMesa: Number(mesaId.value),
    idUsuario: idUsuario,
    total: totalPagar.value,
    estado: 'PAGADA',
    tipoPago: tipoPago.value,
    detalles: detallesVenta,
    requiereFactura: requiereFactura.value,
    nitCI: requiereFactura.value ? nitCI.value : '',
    nombreFiscal: requiereFactura.value ? nombreFiscal.value : '',
  }

  try {
    const endpoint = ventaId.value ? `/${ENDPOINT}/${ventaId.value}/pagar` : `/${ENDPOINT}`
    console.debug('Enviando venta:', ventaPayload)
    const res = await axios.post(endpoint, ventaPayload)
    console.info('Venta procesada:', res?.data)
      alert(`✅ Venta procesada con éxito. Total: $${totalPagar.value.toFixed(2)}.`)
      currentOrder.value = []
      montoRecibido.value = null
      if (res?.data?.id) ventaId.value = res.data.id
      // Navegar automáticamente a la vista de Mesas
      try {
        await router.push({ name: 'admin-mesas' })
      } catch (e) {
        // si falla la navegación, emitir el evento de cierre como fallback
        emit('close')
      }
  } catch (error: any) {
    console.error('Error al procesar la venta:', error)
    if (error.response && error.response.data) {
      const serverData = error.response.data
      const msg = serverData.message || serverData.error || JSON.stringify(serverData)
      alert(`❌ Error al procesar la venta: ${msg}`)
    } else if (error.message) {
      alert(`❌ Error al procesar la venta: ${error.message}`)
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
          Mesa Asignada: <strong>{{ mesaId }}</strong> | Venta ID: {{ ventaId || 'Nueva' }}
        </p>
      </div>
      <button class="btn btn-secondary" @click="goToMesas">
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
                  placeholder="Buscar plato o producto..."
                  v-model="searchQuery"
                />
              </div>
              <div class="col-md-5">
                <select class="form-select" v-model="selectedCategory">
                  <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
                    {{ cat === 'all' ? 'Todas las Categorías' : (cat.charAt(0).toUpperCase() + cat.slice(1)) }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 menu-grid scrollable-menu">
          <div v-for="item in filteredItems" :key="item.type + '-' + item.id" class="col-lg-3 col-md-4 col-sm-6">
            <div class="menu-item-card text-center" @click="addItemToOrder(item)">
              <img
                :src="item.urlImagen"
                :alt="item.nombre"
                class="img-fluid rounded mb-2"
                style="height: 100px; object-fit: cover"
              />
              <div class="mb-1">
                <span :class="['badge', item.type === 'receta' ? 'bg-primary' : 'bg-secondary']">
                  {{ item.type === 'receta' ? item.categoria : 'producto' }}
                </span>
              </div>
              <h6 class="mb-0">{{ item.nombre }}</h6>
              <span class="price fw-bold">Bs {{ formatPrice(item.precio) }}</span>
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
              <li v-if="currentOrder.length === 0" class="list-group-item text-muted text-center py-4">
                Agregue ítems del menú.
              </li>

              <li
                v-for="item in currentOrder"
                :key="item.type + '-' + item.id"
                class="list-group-item d-flex align-items-center justify-content-between"
              >
                <div>
                  <span class="badge bg-primary me-2">{{ item.quantity }}x</span>
                  <strong>{{ item.name }}</strong>
                  <small class="text-muted ms-2">({{ item.type }})</small>
                </div>
                <div class="d-flex align-items-center">
                  <div class="btn-group btn-group-sm me-3" role="group">
                    <button
                      class="btn btn-outline-danger"
                      @click="updateItemQuantity(item.id, -1, item.type)"
                    >
                      <i class="fa fa-minus"></i>
                    </button>
                    <button
                      class="btn btn-outline-success"
                      @click="updateItemQuantity(item.id, 1, item.type)"
                    >
                      <i class="fa fa-plus"></i>
                    </button>
                  </div>
                  <div class="fs-5 fw-bold text-end" style="width: 80px">
                    Bs {{ formatPrice(item.subtotal) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="card-footer p-3 bg-light">
            <hr class="my-2" />
            <div class="d-flex justify-content-between align-items-center mb-3 text-primary">
              <h4>TOTAL A PAGAR:</h4>
              <h3 class="fw-bolder">Bs {{ totalPagar.toFixed(2) }}</h3>
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
              <span>Bs {{ vuelto.toFixed(2) }}</span>
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
              <label class="form-check-label" for="requiereFactura">El cliente requiere Factura</label>
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
  max-height: 70vh;
  overflow-y: auto;
}

.sticky-top-card {
  position: sticky;
  top: 20px;
  z-index: 5;
}

.order-list-body {
  max-height: 40vh;
  overflow-y: auto;
}
</style>
