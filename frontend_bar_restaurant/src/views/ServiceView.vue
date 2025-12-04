<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import ServiceCard from '../components/shared/ServiceCard.vue'
import type { Service } from '../types'
import PageHeader from '@/components/shared/PageHeader.vue'

const services = ref<Service[]>([
  {
    id: 1,
    icon: 'fa-glass-cheers',
    title: 'Barra Premium',
    description:
      'Amplia selección de bebidas premium, cócteles exclusivos y tragos artesanales preparados por nuestros expertos mixólogos.',
  },
  {
    id: 2,
    icon: 'fa-utensils',
    title: 'Gastronomía Selecta',
    description:
      'Menú gourmet con ingredientes frescos y platos especiales diseñados para complementar tu experiencia nocturna.',
  },
  {
    id: 3,
    icon: 'fa-music',
    title: 'Karaoke Nights',
    description:
      'Todos los jueves, vive la experiencia de cantar como una estrella con nuestro sistema de karaoke profesional.',
  },
  {
    id: 4,
    icon: 'fa-birthday-cake',
    title: 'Fiestas y Eventos',
    description:
      'Celebra tu cumpleaños, aniversario o evento especial en nuestro lounge privado con capacidad para 50 personas.',
  },
  {
    id: 5,
    icon: 'fa-microphone-alt',
    title: 'Música en Vivo',
    description:
      'Viernes y sábados disfruta de DJs en vivo y grupos musicales que mantendrán la energía de la fiesta.',
  },
  {
    id: 6,
    icon: 'fa-calendar-check',
    title: 'Reservas Online',
    description:
      'Reserva tu mesa o evento especial a través de nuestra plataforma digital de manera rápida y segura.',
  },
  {
    id: 7,
    icon: 'fa-shield-alt',
    title: 'Ambiente Seguro',
    description:
      'Espacio controlado y seguro para que disfrutes con tranquilidad junto a tus amigos y seres queridos.',
  },
  {
    id: 8,
    icon: 'fa-gift',
    title: 'Promociones Especiales',
    description:
      'Happy hours, noches temáticas y descuentos exclusivos para nuestros clientes frecuentes.',
  },
])
</script>

<template>
  <div>
    <PageHeader
      title="Servicios"
      :breadcrumbs="[
        { text: 'Inicio', link: '/' },
        { text: 'Servicios', link: '#' },
      ]"
    />

    <div class="container-xxl py-5">
      <div class="container">
        <SectionTitle
          subtitle="Lo Que Ofrecemos"
          title="Experiencias Únicas en Reset Bar"
        />

        <div class="row g-4">
          <div
            v-for="(service, index) in services"
            :key="service.id"
            class="col-lg-3 col-sm-6 wow fadeInUp"
            :data-wow-delay="`${0.1 + (index % 4) * 0.2}s`"
          >
            <ServiceCard :service="service" />
          </div>
        </div>

        <!-- Sección adicional de información -->
        <div class="row mt-5 pt-5">
          <div class="col-lg-8 mx-auto text-center">
            <div class="service-highlight p-4 rounded">
              <h4 class="mb-3">
                <i class="fa fa-info-circle text-primary me-2"></i>
                ¿Listo para tu próxima celebración?
              </h4>
              <p class="mb-0">
                Contáctanos al <strong>(+591) 65279500</strong> o envíanos un mensaje a
                <strong>resetbarsucre@gmail.com</strong> para reservar tu fecha y hacer
                de tu evento una experiencia inolvidable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-highlight {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.05) 100%);
  border-left: 4px solid var(--bs-primary);
  transition: all 0.3s ease;
}

.service-highlight:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

h4 {
  color: #333;
  font-weight: 600;
}

p {
  color: #666;
  line-height: 1.6;
}

.text-primary {
  color: #0d6efd !important;
}

.rounded {
  border-radius: 12px !important;
}

/* Animación suave para las tarjetas */
.wow.fadeInUp {
  animation-duration: 0.6s;
}
</style>
