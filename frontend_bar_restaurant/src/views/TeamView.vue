<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import TeamCard from '../components/shared/TeamCard.vue'
import type { TeamMember } from '../types'
import PageHeader from '@/components/shared/PageHeader.vue'

// URLS ÚNICAS CON TIMESTAMP - Esto FORZARÁ nuevas imágenes
const timestamp = Date.now()

const teamMembers = ref<TeamMember[]>([
  {
    id: 1,
    name: 'Carlos Mendoza',
    designation: 'Chef Principal & Parrillero',
    image: `/img/team-1.jpg?t=${timestamp}&force=1`, // Parámetro único
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 2,
    name: 'Lucía Ramírez',
    designation: 'Bartender Ejecutiva',
    image: `https://australianbartender.com.au/wp-content/uploads/2023/04/Kayla.jpg?t=${timestamp}&force=2`,
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 3,
    name: 'Roberto Silva',
    designation: 'Chef Pastelero & Repostero',
    image: `/img/team-3.jpg?t=${timestamp}&force=3`,
    facebook: '#',
    twitter: '#',
    instagram: '#',
  },
  {
    id: 4,
    name: 'Ana Gómez',
    designation: 'Mixóloga & Bar Manager',
    image: `https://tse3.mm.bing.net/th/id/OIP.lgU5Bx8dSVYweolKzaUTZAHaJY?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3?t=${timestamp}&force=4`,
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
        { text: 'Equipo', link: '/team' },
      ]"
    />

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
  </div>
</template>
