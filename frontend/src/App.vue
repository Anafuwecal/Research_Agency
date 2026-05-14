<template>
  <div class="min-h-screen bg-white">
    <Header v-if="!authStore.loading" />
    
    <main v-if="!authStore.loading">
      <router-view />
    </main>

    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <HealthCheck />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import Header from '@/components/common/Header.vue';
import HealthCheck from '@/components/common/HealthCheck.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>