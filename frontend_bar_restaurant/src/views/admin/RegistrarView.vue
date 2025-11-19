<script setup lang="ts">
import { ref, computed } from 'vue'

// --- 1. INTERFACES (Adaptadas de tu backend) ---
interface Receta {
  id: number
  name: string
  price: number
  category: string
  image: string
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

// --- 4. DATOS DE EJEMPLO DEL MENÚ (Simulación de consulta a /recetas) ---
const menuItems = ref<Receta[]>([
  {
    id: 1,
    name: 'Hamburguesa Clásica',
    price: 35.0,
    category: 'principal',
    image: '/img/hamburguesa.jpg',
  },
  {
    id: 2,
    name: 'Papas Fritas Medianas',
    price: 15.0,
    category: 'acompañamiento',
    image: '/img/papas.jpg',
  },
  { id: 3, name: 'Ribeye Steak', price: 90.0, category: 'principal', image: '/img/ribeye.jpg' },
  {
    id: 4,
    name: 'Gaseosa Cola (Lata)',
    price: 10.0,
    category: 'bebidas',
    image: '/img/gaseosa.jpg',
  },
  { id: 5, name: 'Tiramisú', price: 20.0, category: 'postres', image: '/img/tiramisu.jpg' },
])

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
      selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
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

// --- 6. LÓGICA DE CARRITO (ÍDEM ANTERIOR) ---
const addItemToOrder = (item: Receta) => {
  const existingItem = currentOrder.value.find((i) => i.idReceta === item.id)

  if (existingItem) {
    existingItem.quantity += 1
    existingItem.subtotal = existingItem.quantity * existingItem.price
  } else {
    currentOrder.value.push({
      idReceta: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      subtotal: item.price,
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

  // 2. Construir el objeto de Venta con DATOS FISCALES
  const ventaPayload = {
    idMesa: mesaId.value,
    idUsuario: 1, // Simulación de ID
    total: totalPagar.value,
    estado: 'PAGADA', // CRÍTICO: Activa descuento de stock
    tipoPago: tipoPago.value,
    detalles: detallesVenta,

    // CAMPOS FISCALES
    requiereFactura: requiereFactura.value,
    nitCI: requiereFactura.value ? nitCI.value : null,
    nombreFiscal: requiereFactura.value ? nombreFiscal.value : null,
  }

  try {
    // --- 3. ENVÍO AL BACKEND (NestJS) ---
    const endpoint = ventaId.value ? `/ventas/${ventaId.value}/pagar` : '/ventas'

    console.log(`Enviando venta a ${endpoint}:`, ventaPayload)
    // await axios.post(endpoint, ventaPayload);

    alert(
      `✅ Venta procesada con éxito. Total: $${totalPagar.value.toFixed(2)}. ¡STOCK DESCONTADO!`,
    )

    // 4. Limpiar y Emitir evento para volver
    currentOrder.value = []
    emit('close')
  } catch (error) {
    console.error('Error al procesar la venta:', error)
    alert('❌ Error al procesar la venta. Intente de nuevo.')
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
                  <option value="all">Todas las Categorias</option>
                  <option value="principal">Platos Principales</option>
                  <option value="acompañamiento">Acompañamientos</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="postres">Postres</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 menu-grid scrollable-menu">
          <div v-for="item in filteredItems" :key="item.id" class="col-lg-3 col-md-4 col-sm-6">
            <div class="menu-item-card text-center" @click="addItemToOrder(item)">
              <img
                :src="item.image"
                :alt="item.name"
                class="img-fluid rounded mb-2"
                style="height: 100px; object-fit: cover"
              />
              <h6 class="mb-0">{{ item.name }}</h6>
              <span class="price fw-bold">${{ item.price.toFixed(2) }}</span>
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
                    ${{ item.subtotal.toFixed(2) }}
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
