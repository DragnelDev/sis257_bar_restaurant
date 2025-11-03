<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '../../types'
import SectionTitle from '../shared/SectionTitle.vue'
import MenuItemCard from '../shared/MenuItem.vue'

type Category = 'breakfast' | 'lunch' | 'dinner'

const activeTab = ref<Category>('breakfast')

const menuItems = ref<MenuItem[]>([
  {
    id: 1,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-1.jpg',
    category: 'breakfast',
  },
  {
    id: 2,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-2.jpg',
    category: 'breakfast',
  },
  {
    id: 3,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-3.jpg',
    category: 'breakfast',
  },
  {
    id: 4,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-4.jpg',
    category: 'breakfast',
  },
  {
    id: 5,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-5.jpg',
    category: 'lunch',
  },
  {
    id: 6,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-6.jpg',
    category: 'lunch',
  },
  {
    id: 7,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-7.jpg',
    category: 'dinner',
  },
  {
    id: 8,
    name: 'Chicken Burger',
    price: 115,
    description: 'Ipsum ipsum clita erat amet dolor justo diam',
    image: '/img/menu-8.jpg',
    category: 'dinner',
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
      <SectionTitle subtitle="Food Menu" title="Most Popular Items" />

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
                <small class="text-body">Popular</small>
                <h6 class="mt-n1 mb-0">Breakfast</h6>
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
                <small class="text-body">Special</small>
                <h6 class="mt-n1 mb-0">Launch</h6>
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
                <small class="text-body">Lovely</small>
                <h6 class="mt-n1 mb-0">Dinner</h6>
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
