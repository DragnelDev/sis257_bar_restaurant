<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '../../types'

const menuItems = ref<MenuItem[]>([
  {
    id: 1,
    name: 'Chicken Burger',
    price: 15,
    description: 'Juicy grilled chicken with fresh vegetables',
    image: '/img/menu-1.jpg',
    category: 'breakfast',
    stock: 25,
    ingredients: ['Chicken', 'Lettuce', 'Tomato', 'Cheese'],
  },
  {
    id: 2,
    name: 'Caesar Salad',
    price: 12,
    description: 'Fresh romaine lettuce with caesar dressing',
    image: '/img/menu-2.jpg',
    category: 'lunch',
    stock: 30,
    ingredients: ['Lettuce', 'Parmesan', 'Croutons'],
  },
  {
    id: 3,
    name: 'Ribeye Steak',
    price: 35,
    description: 'Premium cut grilled to perfection',
    image: '/img/menu-3.jpg',
    category: 'dinner',
    stock: 15,
    ingredients: ['Beef', 'Herbs', 'Butter'],
  },
  {
    id: 4,
    name: 'Margherita Pizza',
    price: 18,
    description: 'Classic Italian pizza with fresh mozzarella',
    image: '/img/menu-4.jpg',
    category: 'lunch',
    stock: 20,
    ingredients: ['Dough', 'Tomato', 'Mozzarella', 'Basil'],
  },
])

const selectedCategory = ref('all')
const searchQuery = ref('')
const showAddModal = ref(false)
const selectedItem = ref<MenuItem | null>(null)

const filteredItems = computed(() => {
  return menuItems.value.filter((item) => {
    const matchesCategory =
      selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const deleteItem = (id: number) => {
  if (confirm('Are you sure you want to delete this menu item?')) {
    menuItems.value = menuItems.value.filter((item) => item.id !== id)
  }
}

const viewItem = (item: MenuItem) => {
  selectedItem.value = item
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    breakfast: 'warning',
    lunch: 'success',
    dinner: 'primary',
  }
  return colors[category] || 'secondary'
}
</script>

<template>
  <div class="menu-management">
    <div class="page-header mb-4">
      <h2 class="mb-1">Menu Management</h2>
      <p class="text-muted">Manage restaurant menu items</p>
    </div>

    <!-- Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card border-primary">
          <div class="stat-icon bg-primary">
            <i class="fa fa-utensils"></i>
          </div>
          <div class="stat-content">
            <h6>Total Items</h6>
            <h3>{{ menuItems.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-warning">
          <div class="stat-icon bg-warning">
            <i class="fa fa-coffee"></i>
          </div>
          <div class="stat-content">
            <h6>Breakfast</h6>
            <h3>{{ menuItems.filter((i) => i.category === 'breakfast').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-success">
          <div class="stat-icon bg-success">
            <i class="fa fa-hamburger"></i>
          </div>
          <div class="stat-content">
            <h6>Lunch</h6>
            <h3>{{ menuItems.filter((i) => i.category === 'lunch').length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card border-info">
          <div class="stat-icon bg-info">
            <i class="fa fa-moon"></i>
          </div>
          <div class="stat-content">
            <h6>Dinner</h6>
            <h3>{{ menuItems.filter((i) => i.category === 'dinner').length }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search menu items..."
                v-model="searchQuery"
              />
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="selectedCategory">
              <option value="all">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
          <div class="col-md-4">
            <button class="btn btn-primary w-100" @click="showAddModal = true">
              <i class="fa fa-plus me-2"></i>Add Menu Item
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Items Grid -->
    <div class="row g-4">
      <div v-for="item in filteredItems" :key="item.id" class="col-lg-3 col-md-4 col-sm-6">
        <div class="menu-item-card">
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
            <span class="category-badge" :class="`bg-${getCategoryColor(item.category)}`">
              {{ item.category }}
            </span>
          </div>
          <div class="item-content">
            <h5>{{ item.name }}</h5>
            <p class="text-muted small">{{ item.description }}</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="price">${{ item.price }}</span>
              <span
                class="stock"
                :class="item.stock && item.stock < 10 ? 'text-danger' : 'text-success'"
              >
                <i class="fa fa-box me-1"></i>
                {{ item.stock }} in stock
              </span>
            </div>
          </div>
          <div class="item-actions">
            <button
              class="btn btn-sm btn-outline-info"
              @click="viewItem(item)"
              data-bs-toggle="modal"
              data-bs-target="#itemModal"
            >
              <i class="fa fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteItem(item.id)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Detail Modal -->
    <div class="modal fade" id="itemModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedItem">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ selectedItem.name }}</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <img
              :src="selectedItem.image"
              :alt="selectedItem.name"
              class="img-fluid rounded mb-3"
            />
            <table class="table">
              <tr>
                <th>Category:</th>
                <td>
                  <span class="badge" :class="`bg-${getCategoryColor(selectedItem.category)}`">
                    {{ selectedItem.category }}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Price:</th>
                <td>${{ selectedItem.price }}</td>
              </tr>
              <tr>
                <th>Stock:</th>
                <td>{{ selectedItem.stock }} units</td>
              </tr>
              <tr>
                <th>Description:</th>
                <td>{{ selectedItem.description }}</td>
              </tr>
              <tr v-if="selectedItem.ingredients">
                <th>Ingredients:</th>
                <td>
                  <span
                    v-for="(ingredient, index) in selectedItem.ingredients"
                    :key="index"
                    class="badge bg-secondary me-1"
                  >
                    {{ ingredient }}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
</style>
