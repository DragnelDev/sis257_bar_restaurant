<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '../../types'
import SectionTitle from '../shared/SectionTitle.vue'
import MenuItemCard from '../shared/MenuItem.vue'

type Category = 'breakfast' | 'lunch' | 'dinner' | 'beverager'

const activeTab = ref<Category>('breakfast')

const menuItems = ref<MenuItem[]>([
  {
    id: 1,
    name: 'Tostada Francesa Clásica',
    price: 85,
    description: 'Rebanadas de pan brioche, canela, fruta fresca y sirope de arce.',
    image: '/img/menu-1.jpg',
    category: 'breakfast',
  },
  {
    id: 2,
    name: 'Omelette de la Casa',
    price: 95,
    description: 'Tres huevos, espinacas, champiñones y una mezcla de quesos gouda y mozzarella.',
    image: '/img/menu-2.jpg',
    category: 'breakfast',
  },
  {
    id: 3,
    name: 'Avena con Frutos Rojos',
    price: 60,
    description: 'Avena caliente con leche de almendras, arándanos, fresas y miel de agave.',
    image: '/img/menu-3.jpg',
    category: 'breakfast',
  },
  {
    id: 4,
    name: 'Combo Americano',
    price: 110,
    description: 'Dos huevos revueltos, salchicha de cerdo, papas hash brown y pan tostado.',
    image: '/img/menu-4.jpg',
    category: 'breakfast',
  },
  {
    id: 5,
    name: 'Hamburguesa de Pollo Crunchy',
    price: 115,
    description: 'Filete de pollo crujiente, queso cheddar, pepinillos y salsa de la casa.',
    image: '/img/menu-5.jpg',
    category: 'lunch',
  },
  {
    id: 6,
    name: 'Ensalada César con Camarón',
    price: 140,
    description:
      'Lechuga romana, aderezo César cremoso, crutones hechos en casa y camarones a la parrilla.',
    image: '/img/menu-6.jpg',
    category: 'lunch',
  },
  {
    id: 7,
    name: 'Wrap de Pavo y Aguacate',
    price: 120,
    description: 'Tortilla integral rellena de pechuga de pavo, aguacate, tomate y aderezo ranch.',
    image: '/img/menu-7.jpg',
    category: 'lunch',
  },
  {
    id: 8,
    name: 'Pasta Carbonara Tradicional',
    price: 135,
    description: 'Spaghetti con salsa a base de yema de huevo, queso Pecorino Romano y panceta.',
    image: '/img/menu-8.jpg',
    category: 'lunch',
  },
  {
    id: 9,
    name: 'Salmón a la Parrilla',
    price: 190,
    description: 'Filete de salmón fresco con costra de hierbas y guarnición de espárragos.',
    image: '/img/menu-9.jpg',
    category: 'dinner',
  },
  {
    id: 10,
    name: 'Lomo de Res con Vino Tinto',
    price: 210,
    description: 'Medallón de lomo tierno, bañado en salsa de vino tinto y puré de papa cremoso.',
    image: '/img/menu-10.jpg',
    category: 'dinner',
  },
  {
    id: 11,
    name: 'Pizza Margarita Artesanal',
    price: 150,
    description: 'Masa madre, salsa de tomate San Marzano, mozzarella fresca y albahaca.',
    image: '/img/menu-11.jpg',
    category: 'dinner',
  },
  {
    id: 12,
    name: 'Sopa del Día y Pan de Ajo',
    price: 75,
    description: 'Caldo reconfortante de la receta del chef, perfecto para abrir el apetito.',
    image: '/img/menu-12.jpg',
    category: 'dinner',
  },
  {
    id: 13,
    name: 'Limonada con Menta y Jengibre',
    price: 55,
    description: 'Nuestra versión clásica con un toque de jengibre y hojas frescas de menta.',
    image: '/img/menu-13.jpg',
    category: 'beverager',
  },
  {
    id: 14,
    name: 'Té Helado de Durazno',
    price: 50,
    description: 'Té negro ligeramente endulzado, servido frío con rodajas de durazno natural.',
    image: '/img/menu-14.jpg',
    category: 'beverager',
  },
  {
    id: 15,
    name: 'Jugo Verde Energía',
    price: 70,
    description: 'Mezcla de espinaca, pepino, apio, manzana y un toque de limón.',
    image: '/img/menu-15.jpg',
    category: 'beverager',
  },
  {
    id: 16,
    name: 'Malteada de Oreo',
    price: 95,
    description: 'Leche, helado de vainilla y galletas Oreo trituradas.',
    image: '/img/menu-16.jpg',
    category: 'beverager',
  },
])

const filteredItems = computed(() => {
  return menuItems.value.filter((item) => item.category === activeTab.value)
})

const setActiveTab = (tab: Category) => {
  activeTab.value = tab
}
</script>

<template>
  <div class="container-xxl py-5">
    <div class="container">
      <SectionTitle subtitle="Menú de comida" title="Artículos más populares" />

      <div class="tab-class text-center wow fadeInUp" data-wow-delay="0.1s">
        <ul class="nav nav-pills d-inline-flex justify-content-center border-bottom mb-5">
          <li class="nav-item">
            <a
              class="d-flex align-items-center text-start mx-3 ms-0 pb-3"
              :class="{ active: activeTab === 'breakfast' }"
              @click.prevent="setActiveTab('breakfast')"
              href="#"
            >
              <i class="fa fa-coffee fa-2x text-primary"></i>
              <div class="ps-3">
                <small class="text-body">Desayuno</small>
                <h6 class="mt-n1 mb-0">Popular</h6>
              </div>
            </a>
          </li>
          <li class="nav-item">
            <a
              class="d-flex align-items-center text-start mx-3 pb-3"
              :class="{ active: activeTab === 'lunch' }"
              @click.prevent="setActiveTab('lunch')"
              href="#"
            >
              <i class="fa fa-hamburger fa-2x text-primary"></i>
              <div class="ps-3">
                <small class="text-body">Almuerzo</small>
                <h6 class="mt-n1 mb-0">Especial</h6>
              </div>
            </a>
          </li>
          <li class="nav-item">
            <a
              class="d-flex align-items-center text-start mx-3 me-0 pb-3"
              :class="{ active: activeTab === 'dinner' }"
              @click.prevent="setActiveTab('dinner')"
              href="#"
            >
              <i class="fa fa-utensils fa-2x text-primary"></i>
              <div class="ps-3">
                <small class="text-body">Cena</small>
                <h6 class="mt-n1 mb-0">Deliciosa</h6>
              </div>
            </a>
          </li>
          <li class="nav-item">
            <a
              class="d-flex align-items-center text-start mx-3 me-0 pb-3"
              :class="{ active: activeTab === 'beverager' }"
              @click.prevent="setActiveTab('beverager')"
              href="#"
            >
              <i class="fa fa-glass-martini-alt fa-2x text-primary"></i>
              <div class="ps-3">
                <small class="text-body">Bebidas</small>
                <h6 class="mt-n1 mb-0">Refrescantes</h6>
              </div>
            </a>
          </li>
        </ul>

        <div class="tab-content">
          <div class="row g-4">
            <div v-for="item in filteredItems" :key="item.id" class="col-lg-6">
              <MenuItemCard :item="item" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-pills .nav-link {
  color: #666;
  cursor: pointer;
}

.nav-pills .nav-link.active {
  background: transparent;
  border-bottom: 2px solid var(--primary);
}
</style>
