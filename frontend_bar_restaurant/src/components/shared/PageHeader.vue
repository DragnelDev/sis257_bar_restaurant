<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Breadcrumb {
  text: string
  link: string
}

interface Props {
  title: string
  breadcrumbs: Breadcrumb[]
}

defineProps<Props>()
</script>

<template>
  <div class="container-xxl position-relative p-0">
    <div class="container-xxl py-5 bg-dark hero-header mb-5">
      <div class="container text-center my-5 pt-5 pb-4">
        <h1 class="display-3 text-white mb-3 animated slideInDown">
          {{ title }}
        </h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb justify-content-center text-uppercase">
            <li
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
              class="breadcrumb-item"
              :class="{ active: index === breadcrumbs.length - 1 }"
            >
              <RouterLink v-if="index < breadcrumbs.length - 1" :to="crumb.link">
                {{ crumb.text }}
              </RouterLink>
              <span v-else class="text-white">
                {{ crumb.text }}
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-header {
  background:
    linear-gradient(rgba(15, 23, 43, 0.9), rgba(15, 23, 43, 0.9)), url('/img/bg-hero.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}

.breadcrumb-item a {
  color: var(--primary);
  text-decoration: none;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '/';
  color: rgba(255, 255, 255, 0.5);
}

.animated {
  animation-duration: 1s;
}

.slideInDown {
  animation-name: slideInDown;
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
