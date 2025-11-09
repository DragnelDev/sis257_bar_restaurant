<script setup lang="ts">
import { ref } from 'vue'
import type { TeamMember } from '../../types'
import SectionTitle from '../shared/SectionTitle.vue'
import TeamCard from '../shared/TeamCard.vue'

const teamMembers = ref<TeamMember[]>([
  {
    id: 1,
    name: 'John Doe',
    designation: 'Chef Principal',
    image: '/img/team-1.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 2,
    name: 'Jane Smith',
    designation: 'Segundo Chef',
    image: '/img/team-2.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    designation: 'Chef Pastelero',
    image: '/img/team-3.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    designation: 'Chef Ejecutivo',
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
      <SectionTitle subtitle="Miembros del Equipo" title="Nuestros Chefs Maestros" />

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
