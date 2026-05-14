<template>
  <div v-if="!healthy" class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
    Backend server is offline
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const healthy = ref(true);

onMounted(async () => {
  try {
    await axios.get('http://localhost:3000/health', { timeout: 5000 });
    healthy.value = true;
  } catch (error) {
    healthy.value = false;
    console.error('Backend health check failed:', error);
  }
});
</script>