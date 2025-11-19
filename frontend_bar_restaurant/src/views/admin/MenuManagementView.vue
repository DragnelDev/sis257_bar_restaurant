<script setup lang="ts">
import { ref, computed } from 'vue'

// Adaptar la interfaz para que sea más simple (solo datos de Recetas)
interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  image: string
  category: string
  // 'stock' ya no se usa para el plato terminado en el modelo 'Bajo Pedido'
}

// Nueva Interfaz para la línea de pedido (simula detalle_ventas)
interface OrderItem {
  idReceta: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

// --- 1. DATOS DE EJEMPLO Y ESTADO ---
const menuItems = ref<MenuItem[]>([
  {
    id: 1,
    name: 'Hamburguesa Clásica',
    price: 35.0,
    description: 'Carne, queso y pan brioche.',
    image: '/img/menu-1.jpg',
    category: 'principal',
  },
  {
    id: 2,
    name: 'Papas Medianas',
    price: 15.0,
    description: '200g de papas fritas.',
    image: '/img/menu-2.jpg',
    category: 'acompañamiento',
  },
  {
    id: 3,
    name: 'Ribeye Steak',
    price: 90.0,
    description: 'Corte premium a la parrilla.',
    image: '/img/menu-3.jpg',
    category: 'principal',
  },
  {
    id: 4,
    name: 'Gaseosa Cola (Lata)',
    price: 10.0,
    description: 'Refresco embotellado.',
    image: '/img/menu-4.jpg',
    category: 'bebidas',
  },
])

const selectedCategory = ref('all')
const searchQuery = ref('')
const selectedItem = ref<MenuItem | null>(null) // Para el modal de detalle

// ESTADO CLAVE PARA LA VENTA
const currentOrder = ref<OrderItem[]>([]) // El carrito / La orden actual
const orderTotal = computed(() => {
  return currentOrder.value.reduce((sum, item) => sum + item.subtotal, 0)
})

// --- 2. LÓGICA DE FILTRADO Y VISUALIZACIÓN ---
const filteredItems = computed(() => {
  // Las categorías se adaptan a las que tienes en tu backend (ej: Carnes, Bebidas, etc.)
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

// --- 3. LÓGICA DE VENTA ---

// Función para añadir/incrementar un ítem a la orden
const addItemToOrder = (item: MenuItem) => {
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

// Función para remover o decrementar un ítem
const updateItemQuantity = (idReceta: number, change: number) => {
  const item = currentOrder.value.find((i) => i.idReceta === idReceta)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      // Eliminar si la cantidad es cero o menos
      currentOrder.value = currentOrder.value.filter((i) => i.idReceta !== idReceta)
    } else {
      item.subtotal = item.quantity * item.price
    }
  }
}

// Función para enviar la venta al backend (NestJS)
const checkout = () => {
  if (currentOrder.value.length === 0) {
    alert('La orden está vacía.')
    return
  }

  // 1. Mapear la orden al formato DTO del backend (detalle_ventas)
  const detallesVenta = currentOrder.value.map((item) => ({
    idReceta: item.idReceta,
    cantidad: item.quantity,
    precioUnitarioVenta: item.price,
  }))

  // 2. Construir el objeto de Venta (simulando los IDs de usuario y mesa)
  const ventaPayload = {
    idMesa: 1, // Se debe obtener dinámicamente
    idUsuario: 2, // Se debe obtener dinámicamente (cajero logueado)
    total: orderTotal.value,
    estado: 'PAGADA', // Simplemente lo marcamos como pagada al cerrar
    tipoPago: 'EFECTIVO', // Se debería seleccionar en un modal
    detalles: detallesVenta,
    // Aquí se agregarían nitCI y nombreFiscal si se requiere factura
  }

  // 3. ENVÍO AL BACKEND (NestJS)
  console.log('Enviando Venta al Servidor (NestJS):', ventaPayload)
  alert(`Venta por $${orderTotal.value.toFixed(2)} simulada con éxito. (Consola para ver Payload)`)

  // Limpiar la orden después de un checkout exitoso
  currentOrder.value = []
}
</script>

<template>
  <div class="menu-pos container-fluid p-4">
    <div class="page-header mb-4">
      <h2 class="mb-1">Toma de Pedidos (POS)</h2>
      <p class="text-muted">Mesa 1 | Cajero: Ana Gómez</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text"><i class="fa fa-search"></i></span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Buscar plato..."
                    v-model="searchQuery"
                  />
                </div>
              </div>
              <div class="col-md-6">
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

        <div class="row g-4 menu-grid">
          <div v-for="item in filteredItems" :key="item.id" class="col-lg-4 col-md-6 col-sm-12">
            <div class="menu-item-card" @click="addItemToOrder(item)">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
                <span class="category-badge" :class="`bg-${getCategoryColor(item.category)}`">
                  {{ item.category }}
                </span>
              </div>
              <div class="item-content">
                <h5>{{ item.name }}</h5>
                <p class="text-muted small">{{ item.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="price">${{ item.price.toFixed(2) }}</span>
                  <button class="btn btn-sm btn-primary">
                    <i class="fa fa-cart-plus me-1"></i>Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card order-summary">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Orden Actual (Mesa 1)</h5>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush order-list">
              <li v-if="currentOrder.length === 0" class="list-group-item text-muted text-center">
                El carrito está vacío.
              </li>
              <li
                v-for="item in currentOrder"
                :key="item.idReceta"
                class="list-group-item d-flex align-items-center justify-content-between"
              >
                <div>
                  <span class="badge bg-primary me-2">{{ item.quantity }}x</span>
                  <strong>{{ item.name }}</strong>
                  <div class="text-muted small">${{ item.price.toFixed(2) }} c/u</div>
                </div>
                <div class="d-flex align-items-center">
                  <div class="me-3 fs-5 fw-bold">${{ item.subtotal.toFixed(2) }}</div>
                  <button
                    class="btn btn-sm btn-outline-secondary me-1"
                    @click="updateItemQuantity(item.idReceta, -1)"
                  >
                    <i class="fa fa-minus"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="updateItemQuantity(item.idReceta, 1)"
                  >
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5>Total:</h5>
              <h4 class="text-primary fw-bold">${{ orderTotal.toFixed(2) }}</h4>
            </div>

            <button
              class="btn btn-success w-100 btn-lg"
              :disabled="currentOrder.length === 0"
              @click="checkout"
            >
              <i class="fa fa-cash-register me-2"></i> Procesar Pago y Cerrar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  border-left: 4px solid;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-content h6 {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.menu-item-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.menu-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.item-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

.item-content {
  padding: 15px;
}

.item-content h5 {
  color: var(--dark);
  font-weight: 600;
  margin-bottom: 8px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.stock {
  font-size: 14px;
  font-weight: 600;
}

.item-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #e9ecef;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Estilos específicos del POS - Se aumento*/
.menu-item-card {
  /* Toda la tarjeta es clicable para añadir al carrito */
  cursor: pointer;
}

/* Estilo para la lista de la orden */
.order-summary {
  position: sticky;
  top: 20px; /* Fija el carrito mientras se desplaza el menú */
}

.order-list {
  max-height: 550px; /* Limita la altura del carrito */
  overflow-y: auto;
}

.order-list .list-group-item {
  padding: 15px;
}
</style>
