<template>
  <div class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <HistoryList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useResearchStore } from '@/stores/research.store';
import HistoryList from '@/components/history/HistoryList.vue';

const researchStore = useResearchStore();

onMounted(async () => {
  await researchStore.loadHistory();
});
</script>