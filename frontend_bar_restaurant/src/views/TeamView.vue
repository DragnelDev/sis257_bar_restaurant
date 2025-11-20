<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import TeamCard from '../components/shared/TeamCard.vue'
import type { TeamMember } from '../types'
import PageHeader from '@/components/shared/PageHeader.vue'

const teamMembers = ref<TeamMember[]>([
  {
    id: 1,
    name: 'John Doe',
    designation: 'Head Chef',
    image: '/img/team-1.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 2,
    name: 'Jane Smith',
    designation: 'Sous Chef',
    image: '/img/team-2.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    designation: 'Pastry Chef',
    image: '/img/team-3.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    designation: 'Executive Chef',
    image: '/img/team-4.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 5,
    name: 'Robert Brown',
    designation: 'Master Chef',
    image: '/img/team-2.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 6,
    name: 'Emily Davis',
    designation: 'Chef de Cuisine',
    image: '/img/team-3.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 7,
    name: 'David Wilson',
    designation: 'Grill Chef',
    image: '/img/team-4.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    designation: 'Prep Chef',
    image: '/img/team-1.jpg',
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
])
</script>

<template>
  <div>
    <PageHeader
      title="Nuestro Equipo"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Pagina', link: '#' },
        { text: 'Equipo', link: '/team' },
      ]"
    />

    <div class="container-xxl pt-5 pb-3">
      <div class="container">
        <SectionTitle subtitle="Miembros del Equipo" title="Nuestros Chefs Maestros" />

        <div class="row g-4">
          <div
            v-for="(member, index) in teamMembers"
            :key="member.id"
            class="col-lg-3 col-md-6 wow fadeInUp"
            :data-wow-delay="`${0.1 + (index % 4) * 0.2}s`"
          >
            <TeamCard :member="member" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
