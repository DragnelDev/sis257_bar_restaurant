<script setup lang="ts">
import type { TeamMember } from '../../types'

interface Props {
  member: TeamMember
}

defineProps<Props>()
</script>

<template>
  <div class="team-item text-center rounded overflow-hidden">
    <div class="rounded-circle overflow-hidden m-4">
      <img class="img-fluid" :src="member.image" :alt="member.name" />
    </div>
    <h5 class="mb-0">{{ member.name }}</h5>
    <small>{{ member.designation }}</small>
    <div class="d-flex justify-content-center mt-3">
      <a v-if="member.facebook" class="btn btn-square btn-primary mx-1" :href="member.facebook">
        <i class="fab fa-facebook-f"></i>
      </a>
      <a v-if="member.twitter" class="btn btn-square btn-primary mx-1" :href="member.twitter">
        <i class="fab fa-twitter"></i>
      </a>
      <a v-if="member.instagram" class="btn btn-square btn-primary mx-1" :href="member.instagram">
        <i class="fab fa-instagram"></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
.team-item {
  box-shadow: 0 0 45px rgba(0, 0, 0, 0.08);
  padding-bottom: 20px;
  transition: 0.5s;
}

.team-item:hover {
  background: var(--primary);
}

.team-item:hover h5,
.team-item:hover small {
  color: white;
}

.rounded-circle {
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.rounded-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-square {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
