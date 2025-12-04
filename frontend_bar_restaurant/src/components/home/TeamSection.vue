<script setup lang="ts">
import { ref } from 'vue'
import type { TeamMember } from '../../types'
import SectionTitle from '../shared/SectionTitle.vue'
import TeamCard from '../shared/TeamCard.vue'

const teamMembers = ref<TeamMember[]>([
  {
    id: 1,
    name: 'Carlos Mendoza',
    designation: 'Chef Principal & Parrillero',
    image: '/img/team-1.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 2,
    name: 'Lucía Ramírez',
    designation: 'Bartender Ejecutiva',
    image: '/img/team-2.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 3,
    name: 'Roberto Silva',
    designation: 'Chef Pastelero & Repostero',
    image: '/img/team-3.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 4,
    name: 'Ana Gómez',
    designation: 'Mixóloga & Bar Manager',
    image: '/img/team-4.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
])
</script>

<template>
  <div class="container-xxl pt-5 pb-3">
    <div class="container">
      <SectionTitle subtitle="Miembros del Equipo" title="Nuestros Chefs & Bartenders" />

      <div class="row g-4">
        <div
          v-for="(member, index) in teamMembers"
          :key="member.id"
          class="col-lg-3 col-md-6 wow fadeInUp"
          :data-wow-delay="`${0.1 + index * 0.2}s`"
        >
          <TeamCard :member="member" />
        </div>
      </div>
    </div>
  </div>
</template>
